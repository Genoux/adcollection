import { cache } from "react";
import { toAdDetail } from "@/entities/ad";
import { buildAdBySlugWhere } from "@/features/ads/queries/build-ads-where";
import type { Ad } from "@/payload-types";
import { getPayloadClient } from "@/shared/lib/payload";

export const getAdBySlug = cache(async (slug: string) => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "ads",
    where: buildAdBySlugWhere(slug),
    // The client logo sits one level below the ad.
    depth: 2,
    limit: 1,
  });

  const ad = docs[0] as Ad | undefined;
  return ad ? toAdDetail(ad) : null;
});
