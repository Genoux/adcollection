import type { RelationshipFieldServerProps } from "payload";
import { getTags } from "@/features/taxonomy/queries/get-tags";
import { CollectionBuilder, type FacetOptions } from "@/payload/admin/collection-builder/builder";

const FACETS = [
  { key: "contentTypes", label: "Content type", collection: "content-types" },
  { key: "industries", label: "Industry", collection: "industries" },
  { key: "niches", label: "Niche", collection: "niches" },
  { key: "angles", label: "Angle", collection: "angles" },
  { key: "platforms", label: "Platform", collection: "platforms" },
  { key: "objectives", label: "Objective", collection: "objectives" },
  { key: "markets", label: "Market", collection: "markets" },
] as const;

export async function CollectionBuilderField({ path, readOnly }: RelationshipFieldServerProps) {
  const facets: FacetOptions[] = await Promise.all(
    FACETS.map(async ({ key, label, collection }) => ({
      key,
      label,
      options: (await getTags(collection)).map((tag) => ({ value: tag.slug, label: tag.name })),
    })),
  );

  return <CollectionBuilder path={path} readOnly={readOnly} facets={facets} />;
}
