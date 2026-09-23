import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const CONTENT_TYPES = [
  { slug: 'ugc', name: 'UGC' },
  { slug: 'complex', name: 'Complex' },
  { slug: 'b-roll', name: 'B-roll' },
  { slug: 'blink', name: 'Blink' },
  { slug: 'mashup', name: 'Mashup' },
  { slug: 'static', name: 'Static' },
]

const json = (value: unknown) => sql`${JSON.stringify(value)}::jsonb`

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "content_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "ads" DROP CONSTRAINT "ads_profile_picture_id_media_id_fk";
  
  ALTER TABLE "_ads_v" DROP CONSTRAINT "_ads_v_version_profile_picture_id_media_id_fk";
  
  DROP INDEX "ads_profile_picture_idx";
  DROP INDEX "_ads_v_version_version_profile_picture_idx";
  ALTER TABLE "ads_rels" ADD COLUMN "content_types_id" integer;
  ALTER TABLE "_ads_v_rels" ADD COLUMN "content_types_id" integer;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "content_types_find" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "content_types_id" integer;
  CREATE UNIQUE INDEX "content_types_slug_idx" ON "content_types" USING btree ("slug");
  CREATE INDEX "content_types_updated_at_idx" ON "content_types" USING btree ("updated_at");
  CREATE INDEX "content_types_created_at_idx" ON "content_types" USING btree ("created_at");
  ALTER TABLE "ads_rels" ADD CONSTRAINT "ads_rels_content_types_fk" FOREIGN KEY ("content_types_id") REFERENCES "public"."content_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ads_v_rels" ADD CONSTRAINT "_ads_v_rels_content_types_fk" FOREIGN KEY ("content_types_id") REFERENCES "public"."content_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_content_types_fk" FOREIGN KEY ("content_types_id") REFERENCES "public"."content_types"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "ads_rels_content_types_id_idx" ON "ads_rels" USING btree ("content_types_id");
  CREATE INDEX "_ads_v_rels_content_types_id_idx" ON "_ads_v_rels" USING btree ("content_types_id");
  CREATE INDEX "payload_locked_documents_rels_content_types_id_idx" ON "payload_locked_documents_rels" USING btree ("content_types_id");
  ALTER TABLE "ads" DROP COLUMN "company_name";
  ALTER TABLE "ads" DROP COLUMN "company_website_url";
  ALTER TABLE "ads" DROP COLUMN "company_website_display";
  ALTER TABLE "ads" DROP COLUMN "brand_handle_name";
  ALTER TABLE "ads" DROP COLUMN "brand_handle_url";
  ALTER TABLE "ads" DROP COLUMN "profile_picture_id";
  ALTER TABLE "_ads_v" DROP COLUMN "version_company_name";
  ALTER TABLE "_ads_v" DROP COLUMN "version_company_website_url";
  ALTER TABLE "_ads_v" DROP COLUMN "version_company_website_display";
  ALTER TABLE "_ads_v" DROP COLUMN "version_brand_handle_name";
  ALTER TABLE "_ads_v" DROP COLUMN "version_brand_handle_url";
  ALTER TABLE "_ads_v" DROP COLUMN "version_profile_picture_id";`)

  await db.execute(sql`
    INSERT INTO content_types (name, slug)
    SELECT r.name, r.slug FROM jsonb_to_recordset(${json(CONTENT_TYPES)}) AS r(slug text, name text)`)

  // The library started as a UGC showcase; ads of the other types get retagged by hand.
  await db.execute(sql`
    INSERT INTO ads_rels (parent_id, path, "order", content_types_id)
    SELECT d.id, 'contentTypes', 1, c.id FROM ads d JOIN content_types c ON c.slug = 'ugc'`)
  await db.execute(sql`
    INSERT INTO _ads_v_rels (parent_id, path, "order", content_types_id)
    SELECT d.id, 'version.contentTypes', 1, c.id FROM _ads_v d JOIN content_types c ON c.slug = 'ugc'`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "content_types" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "content_types" CASCADE;
  ALTER TABLE "ads_rels" DROP CONSTRAINT IF EXISTS "ads_rels_content_types_fk";
  
  ALTER TABLE "_ads_v_rels" DROP CONSTRAINT IF EXISTS "_ads_v_rels_content_types_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_content_types_fk";
  
  DROP INDEX "ads_rels_content_types_id_idx";
  DROP INDEX "_ads_v_rels_content_types_id_idx";
  DROP INDEX "payload_locked_documents_rels_content_types_id_idx";
  ALTER TABLE "ads" ADD COLUMN "company_name" varchar;
  ALTER TABLE "ads" ADD COLUMN "company_website_url" varchar;
  ALTER TABLE "ads" ADD COLUMN "company_website_display" varchar;
  ALTER TABLE "ads" ADD COLUMN "brand_handle_name" varchar;
  ALTER TABLE "ads" ADD COLUMN "brand_handle_url" varchar;
  ALTER TABLE "ads" ADD COLUMN "profile_picture_id" integer;
  ALTER TABLE "_ads_v" ADD COLUMN "version_company_name" varchar;
  ALTER TABLE "_ads_v" ADD COLUMN "version_company_website_url" varchar;
  ALTER TABLE "_ads_v" ADD COLUMN "version_company_website_display" varchar;
  ALTER TABLE "_ads_v" ADD COLUMN "version_brand_handle_name" varchar;
  ALTER TABLE "_ads_v" ADD COLUMN "version_brand_handle_url" varchar;
  ALTER TABLE "_ads_v" ADD COLUMN "version_profile_picture_id" integer;
  ALTER TABLE "ads" ADD CONSTRAINT "ads_profile_picture_id_media_id_fk" FOREIGN KEY ("profile_picture_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ads_v" ADD CONSTRAINT "_ads_v_version_profile_picture_id_media_id_fk" FOREIGN KEY ("version_profile_picture_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "ads_profile_picture_idx" ON "ads" USING btree ("profile_picture_id");
  CREATE INDEX "_ads_v_version_version_profile_picture_idx" ON "_ads_v" USING btree ("version_profile_picture_id");
  ALTER TABLE "ads_rels" DROP COLUMN "content_types_id";
  ALTER TABLE "_ads_v_rels" DROP COLUMN "content_types_id";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "content_types_find";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "content_types_id";`)
}
