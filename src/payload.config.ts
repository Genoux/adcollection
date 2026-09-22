import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";
import { AdTypes } from "@/payload/collections/ad-types";
import { Ads } from "@/payload/collections/ads";
import { Categories } from "@/payload/collections/categories";
import { Clients } from "@/payload/collections/clients";
import { ContentTypes } from "@/payload/collections/content-types";
import { Industries } from "@/payload/collections/industries";
import { Media } from "@/payload/collections/media";
import { Platforms } from "@/payload/collections/platforms";
import { Subcategories } from "@/payload/collections/subcategories";
import { Users } from "@/payload/collections/users";
import { env } from "@/shared/config/env";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  secret: env.PAYLOAD_SECRET,
  sharp,
  editor: lexicalEditor({}),
  collections: [
    Ads,
    Platforms,
    Clients,
    Industries,
    Categories,
    Subcategories,
    ContentTypes,
    AdTypes,
    Media,
    Users,
  ],
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URL,
      // Migrations run from the build command and node-postgres waits forever by
      // default, so an unreachable database hangs the deploy instead of failing it.
      // Keep this client-side: server settings passed as startup parameters are
      // rejected by pooled (PgBouncer) endpoints.
      connectionTimeoutMillis: 15_000,
    },
    // Dev push would auto-sync this config onto whatever DATABASE_URL points at, and that
    // is the production Neon database. Schema changes go through src/migrations only.
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
  ],
});
