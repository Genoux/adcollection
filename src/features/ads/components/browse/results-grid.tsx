import { AdCard } from "@/features/ads/components/ad-card";
import { AdGrid } from "@/features/ads/components/ad-grid";
import { getPublishedAds } from "@/features/ads/queries/get-published-ads";
import type { AdFilter } from "@/features/ads/schemas";
import { LoadMoreAds } from "./load-more-ads";

interface ResultsGridProps {
  filter: AdFilter;
}

export async function ResultsGrid({ filter }: ResultsGridProps) {
  const { items, nextCursor } = await getPublishedAds(filter);

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col min-h-64 justify-center items-center gap-3 rounded-lg border border-dashed border-hairline py-16 text-center">
        <p className="text-subtle font-normal">No ads match these filters yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AdGrid>
        {items.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </AdGrid>
      <LoadMoreAds filter={filter} initialItems={items} initialCursor={nextCursor} />
    </div>
  );
}
