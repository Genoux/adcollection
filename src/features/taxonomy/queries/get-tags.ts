import { cache } from "react";
import { toTaxonomyRef } from "@/entities/taxonomy";
import { getPayloadClient } from "@/shared/lib/payload";

type TagCollection = "angles" | "content-types" | "industries" | "objectives" | "platforms";

export const getTags = cache(async (collection: TagCollection) => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({ collection, sort: "name", limit: 0 });
  return docs.map(toTaxonomyRef);
});
