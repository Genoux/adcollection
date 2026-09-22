import type {
  AdType,
  Category,
  Client,
  ContentType,
  Industry,
  Platform,
  Subcategory,
} from "@/payload-types";

export type TaxonomyRef = { id: number; name: string; slug: string };

type TaxonomyDoc = AdType | Category | Client | ContentType | Industry | Platform | Subcategory;

// A bare id means the caller forgot `depth` — a bug worth crashing on. A null means
// the referenced doc was deleted, which is ordinary data and must not take a page
// down; callers decide whether the row is still renderable.
export function requirePopulated<T>(value: number | T | null | undefined, field: string): T | null {
  if (typeof value === "number") {
    throw new Error(`Expected "${field}" to be populated (pass depth to the find/findByID call)`);
  }
  return value ?? null;
}

export function toTaxonomyRef(doc: TaxonomyDoc): TaxonomyRef {
  return { id: doc.id, name: doc.name, slug: doc.slug };
}
