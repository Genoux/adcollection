import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdCard } from "@/features/ads/components/ad-card";
import { AdGrid } from "@/features/ads/components/ad-grid";
import { getSharedCollection } from "@/features/collections/queries/get-shared-collection";
import { Container } from "@/shared/components/layout/container";

// Rendered on first visit and then served from cache; collection and ad edits
// purge it through the revalidatePublicSite hooks.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[shareId]">): Promise<Metadata> {
  const collection = await getSharedCollection((await params).shareId);
  if (!collection) return {};

  return {
    title: collection.title,
    description: collection.description ?? undefined,
    // Anyone holding the link can view it, but it is a private curation, not a page to rank.
    robots: { index: false, follow: false },
  };
}

export default async function SharedCollectionPage({
  params,
}: PageProps<"/collections/[shareId]">) {
  const collection = await getSharedCollection((await params).shareId);
  if (!collection) notFound();

  const { title, description, ads } = collection;

  return (
    <Container className="flex flex-1 flex-col gap-8 py-12">
      <div className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-6">
          <h1 className="text-page-h1 text-heading">{title}</h1>
          <span className="shrink-0 pb-2 text-subtle">
            {ads.length} {ads.length === 1 ? "ad" : "ads"}
          </span>
        </div>
        {description && <p className="max-w-2xl whitespace-pre-line text-subtle">{description}</p>}
      </div>
      {ads.length > 0 ? (
        <AdGrid>
          {ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </AdGrid>
      ) : (
        <div className="flex min-h-64 flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-hairline py-16 text-center">
          <p className="text-subtle">This collection has no ads yet.</p>
        </div>
      )}
    </Container>
  );
}
