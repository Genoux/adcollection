import { cache } from "react";
import { toAdListItem } from "@/entities/ad";
import type { Ad } from "@/payload-types";
import { getPayloadClient } from "@/shared/lib/payload";

const RELATED_LIMIT = 4;

const idOf = (value: number | { id: number }) => (typeof value === "number" ? value : value.id);

export const getRelatedAds = cache(async (adId: number) => {
  const payload = await getPayloadClient();
  const current = (await payload.findByID({ collection: "ads", id: adId, depth: 0 })) as Ad;

  const industryId = current.industry ? idOf(current.industry) : undefined;
  const angleIds = (current.angles ?? []).map(idOf);

  if (!industryId && angleIds.length === 0) return [];

  const { docs } = await payload.find({
    collection: "ads",
    where: {
      _status: { equals: "published" },
      id: { not_equals: adId },
      or: [
        ...(industryId ? [{ industry: { equals: industryId } }] : []),
        ...(angleIds.length > 0 ? [{ angles: { in: angleIds } }] : []),
      ],
    },
    sort: "-createdAt",
    depth: 1,
    limit: RELATED_LIMIT,
  });

  return (docs as Ad[]).flatMap((ad) => toAdListItem(ad) ?? []);
});
