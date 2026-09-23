import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "frameio_connections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"access_token" varchar,
  	"refresh_token" varchar,
  	"expires_at" timestamp(3) with time zone,
  	"account_id" varchar,
  	"auth_state" varchar,
  	"auth_state_expires_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "frameio_connections_id" integer;
  ALTER TABLE "frameio_connections" ADD CONSTRAINT "frameio_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "frameio_connections_user_idx" ON "frameio_connections" USING btree ("user_id");
  CREATE INDEX "frameio_connections_auth_state_idx" ON "frameio_connections" USING btree ("auth_state");
  CREATE INDEX "frameio_connections_updated_at_idx" ON "frameio_connections" USING btree ("updated_at");
  CREATE INDEX "frameio_connections_created_at_idx" ON "frameio_connections" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_frameio_connections_fk" FOREIGN KEY ("frameio_connections_id") REFERENCES "public"."frameio_connections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_frameio_connections_id_idx" ON "payload_locked_documents_rels" USING btree ("frameio_connections_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "frameio_connections" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "frameio_connections" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_frameio_connections_fk";
  
  DROP INDEX "payload_locked_documents_rels_frameio_connections_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "frameio_connections_id";`)
}
