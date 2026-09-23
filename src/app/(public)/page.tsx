import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { AdCard } from "@/features/ads/components/ad-card";
import { AdGrid } from "@/features/ads/components/ad-grid";
import { getFeaturedAds } from "@/features/ads/queries/get-featured-ads";
import { getLatestAds } from "@/features/ads/queries/get-latest-ads";
import { Container } from "@/shared/components/layout/container";
import { SectionHeader } from "@/shared/components/layout/section-header";
import { Button } from "@/shared/components/ui/button";

export const metadata: Metadata = {
  // The title template only applies to child segments, and this page shares the
  // layout segment, so the prefix is spelled out here.
  title: "AdCollection - Browse UGC video ads",
  description:
    "A deep dive into the strategy behind high-converting ad creative. Browse a curated library of the best-performing video ads, rated on audience grab, watchability, and clarity.",
};

export default async function Home() {
  // Without a request-time API this page would prerender at build, which needs the
  // database and its current schema while migrations run in a separate CI job.
  await connection();
  const [featuredAds, latestAds] = await Promise.all([getFeaturedAds(), getLatestAds()]);

  return (
    <>
      <Container className="pt-16 pb-24">
        <h1 className="mb-6 max-w-measure-hero text-display text-heading max-lg:text-display-sm">
          A deep dive into the strategy behind high-converting ad creative
        </h1>
        <p className="max-w-measure-lede text-base text-black/60">
          A curated library of the best-performing video ads, rated and broken down so you can learn
          what actually works.
        </p>
      </Container>

      {featuredAds.length > 0 && (
        <Container className="flex flex-col gap-6">
          <SectionHeader title="Featured" />
          <AdGrid>
            {featuredAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </AdGrid>
        </Container>
      )}

      {latestAds.length > 0 && (
        <Container className="mt-24 flex flex-col gap-5">
          <SectionHeader title="Latest">
            <Button asChild variant="subtle" size="sm">
              <Link href="/ads" prefetch>
                See all
              </Link>
            </Button>
          </SectionHeader>
          <AdGrid>
            {latestAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </AdGrid>
        </Container>
      )}
    </>
  );
}
