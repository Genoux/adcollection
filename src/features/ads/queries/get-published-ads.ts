import { cache } from "react";
import { type AdListItem, toAdListItem } from "@/entities/ad";
import { buildAdsWhere } from "@/features/ads/queries/build-ads-where";
import type { AdFilter, AdSort } from "@/features/ads/schemas";
import type { Ad } from "@/payload-types";
import { getPayloadClient } from "@/shared/lib/payload";

export type PublishedAdsResult = {
  items: AdListItem[];
  nextCursor: number | null;
};

// Scores and titles repeat, and offset pagination over tied rows can repeat or
// skip ads between pages, so every non-unique key gets createdAt as a tiebreaker.
const SORT_FIELDS: Record<AdSort, string[]> = {
  newest: ["-createdAt"],
  oldest: ["createdAt"],
  score: ["-overallScore", "-createdAt"],
  "title-asc": ["sortTitle", "-createdAt"],
  "title-desc": ["-sortTitle", "-createdAt"],
};

export const getPublishedAds = cache(async (filter: AdFilter): Promise<PublishedAdsResult> => {
  const payload = await getPayloadClient();
  const page = filter.cursor ?? 1;

  const result = await payload.find({
    collection: "ads",
    where: buildAdsWhere(filter),
    sort: SORT_FIELDS[filter.sort],
    depth: 1,
    page,
    limit: filter.limit,
  });

  return {
    items: (result.docs as Ad[]).flatMap((ad) => toAdListItem(ad) ?? []),
    nextCursor: result.hasNextPage ? page + 1 : null,
  };
});
