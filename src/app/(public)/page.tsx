import type { Metadata } from "next";
import { Suspense } from "react";
import { AdCard } from "@/features/ads/components/ad-card";
import { AdGrid } from "@/features/ads/components/ad-grid";
import { FilterBar } from "@/features/ads/components/browse/filter-bar";
import { ResultsGrid } from "@/features/ads/components/browse/results-grid";
import { ResultsSkeleton } from "@/features/ads/components/browse/results-skeleton";
import { getFeaturedAds } from "@/features/ads/queries/get-featured-ads";
import { parseAdFilter } from "@/features/ads/schemas";
import { getTags } from "@/features/taxonomy/queries/get-tags";
import { Container } from "@/shared/components/layout/container";
import { SectionHeader } from "@/shared/components/layout/section-header";

export const metadata: Metadata = {
  // The title template only applies to child segments, and this page shares the
  // layout segment, so the prefix is spelled out here.
  title: "AdCollection - Browse UGC video ads",
  description:
    "A deep dive into the strategy behind high-converting ad creative. Browse a curated library of the best-performing video ads, rated on audience grab, watchability, and clarity.",
};

export default async function Home({ searchParams }: PageProps<"/">) {
  const resolvedSearchParams = await searchParams;
  const filter = parseAdFilter(resolvedSearchParams);

  const [featuredAds, contentTypes, industries, angles, platforms, objectives] = await Promise.all([
    getFeaturedAds(),
    getTags("content-types"),
    getTags("industries"),
    getTags("angles"),
    getTags("platforms"),
    getTags("objectives"),
  ]);

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
        <Container className="flex flex-col gap-8">
          <SectionHeader title="Featured" />
          <AdGrid>
            {featuredAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </AdGrid>
        </Container>
      )}

      <Container id="browse" className="mt-24 flex flex-col gap-8">
        <SectionHeader title="Browse & Filter">
          <FilterBar
            contentTypes={contentTypes}
            industries={industries}
            angles={angles}
            platforms={platforms}
            objectives={objectives}
          />
        </SectionHeader>
        <Suspense key={JSON.stringify(filter)} fallback={<ResultsSkeleton />}>
          <ResultsGrid filter={filter} />
        </Suspense>
      </Container>
    </>
  );
}
