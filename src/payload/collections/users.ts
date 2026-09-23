import type { CollectionConfig } from "payload";
import { onlyLoggedIn } from "@/payload/access";

export const Users: CollectionConfig = {
  slug: "users",
  admin: { useAsTitle: "email", group: "System" },
  auth: true,
  access: {
    read: onlyLoggedIn,
    create: onlyLoggedIn,
    update: onlyLoggedIn,
    delete: onlyLoggedIn,
  },
  fields: [],
};
