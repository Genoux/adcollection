import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Frozen copy of toSortTitle in src/payload/fields/sort-title.ts, so later edits
// there cannot change what this migration wrote.
const toSortTitle = (title: string) =>
  title.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

const json = (value: unknown) => sql`${JSON.stringify(value)}::jsonb`

type TitleRow = { id: number; title: string | null }

const foldTitles = (rows: TitleRow[]) =>
  rows.map(({ id, title }) => ({ id, sort_title: toSortTitle(title ?? '') }))

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ads" ADD COLUMN "sort_title" varchar;
  ALTER TABLE "_ads_v" ADD COLUMN "version_sort_title" varchar;
  CREATE INDEX "ads_sort_title_idx" ON "ads" USING btree ("sort_title");
  CREATE INDEX "_ads_v_version_version_sort_title_idx" ON "_ads_v" USING btree ("version_sort_title");`)

  const ads = await db.execute(sql`SELECT id, thumbnail_title AS title FROM ads`)
  await db.execute(sql`
    UPDATE ads SET sort_title = r.sort_title
    FROM jsonb_to_recordset(${json(foldTitles(ads.rows as TitleRow[]))}) AS r(id int, sort_title text)
    WHERE ads.id = r.id`)

  const versions = await db.execute(sql`SELECT id, version_thumbnail_title AS title FROM _ads_v`)
  await db.execute(sql`
    UPDATE _ads_v SET version_sort_title = r.sort_title
    FROM jsonb_to_recordset(${json(foldTitles(versions.rows as TitleRow[]))}) AS r(id int, sort_title text)
    WHERE _ads_v.id = r.id`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "ads_sort_title_idx";
  DROP INDEX "_ads_v_version_version_sort_title_idx";
  ALTER TABLE "ads" DROP COLUMN "sort_title";
  ALTER TABLE "_ads_v" DROP COLUMN "version_sort_title";`)
}
