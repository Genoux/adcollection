import { cache } from "react";
import type { AdListItem } from "@/entities/ad";
import { getAdsByIds } from "@/features/ads/queries/get-ads-by-slugs";
import { getPayloadClient } from "@/shared/lib/payload";

export type SharedCollection = {
  title: string;
  description: string | null;
  ads: AdListItem[];
};

// The Local API skips the logged-in-only read rule on purpose: holding the share
// id is what grants access to a collection.
export const getSharedCollection = cache(
  async (shareId: string): Promise<SharedCollection | null> => {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "ad-collections",
      where: { shareId: { equals: shareId } },
      depth: 0,
      limit: 1,
    });

    const collection = docs[0];
    if (!collection) return null;

    const adIds = (collection.ads ?? []).map((ad) => (typeof ad === "number" ? ad : ad.id));
    return {
      title: collection.title,
      description: collection.description ?? null,
      ads: await getAdsByIds(adIds),
    };
  },
);
