import { cache } from "react";
import { getPublishedAds } from "@/features/ads/queries/get-published-ads";
import { adFilterSchema } from "@/features/ads/schemas";

// A multiple of the grid's 4 and 2 column layouts, so the last row is never half empty.
const LATEST_LIMIT = 12;

export const getLatestAds = cache(async () => {
  const { items } = await getPublishedAds(adFilterSchema.parse({ limit: LATEST_LIMIT }));
  return items;
});
