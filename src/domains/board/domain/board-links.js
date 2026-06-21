export const BOARD_ALL_CATEGORY = "all";

const CATEGORY_LABEL_BY_SLUG = {
  broadcast: "방송",
  cheer: "응원",
  contest_qa: "콘테스트 Q&A",
  question: "질문",
  report: "신고건의",
  talk: "잡담",
};

export function buildBoardHref({ categorySlug, sort, q, page } = {}) {
  const qs = new URLSearchParams();
  if (categorySlug && categorySlug !== BOARD_ALL_CATEGORY) qs.set("category", categorySlug);
  if (sort && sort !== "recent") qs.set("sort", sort);
  if (q) qs.set("q", q);
  if (page > 1) qs.set("page", String(page));
  const s = qs.toString();
  return s ? `/board?${s}` : "/board";
}

export function buildBoardNewHref(categorySlug) {
  if (!categorySlug || categorySlug === BOARD_ALL_CATEGORY) return "/board/new";
  return `/board/new?category=${encodeURIComponent(categorySlug)}`;
}

export function resolveBoardCategoryLabel(post, fallback = "글") {
  const categoryName = post?.categoryName || post?.categoryLabel;
  if (categoryName && categoryName !== "글") return categoryName;
  if (post?.categorySlug && CATEGORY_LABEL_BY_SLUG[post.categorySlug]) {
    return CATEGORY_LABEL_BY_SLUG[post.categorySlug];
  }
  if (post?.categoryId && CATEGORY_LABEL_BY_SLUG[post.categoryId]) {
    return CATEGORY_LABEL_BY_SLUG[post.categoryId];
  }
  if (post?.category && post.category !== "글") return post.category;
  return categoryName || post?.category || fallback;
}
