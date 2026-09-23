import { revalidatePath } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from "payload";

// Ad pages are cached on first render, and an ad, client or tag edit reaches every
// grid and related-ads row, so the whole public tree is purged rather than tracing
// which paths a document appears on. Edits are rare enough for that to be cheap.
const revalidateAfterChange: CollectionAfterChangeHook = ({ doc }) => {
  revalidatePath("/", "layout");
  return doc;
};

const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidatePath("/", "layout");
  return doc;
};

export const revalidatePublicSite: CollectionConfig["hooks"] = {
  afterChange: [revalidateAfterChange],
  afterDelete: [revalidateAfterDelete],
};
