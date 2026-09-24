import type { Ad, Media } from "@/payload-types";
import type { ClientProfile, ClientSummary, Creator } from "./client";
import { toClientProfile, toClientSummary, toCreator } from "./client";
import type { TaxonomyDoc, TaxonomyRef } from "./taxonomy";
import { requirePopulated, toTaxonomyRef } from "./taxonomy";

export type AdListItem = {
  id: number;
  slug: string;
  thumbnailTitle: string;
  client: ClientSummary | null;
  overallScore: number | null;
  createdAt: string;
  thumbnailUrl: string;
  videoUrl: string;
  platform: TaxonomyRef;
  industry: TaxonomyRef | null;
  contentTypes: TaxonomyRef[];
  angles: TaxonomyRef[];
};

export type AdDetail = Omit<AdListItem, "client"> & {
  client: ClientProfile | null;
  creator: Creator | null;
  name: string;
  caption: string | null;
  madeWithInbeat: boolean;
  originalUrl: string | null;
  soundName: string | null;
  soundUrl: string | null;
  niches: TaxonomyRef[];
  objective: TaxonomyRef | null;
  markets: TaxonomyRef[];
  ratingAudienceGrab: number | null;
  ratingWatchability: number | null;
  ratingClarity: number | null;
  highlight: string | null;
  highlightMetric: Ad["highlightMetric"];
  featured: boolean;
};

function mediaUrl(value: number | Media | null | undefined, field: string): string | null {
  return requirePopulated(value, field)?.url ?? null;
}

function taxonomyRef<T extends TaxonomyDoc>(
  value: number | T | null | undefined,
  field: string,
): TaxonomyRef | null {
  const doc = requirePopulated(value, field);
  return doc ? toTaxonomyRef(doc) : null;
}

function taxonomyRefs<T extends TaxonomyDoc>(
  values: (number | T)[] | null | undefined,
  field: string,
): TaxonomyRef[] {
  return (values ?? []).flatMap((value) => taxonomyRef(value, field) ?? []);
}

export function toAdListItem(ad: Ad): AdListItem | null {
  const thumbnailUrl = mediaUrl(ad.thumbnail, "thumbnail");
  const videoUrl = mediaUrl(ad.video, "video");
  const platform = taxonomyRef(ad.platform, "platform");
  const client = requirePopulated(ad.client, "client");

  if (!thumbnailUrl || !videoUrl || !platform) return null;

  return {
    id: ad.id,
    slug: ad.slug,
    thumbnailTitle: ad.thumbnailTitle,
    client: client ? toClientSummary(client) : null,
    overallScore: ad.overallScore ?? null,
    createdAt: ad.createdAt,
    thumbnailUrl,
    videoUrl,
    platform,
    industry: taxonomyRef(ad.industry, "industry"),
    contentTypes: taxonomyRefs(ad.contentTypes, "contentTypes"),
    angles: taxonomyRefs(ad.angles, "angles"),
  };
}

export function toAdDetail(ad: Ad): AdDetail | null {
  const listItem = toAdListItem(ad);
  if (!listItem) return null;

  const client = requirePopulated(ad.client, "client");

  return {
    ...listItem,
    client: client ? toClientProfile(client) : null,
    creator: toCreator(ad.creator),
    name: ad.name,
    caption: ad.caption ?? null,
    madeWithInbeat: ad.madeWithInbeat ?? false,
    originalUrl: ad.originalUrl ?? null,
    soundName: ad.soundName ?? null,
    soundUrl: ad.soundUrl ?? null,
    niches: taxonomyRefs(ad.niches, "niches"),
    objective: taxonomyRef(ad.objective, "objective"),
    markets: taxonomyRefs(ad.markets, "markets"),
    ratingAudienceGrab: ad.ratingAudienceGrab ?? null,
    ratingWatchability: ad.ratingWatchability ?? null,
    ratingClarity: ad.ratingClarity ?? null,
    highlight: ad.highlight ?? null,
    highlightMetric: ad.highlightMetric ?? null,
    featured: ad.featured ?? false,
  };
}
