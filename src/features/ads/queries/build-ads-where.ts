import type { Where } from "payload";
import type { AdFilter } from "@/features/ads/schemas";

// The Local API defaults to overrideAccess: true, so the `publishedOrLoggedIn`
// access rule never runs for site queries — every public read must carry the
// status filter itself.
const publishedOnly = { _status: { equals: "published" } } as const;

const FACET_PATHS = {
  contentTypes: "contentTypes.slug",
  industries: "industry.slug",
  angles: "angles.slug",
  platforms: "platform.slug",
  objectives: "objective.slug",
  niches: "niches.slug",
  markets: "markets.slug",
} satisfies Partial<Record<keyof AdFilter, string>>;

type FacetKey = keyof typeof FACET_PATHS;

// ponytail: substring `contains` across own text, credits and tag names instead
// of a real search index (the Drizzle tsvector this replaced). Fine at this
// catalog size; upgrade to Postgres full-text search or a hosted search index if
// relevance or scale starts to matter.
const SEARCH_PATHS = [
  "thumbnailTitle",
  "name",
  "caption",
  "soundName",
  "creator.handle",
  "client.name",
  "client.handle",
  "contentTypes.name",
  "industry.name",
  "niches.name",
  "angles.name",
  "platform.name",
  "objective.name",
  "markets.name",
];

// Every word must match somewhere, so "skincare tiktok" narrows to skincare ads
// on TikTok instead of widening to either. Leading @/# is dropped because handles
// and tags are stored bare.
function toSearchWords(search: string): string[] {
  return search
    .split(/\s+/)
    .map((word) => word.replace(/^[@#]+/, ""))
    .filter(Boolean);
}

export function buildAdBySlugWhere(slug: string): Where {
  return { slug: { equals: slug }, ...publishedOnly };
}

export function buildAdsWhere(filter: AdFilter): Where {
  const facets = Object.entries(FACET_PATHS)
    .filter(([key]) => filter[key as FacetKey].length > 0)
    .map(([key, path]) => [path, { in: filter[key as FacetKey] }]);
  const where: Where = { ...publishedOnly, ...Object.fromEntries(facets) };

  // Postgres DESC defaults to NULLS FIRST and Payload's drizzle order-by emits no
  // NULLS LAST, so unrated ads would head a best-rated ranking. They have no place
  // in that ranking at all, so drop them from the result set instead.
  if (filter.sort === "score") {
    where.overallScore = { exists: true };
  }

  const words = toSearchWords(filter.search);
  if (words.length > 0) {
    where.and = words.map((word) => ({
      or: SEARCH_PATHS.map((path) => ({ [path]: { contains: word } })),
    }));
  }

  return where;
}
