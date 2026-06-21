import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const requiredRoots = ["src/app", "src/domains", "src/shared"];
const forbiddenRoots = ["src/components", "src/features", "src/lib"];
const ignoredDirs = new Set(["node_modules", ".next", "dist"]);

function fail(message) {
  failures.push(message);
}

function rel(filePath) {
  return path.relative(root, filePath).split(path.sep).join("/");
}

function walk(dir, matcher = /\.(js|jsx|mjs|ts|tsx)$/u) {
  if (!existsSync(dir)) return [];
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(fullPath, matcher));
    if (entry.isFile() && matcher.test(entry.name)) files.push(fullPath);
  }
  return files;
}

function appPages(dir) {
  return walk(dir).filter((file) => path.basename(file) === "page.jsx");
}

for (const required of requiredRoots) {
  if (!existsSync(path.join(root, required))) fail(`${required} must exist`);
}

for (const forbidden of forbiddenRoots) {
  if (existsSync(path.join(root, forbidden))) fail(`${forbidden} must not exist`);
}

for (const file of walk(path.join(root, "src"))) {
  const content = readFileSync(file, "utf8");
  if (content.includes("@/features/")) fail(`${rel(file)} imports legacy @/features`);
  if (content.includes("@/components/")) fail(`${rel(file)} imports legacy @/components`);
  if (content.includes("@/lib/")) fail(`${rel(file)} imports legacy @/lib`);
}

for (const page of appPages(path.join(root, "src/app"))) {
  const content = readFileSync(page, "utf8");
  const lines = content.trim().split(/\r?\n/u).filter(Boolean);
  if (lines.length > 12) fail(`${rel(page)} must stay a thin route shell`);
  if (content.includes('"use client"') || content.includes("'use client'")) {
    fail(`${rel(page)} must not own client state`);
  }
  if (!content.includes("@/domains/") || !content.includes("/presentation/")) {
    fail(`${rel(page)} must compose a domain presentation screen`);
  }
}

const layerNames = new Set(["application", "domain", "infrastructure", "presentation"]);

function assertDomainNode(dir) {
  const entries = readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  const layerEntries = entries.filter((entry) => layerNames.has(entry.name));
  const contextEntries = entries.filter((entry) => !layerNames.has(entry.name));

  if (layerEntries.length === 0 && contextEntries.length === 0) {
    fail(`${rel(dir)} must expose a hexagonal layer or child context`);
  }

  for (const context of contextEntries) {
    assertDomainNode(path.join(dir, context.name));
  }
}

for (const domainDir of readdirSync(path.join(root, "src/domains"), { withFileTypes: true })) {
  if (domainDir.isDirectory()) assertDomainNode(path.join(root, "src/domains", domainDir.name));
}

for (const file of walk(path.join(root, "src/domains"))) {
  const normalized = rel(file);
  const content = readFileSync(file, "utf8");
  if (normalized.includes("/domain/")) {
    for (const forbidden of ["react", "next/", "@/shared/api/", "/presentation/", "/infrastructure/"]) {
      if (content.includes(forbidden)) fail(`${normalized} domain layer imports ${forbidden}`);
    }
  }
  if (normalized.includes("/infrastructure/") && content.includes("/presentation/")) {
    fail(`${normalized} infrastructure layer imports presentation`);
  }
}

const contestRoutes = [
  ["src/app/contests/page.jsx", "@/domains/events/contests/presentation/screens/ContestListScreen"],
  ["src/app/contests/[id]/page.jsx", "@/domains/events/contests/presentation/screens/ContestDetailScreen"],
  ["src/app/contests/[id]/new/page.jsx", "@/domains/events/contests/presentation/screens/ContestEntryFormScreen"],
  ["src/app/contests/[id]/results/page.jsx", "@/domains/events/contests/presentation/screens/ContestResultsScreen"],
  ["src/app/contests/[id]/vote/page.jsx", "@/domains/events/contests/presentation/screens/ContestVoteScreen"],
  ["src/app/admin/contests/new/page.jsx", "@/domains/events/contests/presentation/screens/AdminContestCreateScreen"],
  ["src/app/admin/contests/[id]/page.jsx", "@/domains/events/contests/presentation/screens/AdminContestDetailScreen"],
  ["src/app/events/history/page.jsx", "@/domains/events/history/presentation/screens/EventHistoryScreen"],
];

for (const [route, screenImport] of contestRoutes) {
  const file = path.join(root, route);
  if (!existsSync(file)) {
    fail(`${route} is missing`);
    continue;
  }
  const content = readFileSync(file, "utf8");
  if (!content.includes(screenImport)) fail(`${route} must import ${screenImport}`);
}

if (!existsSync(path.join(root, "src/domains/events/contests/presentation"))) {
  fail("src/domains/events/contests/presentation must exist");
}

const routeCount = appPages(path.join(root, "src/app")).length;
if (routeCount < 1) fail("src/app must expose at least one route shell");

for (const route of appPages(path.join(root, "src/app"))) {
  if (!statSync(route).isFile()) fail(`${rel(route)} is not a file`);
}

if (failures.length > 0) {
  console.error("Architecture check failed:");
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log("Architecture check passed.");
