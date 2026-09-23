import { cache } from "react";
import { type AdListItem, toAdListItem } from "@/entities/ad";
import type { Ad } from "@/payload-types";
import { getPayloadClient } from "@/shared/lib/payload";

// Postgres caps bind parameters per statement, and an unbounded IN list from
// client-held input is untrusted. Slice before it reaches the driver.
const MAX_KEYS = 500;

// Preserves the caller's order so favorites reflect save order and collections
// reflect curation order, rather than whatever order the database returns.
async function getPublishedAdsInOrder<K extends "id" | "slug">(
  key: K,
  values: readonly AdListItem[K][],
): Promise<AdListItem[]> {
  if (values.length === 0) return [];

  const payload = await getPayloadClient();
  const bounded = values.slice(0, MAX_KEYS);
  const { docs } = await payload.find({
    collection: "ads",
    where: { [key]: { in: bounded }, _status: { equals: "published" } },
    depth: 1,
    limit: bounded.length,
  });

  const items = (docs as Ad[]).flatMap((ad) => toAdListItem(ad) ?? []);
  const byKey = new Map(items.map((item) => [item[key], item]));
  return bounded.flatMap((value) => byKey.get(value) ?? []);
}

export const getAdsBySlugs = cache((slugs: readonly string[]) =>
  getPublishedAdsInOrder("slug", slugs),
);

export const getAdsByIds = cache((ids: readonly number[]) => getPublishedAdsInOrder("id", ids));
