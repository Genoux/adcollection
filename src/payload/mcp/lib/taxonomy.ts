import type { PayloadRequest } from "payload";

type TaxonomySlug = "categories" | "content-types" | "platforms" | "subcategories";

async function findIdBySlug(
  req: PayloadRequest,
  collection: TaxonomySlug,
  slug: string,
): Promise<number> {
  const { docs } = await req.payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    pagination: false,
    depth: 0,
    req,
  });

  const doc = docs[0];
  if (!doc) {
    throw new Error(
      `no ${collection} matches the slug "${slug}". Use findDocuments on ${collection} to list the valid slugs.`,
    );
  }

  return doc.id as number;
}

export const resolveTaxonomy = findIdBySlug;

export async function resolveTaxonomyMany(
  req: PayloadRequest,
  collection: TaxonomySlug,
  slugs: string[],
): Promise<number[]> {
  return Promise.all(slugs.map((slug) => findIdBySlug(req, collection, slug)));
}
