"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { RotateCw } from "lucide-react";
import { useEffect, useRef } from "react";
import type { AdListItem } from "@/entities/ad";
import { AdCard } from "@/features/ads/components/ad-card";
import { AdGrid } from "@/features/ads/components/ad-grid";
import type { AdFilter } from "@/features/ads/schemas";
import { Button } from "@/shared/components/ui/button";
import { queryKeys } from "@/shared/lib/query-keys";
import { getAdsPage } from "./get-ads-page";
import { ResultsSkeleton } from "./results-skeleton";

// Starts the next fetch roughly a card-row before the sentinel scrolls into view,
// so the grid keeps up with a normal scroll instead of pausing at the bottom.
const PREFETCH_MARGIN = "800px";

interface LoadMoreAdsProps {
  filter: AdFilter;
  initialItems: AdListItem[];
  initialCursor: number | null;
}

export function LoadMoreAds({ filter, initialItems, initialCursor }: LoadMoreAdsProps) {
  const listFilter = { ...filter, cursor: undefined };
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isPending,
    isError,
    isFetchNextPageError,
    fetchNextPage,
    refetch,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.ads.list(listFilter),
    queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
      getAdsPage({ ...filter, cursor: pageParam }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData: {
      pages: [{ items: initialItems, nextCursor: initialCursor }],
      pageParams: [undefined],
    },
  });

  // A failed page would otherwise re-arm the observer on the still-visible
  // sentinel and retry in a tight loop; after an error, loading resumes on click.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage || isError) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) fetchNextPage();
      },
      { rootMargin: PREFETCH_MARGIN },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isError, fetchNextPage]);

  // initialData guarantees pages at runtime, but a reset or removed cache entry
  // (devtools "Trigger Loading" does both) leaves the query pending without them.
  const extraAds = data?.pages.slice(1).flatMap((page) => page.items) ?? [];

  return (
    <>
      {extraAds.length > 0 && (
        <AdGrid>
          {extraAds.map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </AdGrid>
      )}
      {(isPending || isFetchingNextPage) && <ResultsSkeleton count={4} />}
      {isError && !isFetchingNextPage && (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-hairline py-10 text-center"
        >
          <p className="text-subtle">Couldn&apos;t load more ads.</p>
          <Button
            variant="outline"
            className="border-black/20 shadow-none"
            onClick={() => (isFetchNextPageError ? fetchNextPage() : refetch())}
          >
            <RotateCw />
            Try again
          </Button>
        </div>
      )}
      {hasNextPage && <div ref={sentinelRef} aria-hidden />}
    </>
  );
}
