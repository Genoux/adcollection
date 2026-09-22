import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { mcpPlugin } from "@payloadcms/plugin-mcp";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Ads } from "@/payload/collections/ads";
import { Categories } from "@/payload/collections/categories";
import { ContentTypes } from "@/payload/collections/content-types";
import { Media } from "@/payload/collections/media";
import { Platforms } from "@/payload/collections/platforms";
import { Subcategories } from "@/payload/collections/subcategories";
import { Users } from "@/payload/collections/users";
import { mcpTools } from "@/payload/mcp";
import { env } from "@/shared/config/env";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  secret: env.PAYLOAD_SECRET,
  sharp,
  editor: lexicalEditor({}),
  collections: [Ads, Platforms, Categories, Subcategories, ContentTypes, Media, Users],
  db: postgresAdapter({
    pool: { connectionString: env.DATABASE_URL },
    // Dev push silently diverges the database from src/migrations, which is how the
    // Neon "dev" branch ended up with an unrecorded schema and a `dev` batch -1 row.
    // Every environment goes through migrations so preview matches production.
    push: false,
  }),
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, "app/(payload)"),
    },
  },
  plugins: [
    s3Storage({
      enabled: true,
      // Large video uploads go straight from the browser to R2 instead of through
      // the Next server function, so they skip Vercel's function body-size limit.
      // Needs a CORS rule on the R2 bucket allowing PUT from the site origins.
      clientUploads: true,
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) =>
            `${env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL}/${prefix ? `${prefix}/` : ""}${filename}`,
        },
      },
      bucket: env.R2_BUCKET_NAME,
      config: {
        credentials: {
          accessKeyId: env.R2_ACCESS_KEY_ID,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        },
        region: "auto",
        endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        forcePathStyle: true,
      },
    }),
    mcpPlugin({
      userCollection: "users",
      collections: {
        // Creating an ad requires attaching two uploads, which the generic create tool
        // cannot do — importFrameioAd is the only creation path.
        ads: {
          description:
            "Short-form video ads with brand, creator, classification and 1-10 ratings. Imported as drafts and published by a human.",
          enabled: { find: true, update: true, create: false, delete: false },
        },
        media: { enabled: { find: true } },
        platforms: { enabled: { find: true } },
        categories: { enabled: { find: true } },
        subcategories: { enabled: { find: true } },
        "content-types": { enabled: { find: true } },
      },
      mcp: {
        tools: mcpTools,
        serverOptions: { serverInfo: { name: "AdCollection", version: "1.0.0" } },
        handlerOptions: { maxDuration: 300 },
      },
    }),
  ],
});
