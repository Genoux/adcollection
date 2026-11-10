import { revalidatePath } from "next/cache";
import type { GlobalAfterChangeHook, GlobalConfig } from "payload";
import { anyoneCanRead, onlyLoggedIn } from "@/payload/access";

// Same opt-out as revalidatePublicSite: revalidatePath throws outside a Next request.
const revalidateHome: GlobalAfterChangeHook = ({ doc, context }) => {
  if (!context.disableRevalidate) revalidatePath("/");
  return doc;
};

export const LogoBanner: GlobalConfig = {
  slug: "logo-banner",
  label: "Logo Banner",
  admin: { group: "Site" },
  access: { read: anyoneCanRead, update: onlyLoggedIn },
  hooks: { afterChange: [revalidateHome] },
  fields: [
    {
      name: "logos",
      type: "array",
      admin: {
        description:
          "Brand wordmarks scrolling under the home hero, in this order. Drag to reorder. Use a black SVG on a transparent background, cropped tight left and right so the gaps stay even.",
        initCollapsed: true,
        components: { RowLabel: "@/payload/admin/logo-banner/row-label#LogoRowLabel" },
      },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "logo", type: "upload", relationTo: "media", required: true },
      ],
    },
  ],
};
