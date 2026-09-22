import type { Where } from "payload";
import type { AdFilter } from "@/features/ads/schemas";

// ponytail: substring `contains` on three text columns instead of a real search
// index (the Drizzle tsvector this replaced). Fine at this catalog size; upgrade
// to Postgres full-text search or a hosted search index if relevance/scale matters.
// The Local API defaults to overrideAccess: true, so the `publishedOrLoggedIn`
// access rule never runs for site queries — every public read must carry the
// status filter itself.
const publishedOnly = { _status: { equals: "published" } } as const;

export function buildAdBySlugWhere(slug: string): Where {
  return { slug: { equals: slug }, ...publishedOnly };
}

export function buildAdsWhere(filter: AdFilter): Where {
  const where: Where = { ...publishedOnly };

  if (filter.adTypes.length > 0) {
    where["adTypes.slug"] = { in: filter.adTypes };
  }
  if (filter.categories.length > 0) {
    where["category.slug"] = { in: filter.categories };
  }
  if (filter.clients.length > 0) {
    where["client.slug"] = { in: filter.clients };
  }
  if (filter.contentTypes.length > 0) {
    where["contentTypes.slug"] = { in: filter.contentTypes };
  }
  if (filter.industries.length > 0) {
    where["industry.slug"] = { in: filter.industries };
  }
  if (filter.platforms.length > 0) {
    where["platform.slug"] = { in: filter.platforms };
  }

  // Postgres DESC defaults to NULLS FIRST and Payload's drizzle order-by emits no
  // NULLS LAST, so unrated ads would head a best-rated ranking. They have no place
  // in that ranking at all, so drop them from the result set instead.
  if (filter.sort === "score") {
    where.overallScore = { exists: true };
  }

  const search = filter.search.trim();
  if (search.length > 0) {
    where.or = [
      { thumbnailTitle: { contains: search } },
      { caption: { contains: search } },
      { name: { contains: search } },
    ];
  }

  return where;
}
