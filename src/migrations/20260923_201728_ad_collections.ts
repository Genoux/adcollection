import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "ad_collections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"share_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ad_collections_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"ads_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "ad_collections_id" integer;
  ALTER TABLE "ad_collections_rels" ADD CONSTRAINT "ad_collections_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."ad_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ad_collections_rels" ADD CONSTRAINT "ad_collections_rels_ads_fk" FOREIGN KEY ("ads_id") REFERENCES "public"."ads"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "ad_collections_share_id_idx" ON "ad_collections" USING btree ("share_id");
  CREATE INDEX "ad_collections_updated_at_idx" ON "ad_collections" USING btree ("updated_at");
  CREATE INDEX "ad_collections_created_at_idx" ON "ad_collections" USING btree ("created_at");
  CREATE INDEX "ad_collections_rels_order_idx" ON "ad_collections_rels" USING btree ("order");
  CREATE INDEX "ad_collections_rels_parent_idx" ON "ad_collections_rels" USING btree ("parent_id");
  CREATE INDEX "ad_collections_rels_path_idx" ON "ad_collections_rels" USING btree ("path");
  CREATE INDEX "ad_collections_rels_ads_id_idx" ON "ad_collections_rels" USING btree ("ads_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ad_collections_fk" FOREIGN KEY ("ad_collections_id") REFERENCES "public"."ad_collections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_ad_collections_id_idx" ON "payload_locked_documents_rels" USING btree ("ad_collections_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ad_collections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ad_collections_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "ad_collections" CASCADE;
  DROP TABLE "ad_collections_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_ad_collections_fk";
  
  DROP INDEX "payload_locked_documents_rels_ad_collections_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "ad_collections_id";`)
}
