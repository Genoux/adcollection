import { cache } from "react";
import { toTaxonomyRef } from "@/entities/taxonomy";
import { getPayloadClient } from "@/shared/lib/payload";

export const getAdTypes = cache(async () => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "ad-types",
    sort: "name",
    limit: 0,
  });
  return docs.map(toTaxonomyRef);
});
