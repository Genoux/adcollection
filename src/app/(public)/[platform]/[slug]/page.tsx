import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdHeader } from "@/features/ads/components/detail/ad-header";
import { CreatorCard } from "@/features/ads/components/detail/creator-card";
import { RatingWidget } from "@/features/ads/components/detail/rating-widget";
import { RelatedAdsSection } from "@/features/ads/components/detail/related-ads-section";
import { VideoPlayer } from "@/features/ads/components/detail/video-player";
import { getAdBySlug } from "@/features/ads/queries/get-ad-by-slug";
import { getRelatedAds } from "@/features/ads/queries/get-related-ads";
import { Container } from "@/shared/components/layout/container";

export async function generateMetadata({
  params,
}: PageProps<"/[platform]/[slug]">): Promise<Metadata> {
  const { platform, slug } = await params;
  const ad = await getAdBySlug(slug);
  if (!ad || ad.platform.slug !== platform) return {};

  const description =
    ad.caption ?? `${ad.thumbnailTitle} by ${ad.client?.name ?? ad.name} on ${ad.platform.name}.`;

  return {
    title: ad.thumbnailTitle,
    description,
    openGraph: { title: ad.thumbnailTitle, description, images: [{ url: ad.thumbnailUrl }] },
  };
}

export default async function AdPage({ params }: PageProps<"/[platform]/[slug]">) {
  const { platform, slug } = await params;
  const ad = await getAdBySlug(slug);

  // The platform is encoded in the URL to preserve the legacy site's SEO equity;
  // a mismatched segment (e.g. /instagram/x for a TikTok ad) must 404 rather than
  // render the same ad at two URLs.
  if (!ad || ad.platform.slug !== platform) notFound();

  const relatedAds = await getRelatedAds(ad.id);

  return (
    <div className="flex flex-col pb-16">
      <Container className="mb-6">
        <Link
          href="/"
          aria-label="Back to all ads"
          className="inline-flex hover:bg-black/5 rounded-full size-8 items-center justify-center text-heading transition-colors hover:text-black/90"
        >
          <ArrowLeft className="size-5" />
        </Link>
      </Container>

      <Container className="grid grid-cols-1 items-start gap-10 lg:grid-split">
        {/* The original gives the media column `order: -1`, placing the video and
            creator panel left of the title block rather than after it. */}
        <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-hairline bg-white shadow-card sm:grid-cols-2">
          <VideoPlayer
            videoUrl={ad.videoUrl}
            thumbnailUrl={ad.thumbnailUrl}
            title={ad.thumbnailTitle}
          />
          <CreatorCard ad={ad} />
        </div>

        <AdHeader ad={ad} />
      </Container>

      <Container>
        <RatingWidget
          ratings={{
            audienceGrab: ad.ratingAudienceGrab,
            watchability: ad.ratingWatchability,
            clarity: ad.ratingClarity,
          }}
          overallScore={ad.overallScore}
        />
      </Container>

      <RelatedAdsSection ads={relatedAds} />
    </div>
  );
}
