"use server";

import { z } from "zod";
import type { AdListItem } from "@/entities/ad";
import { getAdsByIds } from "@/features/ads/queries/get-ads-by-slugs";

const idsSchema = z.array(z.number().int().positive()).max(500);

// A "use server" action is a public endpoint; it only ever returns published ads,
// which are public anyway, so the admin builder needs no extra auth check here.
export async function getAdsByIdsAction(ids: unknown): Promise<AdListItem[]> {
  return getAdsByIds(idsSchema.parse(ids));
}
