import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "logo_banner_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_id" integer NOT NULL
  );
  
  CREATE TABLE "logo_banner" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "logo_banner_logos" ADD CONSTRAINT "logo_banner_logos_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "logo_banner_logos" ADD CONSTRAINT "logo_banner_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."logo_banner"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "logo_banner_logos_order_idx" ON "logo_banner_logos" USING btree ("_order");
  CREATE INDEX "logo_banner_logos_parent_id_idx" ON "logo_banner_logos" USING btree ("_parent_id");
  CREATE INDEX "logo_banner_logos_logo_idx" ON "logo_banner_logos" USING btree ("logo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "logo_banner_logos" CASCADE;
  DROP TABLE "logo_banner" CASCADE;`)
}
