import type { Metadata } from "next";
import { Suspense } from "react";
import { FilterBar } from "@/features/ads/components/browse/filter-bar";
import { ResultsGrid } from "@/features/ads/components/browse/results-grid";
import { ResultsSkeleton } from "@/features/ads/components/browse/results-skeleton";
import { parseAdFilter } from "@/features/ads/schemas";
import { getTags } from "@/features/taxonomy/queries/get-tags";
import { Container } from "@/shared/components/layout/container";

export const metadata: Metadata = {
  title: "All ads",
  description:
    "Search every ad in the library and filter by content type, industry, niche, angle, platform, objective, and market.",
};

export default async function AdsPage({ searchParams }: PageProps<"/ads">) {
  const filter = parseAdFilter(await searchParams);

  const [contentTypes, industries, niches, angles, platforms, objectives, markets] =
    await Promise.all([
      getTags("content-types"),
      getTags("industries"),
      getTags("niches"),
      getTags("angles"),
      getTags("platforms"),
      getTags("objectives"),
      getTags("markets"),
    ]);

  return (
    <Container className="flex flex-1 flex-col gap-4 py-12">
      <div className="flex flex-col gap-1 pb-12">
        <h1 className="text-page-h1 text-heading">All ads</h1>
        <p className="text-subtle">Curated library of the best-performing video ads</p>
      </div>
      <div>
        <FilterBar
          contentTypes={contentTypes}
          industries={industries}
          niches={niches}
          angles={angles}
          platforms={platforms}
          objectives={objectives}
          markets={markets}
        />
      </div>
      <Suspense key={JSON.stringify(filter)} fallback={<ResultsSkeleton />}>
        <ResultsGrid filter={filter} />
      </Suspense>
    </Container>
  );
}
