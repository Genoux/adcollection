import { AdCard } from "@/features/ads/components/ad-card";
import { AdGrid } from "@/features/ads/components/ad-grid";
import { getRelatedAds } from "@/features/ads/queries/get-related-ads";
import { Container } from "@/shared/components/layout/container";
import { SectionHeader } from "@/shared/components/layout/section-header";

interface RelatedAdsSectionProps {
  adId: number;
}

export async function RelatedAdsSection({ adId }: RelatedAdsSectionProps) {
  const ads = await getRelatedAds(adId);
  if (ads.length === 0) return null;

  return (
    <Container className="flex flex-col gap-6">
      <SectionHeader title="Related ads" />
      <AdGrid>
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </AdGrid>
    </Container>
  );
}
