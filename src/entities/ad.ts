import type {
  Ad,
  AdType,
  Category,
  Client,
  ContentType,
  Industry,
  Media,
  Platform,
  Subcategory,
} from "@/payload-types";
import type { TaxonomyRef } from "./taxonomy";
import { requirePopulated, toTaxonomyRef } from "./taxonomy";

export type AdListItem = {
  id: number;
  slug: string;
  thumbnailTitle: string;
  companyName: string | null;
  overallScore: number | null;
  createdAt: string;
  thumbnailUrl: string;
  videoUrl: string;
  platform: TaxonomyRef;
  category: TaxonomyRef | null;
  contentTypes: TaxonomyRef[];
};

export type AdDetail = AdListItem & {
  name: string;
  caption: string | null;
  madeWithInbeat: boolean;
  originalUrl: string | null;
  companyWebsiteUrl: string | null;
  companyWebsiteDisplay: string | null;
  brandHandleName: string | null;
  brandHandleUrl: string | null;
  soundName: string | null;
  soundUrl: string | null;
  profilePictureUrl: string | null;
  creatorHandle: string | null;
  creatorProfileUrl: string | null;
  client: TaxonomyRef | null;
  industry: TaxonomyRef | null;
  subcategories: TaxonomyRef[];
  adTypes: TaxonomyRef[];
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

function taxonomyRef<T extends Client | Industry>(
  value: number | T | null | undefined,
  field: string,
): TaxonomyRef | null {
  const doc = requirePopulated(value, field);
  return doc ? toTaxonomyRef(doc) : null;
}

function taxonomyRefs<T extends AdType | Category | ContentType | Subcategory>(
  values: (number | T)[] | null | undefined,
  field: string,
): TaxonomyRef[] {
  return (values ?? []).flatMap((value) => {
    const doc = requirePopulated(value, field);
    return doc ? toTaxonomyRef(doc) : [];
  });
}

export function toAdListItem(ad: Ad): AdListItem | null {
  const thumbnailUrl = mediaUrl(ad.thumbnail, "thumbnail");
  const videoUrl = mediaUrl(ad.video, "video");
  const platform = requirePopulated(ad.platform, "platform");
  const category = requirePopulated(ad.category, "category");

  if (!thumbnailUrl || !videoUrl || !platform) return null;

  return {
    id: ad.id,
    slug: ad.slug,
    thumbnailTitle: ad.thumbnailTitle,
    companyName: ad.companyName ?? null,
    overallScore: ad.overallScore ?? null,
    createdAt: ad.createdAt,
    thumbnailUrl,
    videoUrl,
    platform: toTaxonomyRef(platform),
    category: category ? toTaxonomyRef(category) : null,
    contentTypes: taxonomyRefs(ad.contentTypes, "contentTypes"),
  };
}

// Webflow stored handles inconsistently, some with a leading "@" and some without,
// and every view renders its own "@" prefix.
function normalizeHandle(handle: string | null | undefined): string | null {
  const trimmed = handle?.trim().replace(/^@+/, "");
  return trimmed ? trimmed : null;
}

export function toAdDetail(ad: Ad): AdDetail | null {
  const listItem = toAdListItem(ad);
  if (!listItem) return null;

  return {
    ...listItem,
    name: ad.name,
    caption: ad.caption ?? null,
    madeWithInbeat: ad.madeWithInbeat ?? false,
    originalUrl: ad.originalUrl ?? null,
    companyWebsiteUrl: ad.companyWebsiteUrl ?? null,
    companyWebsiteDisplay: ad.companyWebsiteDisplay ?? null,
    brandHandleName: normalizeHandle(ad.brandHandleName),
    brandHandleUrl: ad.brandHandleUrl ?? null,
    soundName: ad.soundName ?? null,
    soundUrl: ad.soundUrl ?? null,
    profilePictureUrl: mediaUrl(ad.profilePicture, "profilePicture"),
    creatorHandle: normalizeHandle(ad.creatorHandle),
    creatorProfileUrl: ad.creatorProfileUrl ?? null,
    client: taxonomyRef(ad.client, "client"),
    industry: taxonomyRef(ad.industry, "industry"),
    subcategories: taxonomyRefs(ad.subcategories, "subcategories"),
    adTypes: taxonomyRefs(ad.adTypes, "adTypes"),
    ratingAudienceGrab: ad.ratingAudienceGrab ?? null,
    ratingWatchability: ad.ratingWatchability ?? null,
    ratingClarity: ad.ratingClarity ?? null,
    highlight: ad.highlight ?? null,
    highlightMetric: ad.highlightMetric ?? null,
    featured: ad.featured ?? false,
  };
}
