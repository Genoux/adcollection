import { cache } from "react";
import type { Media } from "@/payload-types";
import { getPayloadClient } from "@/shared/lib/payload";

export type BannerLogo = { id: string; name: string; url: string; width: number; height: number };

export const getBannerLogos = cache(async (): Promise<BannerLogo[]> => {
  const payload = await getPayloadClient();
  const { logos } = await payload.findGlobal({ slug: "logo-banner", depth: 1 });
  return (logos ?? []).flatMap(({ id, name, logo }) => {
    const media = logo as Media | number;
    if (typeof media !== "object" || !media.url || !id) return [];
    return [{ id, name, url: media.url, width: media.width ?? 120, height: media.height ?? 50 }];
  });
});
