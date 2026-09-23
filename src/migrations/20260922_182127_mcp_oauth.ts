import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "mcp_oauth_clients" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"client_id" varchar NOT NULL,
  	"client_name" varchar,
  	"redirect_uris" jsonb NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "mcp_oauth_grants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"client_id" integer NOT NULL,
  	"redirect_uri" varchar NOT NULL,
  	"code_hash" varchar,
  	"code_challenge" varchar,
  	"code_expires_at" timestamp(3) with time zone,
  	"access_token_hash" varchar,
  	"access_expires_at" timestamp(3) with time zone,
  	"refresh_token_hash" varchar,
  	"previous_refresh_token_hash" varchar,
  	"refresh_expires_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "mcp_oauth_clients_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "mcp_oauth_grants_id" integer;
  ALTER TABLE "mcp_oauth_grants" ADD CONSTRAINT "mcp_oauth_grants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mcp_oauth_grants" ADD CONSTRAINT "mcp_oauth_grants_client_id_mcp_oauth_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."mcp_oauth_clients"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "mcp_oauth_clients_client_id_idx" ON "mcp_oauth_clients" USING btree ("client_id");
  CREATE INDEX "mcp_oauth_clients_updated_at_idx" ON "mcp_oauth_clients" USING btree ("updated_at");
  CREATE INDEX "mcp_oauth_clients_created_at_idx" ON "mcp_oauth_clients" USING btree ("created_at");
  CREATE INDEX "mcp_oauth_grants_user_idx" ON "mcp_oauth_grants" USING btree ("user_id");
  CREATE INDEX "mcp_oauth_grants_client_idx" ON "mcp_oauth_grants" USING btree ("client_id");
  CREATE INDEX "mcp_oauth_grants_code_hash_idx" ON "mcp_oauth_grants" USING btree ("code_hash");
  CREATE INDEX "mcp_oauth_grants_access_token_hash_idx" ON "mcp_oauth_grants" USING btree ("access_token_hash");
  CREATE INDEX "mcp_oauth_grants_refresh_token_hash_idx" ON "mcp_oauth_grants" USING btree ("refresh_token_hash");
  CREATE INDEX "mcp_oauth_grants_previous_refresh_token_hash_idx" ON "mcp_oauth_grants" USING btree ("previous_refresh_token_hash");
  CREATE INDEX "mcp_oauth_grants_updated_at_idx" ON "mcp_oauth_grants" USING btree ("updated_at");
  CREATE INDEX "mcp_oauth_grants_created_at_idx" ON "mcp_oauth_grants" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mcp_oauth_clients_fk" FOREIGN KEY ("mcp_oauth_clients_id") REFERENCES "public"."mcp_oauth_clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mcp_oauth_grants_fk" FOREIGN KEY ("mcp_oauth_grants_id") REFERENCES "public"."mcp_oauth_grants"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_mcp_oauth_clients_id_idx" ON "payload_locked_documents_rels" USING btree ("mcp_oauth_clients_id");
  CREATE INDEX "payload_locked_documents_rels_mcp_oauth_grants_id_idx" ON "payload_locked_documents_rels" USING btree ("mcp_oauth_grants_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "mcp_oauth_clients" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "mcp_oauth_grants" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "mcp_oauth_clients" CASCADE;
  DROP TABLE "mcp_oauth_grants" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_mcp_oauth_clients_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_mcp_oauth_grants_fk";
  
  DROP INDEX "payload_locked_documents_rels_mcp_oauth_clients_id_idx";
  DROP INDEX "payload_locked_documents_rels_mcp_oauth_grants_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "mcp_oauth_clients_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "mcp_oauth_grants_id";`)
}
