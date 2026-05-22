import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function rel(filePath) {
  return path.relative(root, filePath).split(path.sep).join("/");
}

function fail(message) {
  failures.push(message);
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.isFile() && /\.(js|jsx|mjs|ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function appPages(dir) {
  if (!existsSync(dir)) return [];
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...appPages(fullPath));
    if (entry.isFile() && entry.name === "page.jsx") files.push(fullPath);
  }
  return files;
}

for (const legacyDir of ["src/components", "src/lib", "src/features/contests"]) {
  if (existsSync(path.join(root, legacyDir))) fail(`${legacyDir} must not exist`);
}

if (!existsSync(path.join(root, "src/features/events/contests"))) {
  fail("src/features/events/contests must exist");
}

for (const file of walk(path.join(root, "src"))) {
  const content = readFileSync(file, "utf8");
  if (content.includes("@/components")) fail(`${rel(file)} imports @/components`);
  if (content.includes("@/lib")) fail(`${rel(file)} imports @/lib`);
}

const routeShells = [
  ["src/app/contests/page.jsx", "@/features/events/contests/screens/ContestListScreen"],
  ["src/app/contests/[id]/page.jsx", "@/features/events/contests/screens/ContestDetailScreen"],
  ["src/app/contests/[id]/new/page.jsx", "@/features/events/contests/screens/ContestEntryFormScreen"],
  ["src/app/contests/[id]/results/page.jsx", "@/features/events/contests/screens/ContestResultsScreen"],
  ["src/app/contests/[id]/vote/page.jsx", "@/features/events/contests/screens/ContestVoteScreen"],
  ["src/app/admin/contests/new/page.jsx", "@/features/events/contests/screens/AdminContestCreateScreen"],
  ["src/app/admin/contests/[id]/page.jsx", "@/features/events/contests/screens/AdminContestDetailScreen"],
  ["src/app/events/history/page.jsx", "@/features/events/history/EventHistoryScreen"],
];

for (const [route, screenImport] of routeShells) {
  const file = path.join(root, route);
  if (!existsSync(file)) {
    fail(`${route} is missing`);
    continue;
  }
  const content = readFileSync(file, "utf8");
  const lines = content.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length > 12) fail(`${route} must stay a thin route shell`);
  if (content.includes('"use client"') || content.includes("'use client'")) {
    fail(`${route} must not own client state`);
  }
  if (!content.includes(screenImport)) fail(`${route} must import ${screenImport}`);
}

for (const file of appPages(path.join(root, "src/app"))) {
  const content = readFileSync(file, "utf8");
  const lines = content.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length > 12) fail(`${rel(file)} must stay a thin route shell`);
  if (content.includes('"use client"') || content.includes("'use client'")) {
    fail(`${rel(file)} must not own client state`);
  }
  if (!content.includes("@/features/")) fail(`${rel(file)} must compose a feature screen`);
}

if (failures.length > 0) {
  console.error("Architecture check failed:");
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log("Architecture check passed.");
