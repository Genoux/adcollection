import { cache } from "react";
import { getPublishedAds } from "@/features/ads/queries/get-published-ads";
import { adFilterSchema } from "@/features/ads/schemas";

const LATEST_LIMIT = 10;

export const getLatestAds = cache(async () => {
  const { items } = await getPublishedAds(adFilterSchema.parse({ limit: LATEST_LIMIT }));
  return items;
});
