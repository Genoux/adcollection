import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// The `SET lock_timeout` is a hand edit. Adding columns to "ads" takes an ACCESS
// EXCLUSIVE lock, and this is run against the live database, where Postgres waits for
// that lock forever by default: one long-lived reader would stall the migration and
// queue every query behind it. Aborting lets it be retried at a quieter moment.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   SET lock_timeout = '20s';
  CREATE TABLE "clients" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "industries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ad_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "ads" ADD COLUMN "client_id" integer;
  ALTER TABLE "ads" ADD COLUMN "industry_id" integer;
  ALTER TABLE "ads_rels" ADD COLUMN "ad_types_id" integer;
  ALTER TABLE "_ads_v" ADD COLUMN "version_client_id" integer;
  ALTER TABLE "_ads_v" ADD COLUMN "version_industry_id" integer;
  ALTER TABLE "_ads_v_rels" ADD COLUMN "ad_types_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "clients_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "industries_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "ad_types_id" integer;
  CREATE UNIQUE INDEX "clients_slug_idx" ON "clients" USING btree ("slug");
  CREATE INDEX "clients_updated_at_idx" ON "clients" USING btree ("updated_at");
  CREATE INDEX "clients_created_at_idx" ON "clients" USING btree ("created_at");
  CREATE UNIQUE INDEX "industries_slug_idx" ON "industries" USING btree ("slug");
  CREATE INDEX "industries_updated_at_idx" ON "industries" USING btree ("updated_at");
  CREATE INDEX "industries_created_at_idx" ON "industries" USING btree ("created_at");
  CREATE UNIQUE INDEX "ad_types_slug_idx" ON "ad_types" USING btree ("slug");
  CREATE INDEX "ad_types_updated_at_idx" ON "ad_types" USING btree ("updated_at");
  CREATE INDEX "ad_types_created_at_idx" ON "ad_types" USING btree ("created_at");
  ALTER TABLE "ads" ADD CONSTRAINT "ads_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ads" ADD CONSTRAINT "ads_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ads_rels" ADD CONSTRAINT "ads_rels_ad_types_fk" FOREIGN KEY ("ad_types_id") REFERENCES "public"."ad_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ads_v" ADD CONSTRAINT "_ads_v_version_client_id_clients_id_fk" FOREIGN KEY ("version_client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ads_v" ADD CONSTRAINT "_ads_v_version_industry_id_industries_id_fk" FOREIGN KEY ("version_industry_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ads_v_rels" ADD CONSTRAINT "_ads_v_rels_ad_types_fk" FOREIGN KEY ("ad_types_id") REFERENCES "public"."ad_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ad_types_fk" FOREIGN KEY ("ad_types_id") REFERENCES "public"."ad_types"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "ads_client_idx" ON "ads" USING btree ("client_id");
  CREATE INDEX "ads_industry_idx" ON "ads" USING btree ("industry_id");
  CREATE INDEX "ads_rels_ad_types_id_idx" ON "ads_rels" USING btree ("ad_types_id");
  CREATE INDEX "_ads_v_version_version_client_idx" ON "_ads_v" USING btree ("version_client_id");
  CREATE INDEX "_ads_v_version_version_industry_idx" ON "_ads_v" USING btree ("version_industry_id");
  CREATE INDEX "_ads_v_rels_ad_types_id_idx" ON "_ads_v_rels" USING btree ("ad_types_id");
  CREATE INDEX "payload_locked_documents_rels_clients_id_idx" ON "payload_locked_documents_rels" USING btree ("clients_id");
  CREATE INDEX "payload_locked_documents_rels_industries_id_idx" ON "payload_locked_documents_rels" USING btree ("industries_id");
  CREATE INDEX "payload_locked_documents_rels_ad_types_id_idx" ON "payload_locked_documents_rels" USING btree ("ad_types_id");`)
}

// `IF EXISTS` on the constraint drops is a hand edit: the generated rollback drops the
// three new tables with CASCADE first, which already removes every foreign key pointing
// at them, so the plain DROP CONSTRAINT statements below would abort the rollback.
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   SET lock_timeout = '20s';
  ALTER TABLE "clients" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "industries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ad_types" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "clients" CASCADE;
  DROP TABLE "industries" CASCADE;
  DROP TABLE "ad_types" CASCADE;
  ALTER TABLE "ads" DROP CONSTRAINT IF EXISTS "ads_client_id_clients_id_fk";
  
  ALTER TABLE "ads" DROP CONSTRAINT IF EXISTS "ads_industry_id_industries_id_fk";
  
  ALTER TABLE "ads_rels" DROP CONSTRAINT IF EXISTS "ads_rels_ad_types_fk";
  
  ALTER TABLE "_ads_v" DROP CONSTRAINT IF EXISTS "_ads_v_version_client_id_clients_id_fk";
  
  ALTER TABLE "_ads_v" DROP CONSTRAINT IF EXISTS "_ads_v_version_industry_id_industries_id_fk";
  
  ALTER TABLE "_ads_v_rels" DROP CONSTRAINT IF EXISTS "_ads_v_rels_ad_types_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_clients_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_industries_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_ad_types_fk";
  
  DROP INDEX "ads_client_idx";
  DROP INDEX "ads_industry_idx";
  DROP INDEX "ads_rels_ad_types_id_idx";
  DROP INDEX "_ads_v_version_version_client_idx";
  DROP INDEX "_ads_v_version_version_industry_idx";
  DROP INDEX "_ads_v_rels_ad_types_id_idx";
  DROP INDEX "payload_locked_documents_rels_clients_id_idx";
  DROP INDEX "payload_locked_documents_rels_industries_id_idx";
  DROP INDEX "payload_locked_documents_rels_ad_types_id_idx";
  ALTER TABLE "ads" DROP COLUMN "client_id";
  ALTER TABLE "ads" DROP COLUMN "industry_id";
  ALTER TABLE "ads_rels" DROP COLUMN "ad_types_id";
  ALTER TABLE "_ads_v" DROP COLUMN "version_client_id";
  ALTER TABLE "_ads_v" DROP COLUMN "version_industry_id";
  ALTER TABLE "_ads_v_rels" DROP COLUMN "ad_types_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "clients_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "industries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "ad_types_id";`)
}
