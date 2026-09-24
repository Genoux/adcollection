import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

type Db = MigrateUpArgs['db']

const INDUSTRIES = [
  { slug: 'beauty-personal-care', name: 'Beauty & Personal Care', from: 'beauty-selfcare' },
  { slug: 'health-wellness', name: 'Health & Wellness' },
  { slug: 'food-beverage', name: 'Food & Beverage' },
  { slug: 'fashion-apparel', name: 'Fashion & Apparel' },
  { slug: 'home-living', name: 'Home & Living', from: 'home' },
  { slug: 'pets', name: 'Pets', from: 'pet-products-0' },
  { slug: 'arts-crafts', name: 'Arts & Crafts' },
  { slug: 'finance', name: 'Finance' },
  { slug: 'travel-hospitality', name: 'Travel & Hospitality' },
  { slug: 'tech-software', name: 'Tech & Software' },
  { slug: 'retail-ecommerce', name: 'Retail & E-commerce' },
  { slug: 'social-dating', name: 'Social & Dating' },
  { slug: 'education', name: 'Education' },
  { slug: 'automotive', name: 'Automotive' },
  { slug: 'entertainment', name: 'Entertainment' },
  { slug: 'market-research', name: 'Market Research & Rewards' },
]

const NICHES = [
  { slug: 'skin-makeup', name: 'Skin & Makeup' },
  { slug: 'haircare', name: 'Haircare' },
  { slug: 'bath-body', name: 'Bath & Body', from: 'shampoo-soap' },
  { slug: 'deodorant-fragrance', name: 'Deodorant & Fragrance', from: 'deoderant-scents' },
  { slug: 'shaving-grooming', name: 'Shaving & Grooming', from: 'hair-shaving' },
  { slug: 'nails', name: 'Nails' },
  { slug: 'sport-fitness', name: 'Sport & Fitness' },
  { slug: 'sleep-meditation', name: 'Sleep & Meditation' },
  { slug: 'health-tech', name: 'Health Tech' },
  { slug: 'supplements', name: 'Supplements' },
  { slug: 'hydration-soft-drinks', name: 'Hydration & Soft Drinks', from: 'water-tonic-soda' },
  { slug: 'coffee-tea', name: 'Coffee & Tea' },
  { slug: 'dairy-alternatives', name: 'Dairy & Alternatives', from: 'milk-milk-alternatives' },
  { slug: 'snacks-meals', name: 'Snacks & Meals', from: 'meals-snacks' },
  { slug: 'meal-replacement', name: 'Meal Replacement' },
  { slug: 'meal-kits', name: 'Meal Kits' },
  { slug: 'restaurants-qsr', name: 'Restaurants & QSR' },
  { slug: 'food-grocery-delivery', name: 'Food & Grocery Delivery', from: 'food-delivery' },
  { slug: 'condiments-spreads', name: 'Condiments & Spreads', from: 'toppings-condiments-spreads' },
  { slug: 'womens-apparel', name: "Women's Apparel" },
  { slug: 'mens-apparel', name: "Men's Apparel" },
  { slug: 'kids-apparel', name: "Kids' Apparel" },
  { slug: 'unisex-apparel', name: 'Unisex Apparel' },
  { slug: 'jewelry-accessories', name: 'Jewelry & Accessories', from: 'jewelry' },
  { slug: 'footwear', name: 'Footwear' },
  { slug: 'furniture-storage', name: 'Furniture & Storage', from: 'accessories-storage' },
  { slug: 'kitchen-appliances', name: 'Kitchen & Appliances', from: 'kitchen' },
  { slug: 'cleaning', name: 'Cleaning' },
  { slug: 'bedding-mattress', name: 'Bedding & Mattress' },
  { slug: 'tools-diy', name: 'Tools & DIY' },
  { slug: 'garden-plants', name: 'Garden & Plants' },
  { slug: 'banking-payments', name: 'Banking & Payments' },
  { slug: 'investing', name: 'Investing' },
  { slug: 'credit', name: 'Credit' },
  { slug: 'accounting', name: 'Accounting' },
  { slug: 'travel-booking', name: 'Travel Booking', from: 'travel' },
  { slug: 'hotels', name: 'Hotels' },
  { slug: 'productivity', name: 'Productivity' },
  { slug: 'photo-video', name: 'Photo & Video', from: 'photography' },
  { slug: 'ai', name: 'AI' },
  { slug: 'utilities', name: 'Utilities' },
  { slug: 'marketplaces', name: 'Marketplaces' },
]

const NICHE_MERGES = [
  { from: 'bath', into: 'bath-body' },
  { from: 'shower', into: 'bath-body' },
  { from: 'email', into: 'productivity' },
]

// "Finance" became an industry and "Mobile Apps" a product type; "E-commerce" only
// tagged two unrelated brands. CLIENT_PROFILES re-homes the ads these covered.
const RETIRED_NICHES = ['mobile-apps', 'finance', 'e-commerce']

const RETIRED_INDUSTRIES = ['mobile-apps', 'body']

const ANGLES = [
  { slug: 'product-showcase', name: 'Product Showcase' },
  { slug: 'testimonial', name: 'Testimonial' },
  { slug: 'unboxing', name: 'Unboxing' },
  { slug: 'product-haul', name: 'Product Haul' },
  { slug: 'problem-solution', name: 'Problem / Solution' },
  { slug: 'before-after', name: 'Before & After' },
  { slug: 'tutorial', name: 'Tutorial' },
  { slug: 'comparison', name: 'Comparison' },
  { slug: 'skit-reaction', name: 'Skit / Reaction' },
  { slug: 'founder-story', name: 'Founder Story' },
]

const ANGLE_MERGES = [{ from: 'product-overview', into: 'product-showcase' }]

const OBJECTIVES = [
  { slug: 'awareness', name: 'Awareness' },
  { slug: 'consideration', name: 'Consideration' },
  { slug: 'conversion', name: 'Conversion' },
  { slug: 'retargeting', name: 'Retargeting' },
]

// These were goals filed as angles. "Promotion" ads push an offer, so they convert.
const ANGLE_OBJECTIVES = [
  { angle: 'awareness', objective: 'awareness' },
  { angle: 'promotion', objective: 'conversion' },
]

const MARKETS = [
  { slug: 'us', name: 'United States' },
  { slug: 'canada', name: 'Canada' },
  { slug: 'uk', name: 'United Kingdom' },
  { slug: 'eu', name: 'Europe' },
  { slug: 'australia', name: 'Australia' },
  { slug: 'global', name: 'Global' },
]

const PLATFORMS = [
  { slug: 'tiktok', name: 'TikTok' },
  { slug: 'meta', name: 'Meta' },
  { slug: 'youtube', name: 'YouTube' },
  { slug: 'snapchat', name: 'Snapchat' },
  { slug: 'pinterest', name: 'Pinterest' },
  { slug: 'linkedin', name: 'LinkedIn' },
  { slug: 'reddit', name: 'Reddit' },
]

const CLIENT_ALIASES: Record<string, string> = {
  'unroll me': 'Unroll.me',
  'unroll.me': 'Unroll.me',
  'urban outfiters': 'Urban Outfitters',
  mycarpe: 'Carpe',
  'nielsen iq': 'NielsenIQ',
  'nielseniq consumer panel app': 'NielsenIQ',
  'voila.ca': 'Voila',
  'icelandic provisons': 'Icelandic Provisions',
  nipppy: 'Nippy',
  'yaw ai': 'Yaw AI',
  omniwatch: 'OmniWatch',
}

const PLACEHOLDER_CREATORS = ['unknown', 'unknown creator']

// `industry` only replaces a retired or missing industry, and `niche` only fills an ad
// with no niche, so tags a person chose are left alone.
const CLIENT_PROFILES: { client: string; industry?: string; niche?: string; productType: string }[] = [
  { client: 'acorns', industry: 'finance', niche: 'investing', productType: 'app' },
  { client: 'activia', productType: 'physical-product' },
  { client: 'adobe', industry: 'tech-software', niche: 'photo-video', productType: 'app' },
  { client: 'aura', industry: 'tech-software', niche: 'utilities', productType: 'app' },
  { client: 'better-in-person', industry: 'social-dating', productType: 'app' },
  { client: 'black-decker', industry: 'home-living', niche: 'tools-diy', productType: 'physical-product' },
  { client: 'bluehouse-salmon', productType: 'physical-product' },
  { client: 'booksy', industry: 'beauty-personal-care', productType: 'app' },
  { client: 'breathwrk', industry: 'health-wellness', niche: 'sleep-meditation', productType: 'app' },
  { client: 'bulletproof', productType: 'physical-product' },
  { client: 'bumble', industry: 'social-dating', productType: 'app' },
  { client: 'busuu', industry: 'education', productType: 'app' },
  { client: 'carmax', industry: 'automotive', productType: 'app' },
  { client: 'carls-jr', niche: 'restaurants-qsr', productType: 'service' },
  { client: 'carpe', productType: 'physical-product' },
  { client: 'chatbooks', industry: 'tech-software', niche: 'photo-video', productType: 'app' },
  { client: 'clearscore', industry: 'finance', niche: 'credit', productType: 'app' },
  { client: 'club1-hotels', industry: 'travel-hospitality', niche: 'hotels', productType: 'app' },
  { client: 'cooklist', productType: 'app' },
  { client: 'crowdtap', industry: 'market-research', productType: 'app' },
  { client: 'dashing-diva', niche: 'nails', productType: 'physical-product' },
  { client: 'dell', industry: 'tech-software', productType: 'physical-product' },
  { client: 'discord', industry: 'social-dating', productType: 'app' },
  { client: 'dockers', productType: 'physical-product' },
  { client: 'doordash', industry: 'food-beverage', niche: 'food-grocery-delivery', productType: 'app' },
  { client: 'doritos', productType: 'physical-product' },
  { client: 'dr-squatch', productType: 'physical-product' },
  { client: 'drivescore', industry: 'automotive', productType: 'app' },
  { client: 'ecosia', productType: 'app' },
  { client: 'estee-lauder', productType: 'physical-product' },
  { client: 'gametime', industry: 'entertainment', productType: 'app' },
  { client: 'genomelink', industry: 'health-wellness', niche: 'health-tech', productType: 'app' },
  { client: 'gld', productType: 'physical-product' },
  { client: 'gucci', productType: 'physical-product' },
  { client: 'halo-ball', productType: 'physical-product' },
  { client: 'hellofresh', niche: 'meal-kits', productType: 'physical-product' },
  { client: 'hopper', industry: 'travel-hospitality', niche: 'travel-booking', productType: 'app' },
  { client: 'icelandic-provisions', productType: 'physical-product' },
  { client: 'impress-art', productType: 'physical-product' },
  { client: 'imprint', industry: 'education', productType: 'app' },
  { client: 'inkbox', productType: 'physical-product' },
  { client: 'instacart', industry: 'food-beverage', niche: 'food-grocery-delivery', productType: 'app' },
  { client: 'jack-in-the-box', niche: 'restaurants-qsr', productType: 'service' },
  { client: 'joann', productType: 'physical-product' },
  { client: 'kfc', niche: 'restaurants-qsr', productType: 'service' },
  { client: 'koho', industry: 'finance', niche: 'banking-payments', productType: 'app' },
  { client: 'lambs', productType: 'physical-product' },
  { client: 'levis', productType: 'physical-product' },
  { client: 'lingo', niche: 'health-tech', productType: 'physical-product' },
  { client: 'lumineux', productType: 'physical-product' },
  { client: 'magfast', industry: 'tech-software', productType: 'physical-product' },
  { client: 'metaverse-technology-ltd', industry: 'tech-software', niche: 'utilities', productType: 'app' },
  { client: 'mogu-mogu', productType: 'physical-product' },
  { client: 'national-consumer-panel', industry: 'market-research', productType: 'app' },
  { client: 'nielseniq', industry: 'market-research', productType: 'app' },
  { client: 'nippy', productType: 'physical-product' },
  { client: 'nuun', productType: 'physical-product' },
  { client: 'omniwatch', industry: 'finance', niche: 'banking-payments', productType: 'app' },
  { client: 'photomyne', industry: 'tech-software', niche: 'photo-video', productType: 'app' },
  { client: 'plant-project-canada', niche: 'garden-plants', productType: 'physical-product' },
  { client: 'poshmark', industry: 'retail-ecommerce', niche: 'marketplaces', productType: 'app' },
  { client: 'prose', productType: 'physical-product' },
  { client: 'rail-europe', industry: 'travel-hospitality', niche: 'travel-booking', productType: 'app' },
  { client: 'realworld', industry: 'education', productType: 'app' },
  { client: 'sage-accounting', industry: 'finance', niche: 'accounting', productType: 'app' },
  { client: 'scent-bird', productType: 'physical-product' },
  { client: 'sephora', productType: 'physical-product' },
  { client: 'shark-ninja', productType: 'physical-product' },
  { client: 'shippity', industry: 'tech-software', niche: 'productivity', productType: 'app' },
  { client: 'simplywise', industry: 'finance', niche: 'accounting', productType: 'app' },
  { client: 'slim-chickens', niche: 'restaurants-qsr', productType: 'service' },
  { client: 'slynumber', industry: 'tech-software', niche: 'utilities', productType: 'app' },
  { client: 'soylent', productType: 'physical-product' },
  { client: 'spam-app', industry: 'tech-software', niche: 'utilities', productType: 'app' },
  { client: 'starbucks', productType: 'service' },
  { client: 'steppen', industry: 'health-wellness', niche: 'sport-fitness', productType: 'app' },
  { client: 'steve-madden', niche: 'footwear', productType: 'physical-product' },
  { client: 'stronger-by-the-day', niche: 'sport-fitness', productType: 'app' },
  { client: 'sweatcoin', industry: 'health-wellness', niche: 'sport-fitness', productType: 'app' },
  { client: 'swoon', productType: 'physical-product' },
  { client: 'unroll-me', industry: 'tech-software', niche: 'productivity', productType: 'app' },
  { client: 'urban-outfitters', productType: 'physical-product' },
  { client: 'voila', industry: 'food-beverage', niche: 'food-grocery-delivery', productType: 'app' },
  { client: 'woods', productType: 'physical-product' },
  { client: 'yaw-ai', industry: 'tech-software', niche: 'ai', productType: 'app' },
  { client: 'youfoodz', niche: 'meal-kits', productType: 'physical-product' },
  { client: 'yubo', industry: 'social-dating', productType: 'app' },
  { client: 'zogo', industry: 'finance', niche: 'banking-payments', productType: 'app' },
]

// Drafts keep their own copy of every field in `_ads_v`, and those copies can differ
// from the published row, so each transform runs against both tables.
const AD_TABLES = [
  { doc: 'ads', rels: 'ads_rels', languages: 'ads_languages', col: '', path: '', enumPrefix: 'enum_ads_' },
  {
    doc: '_ads_v',
    rels: '_ads_v_rels',
    languages: '_ads_v_version_languages',
    col: 'version_',
    path: 'version.',
    enumPrefix: 'enum__ads_v_version_',
  },
]

type AdTable = (typeof AD_TABLES)[number]

const json = (value: unknown) => sql`${JSON.stringify(value)}::jsonb`

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

async function upsertTags(db: Db, table: string, tags: { slug: string; name: string; from?: string }[]) {
  await db.execute(sql`
    UPDATE ${sql.raw(table)} t SET slug = r.slug, name = r.name, updated_at = now()
    FROM jsonb_to_recordset(${json(tags)}) AS r(slug text, name text, "from" text)
    WHERE t.slug = coalesce(r."from", r.slug)`)
  await db.execute(sql`
    INSERT INTO ${sql.raw(table)} (name, slug)
    SELECT r.name, r.slug FROM jsonb_to_recordset(${json(tags)}) AS r(slug text, name text)
    ON CONFLICT (slug) DO NOTHING`)
}

async function mergeTags(db: Db, table: string, relColumn: string, merges: { from: string; into: string }[]) {
  for (const { rels } of AD_TABLES) {
    await db.execute(sql`
      UPDATE ${sql.raw(rels)} r SET ${sql.raw(relColumn)} = i.id
      FROM jsonb_to_recordset(${json(merges)}) AS m("from" text, "into" text)
      JOIN ${sql.raw(table)} f ON f.slug = m."from"
      JOIN ${sql.raw(table)} i ON i.slug = m."into"
      WHERE r.${sql.raw(relColumn)} = f.id`)
    await db.execute(sql`
      DELETE FROM ${sql.raw(rels)} a USING ${sql.raw(rels)} b
      WHERE a.parent_id = b.parent_id AND a.path = b.path
        AND a.${sql.raw(relColumn)} = b.${sql.raw(relColumn)} AND a.id > b.id`)
  }
  await deleteTags(db, table, merges.map((merge) => merge.from))
}

const deleteTags = (db: Db, table: string, slugs: string[]) =>
  db.execute(sql`
    DELETE FROM ${sql.raw(table)}
    WHERE slug IN (SELECT jsonb_array_elements_text(${json(slugs)}))`)

async function renameRelPaths(db: Db) {
  const paths = [
    { from: 'subcategories', to: 'niches' },
    { from: 'contentTypes', to: 'angles' },
  ]
  for (const t of AD_TABLES) {
    await db.execute(sql`
      UPDATE ${sql.raw(t.rels)} r SET path = ${t.path} || p.to
      FROM jsonb_to_recordset(${json(paths)}) AS p("from" text, "to" text)
      WHERE r.path = ${t.path} || p."from"`)
  }
}

async function linkClients(db: Db) {
  const clientNameOf = (t: AdTable) =>
    sql.raw(`coalesce(nullif(trim(d.${t.col}company_name), ''), trim(d.${t.col}name))`)

  const { rows } = await db.execute(sql`
    SELECT ${clientNameOf(AD_TABLES[0])} AS raw FROM ads d
    UNION SELECT ${clientNameOf(AD_TABLES[1])} FROM _ads_v d`)

  const links = (rows as { raw: string }[]).map(({ raw }) => {
    const name = CLIENT_ALIASES[raw.toLowerCase()] ?? raw
    return { raw, name, slug: slugify(name) }
  })

  await db.execute(sql`
    INSERT INTO clients (name, slug)
    SELECT DISTINCT ON (l.slug) l.name, l.slug
    FROM jsonb_to_recordset(${json(links)}) AS l(raw text, name text, slug text)
    ORDER BY l.slug, l.name
    ON CONFLICT (slug) DO NOTHING`)

  for (const t of AD_TABLES) {
    await db.execute(sql`
      UPDATE ${sql.raw(t.doc)} d SET ${sql.raw(`${t.col}client_id`)} = c.id
      FROM jsonb_to_recordset(${json(links)}) AS l(raw text, slug text)
      JOIN clients c ON c.slug = l.slug
      WHERE ${clientNameOf(t)} = l.raw`)
  }

  // Ads of one client disagree on some of these; the most recently edited ad wins.
  const latest = (expression: string) =>
    sql.raw(`(SELECT ${expression} FROM ads a WHERE a.client_id = c.id AND nullif(${expression}::text, '') IS NOT NULL ORDER BY a.updated_at DESC LIMIT 1)`)

  await db.execute(sql`
    UPDATE clients c SET
      logo_id = ${latest('a.profile_picture_id')},
      website_url = ${latest('trim(a.company_website_url)')},
      website_display = ${latest('trim(a.company_website_display)')},
      handle = ${latest(`trim(leading '@' from trim(a.brand_handle_name))`)},
      handle_url = ${latest('trim(a.brand_handle_url)')}`)
}

async function cleanCreators(db: Db, t: AdTable) {
  const handle = sql.raw(`${t.col}creator_handle`)
  await db.execute(sql`
    UPDATE ${sql.raw(t.doc)} SET ${handle} = CASE
      WHEN lower(trim(${handle})) IN (SELECT jsonb_array_elements_text(${json(PLACEHOLDER_CREATORS)})) THEN NULL
      ELSE nullif(trim(leading '@' from trim(${handle})), '')
    END
    WHERE ${handle} IS NOT NULL`)
}

async function moveObjectiveAngles(db: Db, t: AdTable) {
  // An ad tagged with both goals was pushing an offer, so conversion wins.
  await db.execute(sql`
    UPDATE ${sql.raw(t.doc)} d SET ${sql.raw(`${t.col}objective_id`)} = o.id
    FROM (
      SELECT r.parent_id, CASE WHEN bool_or(m.objective = 'conversion') THEN 'conversion' ELSE 'awareness' END AS objective
      FROM ${sql.raw(t.rels)} r
      JOIN angles a ON a.id = r.angles_id
      JOIN jsonb_to_recordset(${json(ANGLE_OBJECTIVES)}) AS m(angle text, objective text) ON m.angle = a.slug
      WHERE r.path = ${`${t.path}angles`}
      GROUP BY r.parent_id
    ) g
    JOIN objectives o ON o.slug = g.objective
    WHERE g.parent_id = d.id`)
}

async function applyClientProfiles(db: Db, t: AdTable) {
  const profiles = sql`jsonb_to_recordset(${json(CLIENT_PROFILES)}) AS p(client text, industry text, niche text, "productType" text)`
  const industry = sql.raw(`${t.col}industry_id`)
  const client = sql.raw(`${t.col}client_id`)
  const productType = sql.raw(`${t.col}product_type`)
  const nichesPath = `${t.path}niches`

  await db.execute(sql`
    UPDATE ${sql.raw(t.doc)} d SET ${productType} = p."productType"::${sql.raw(`${t.enumPrefix}product_type`)}
    FROM clients c JOIN ${profiles} ON p.client = c.slug
    WHERE d.${client} = c.id`)

  await db.execute(sql`
    UPDATE ${sql.raw(t.doc)} d SET ${productType} = 'app'
    FROM industries i
    WHERE i.id = d.${industry} AND i.slug = 'mobile-apps' AND d.${productType} IS NULL`)

  await db.execute(sql`
    UPDATE ${sql.raw(t.doc)} d SET ${industry} = i.id
    FROM clients c JOIN ${profiles} ON p.client = c.slug JOIN industries i ON i.slug = p.industry
    WHERE d.${client} = c.id
      AND (d.${industry} IS NULL
        OR d.${industry} IN (SELECT id FROM industries WHERE slug IN (SELECT jsonb_array_elements_text(${json(RETIRED_INDUSTRIES)}))))`)

  await db.execute(sql`
    UPDATE ${sql.raw(t.doc)} d SET ${industry} = (SELECT id FROM industries WHERE slug = 'beauty-personal-care')
    WHERE d.${industry} = (SELECT id FROM industries WHERE slug = 'body')`)

  await db.execute(sql`
    INSERT INTO ${sql.raw(t.rels)} (parent_id, path, "order", niches_id)
    SELECT d.id, ${nichesPath}, 1, n.id
    FROM ${sql.raw(t.doc)} d
    JOIN clients c ON c.id = d.${client}
    JOIN ${profiles} ON p.client = c.slug
    JOIN niches n ON n.slug = p.niche
    WHERE NOT EXISTS (
      SELECT 1 FROM ${sql.raw(t.rels)} r WHERE r.parent_id = d.id AND r.path = ${nichesPath})`)
}

// Every ad in the library so far is English; markets were never recorded, so they stay empty.
const applyDefaultLanguage = (db: Db, t: AdTable) =>
  db.execute(sql`
    INSERT INTO ${sql.raw(t.languages)} (parent_id, "order", value)
    SELECT d.id, 1, 'en' FROM ${sql.raw(t.doc)} d`)

async function restructureTags(db: Db) {
  await renameRelPaths(db)

  await upsertTags(db, 'industries', INDUSTRIES)
  await upsertTags(db, 'niches', NICHES)
  await mergeTags(db, 'niches', 'niches_id', NICHE_MERGES)
  await deleteTags(db, 'niches', RETIRED_NICHES)

  await upsertTags(db, 'objectives', OBJECTIVES)
  await upsertTags(db, 'markets', MARKETS)
  await upsertTags(db, 'platforms', PLATFORMS)
  await linkClients(db)

  for (const t of AD_TABLES) {
    await cleanCreators(db, t)
    await moveObjectiveAngles(db, t)
    await applyClientProfiles(db, t)
    await applyDefaultLanguage(db, t)
  }

  await deleteTags(db, 'industries', RETIRED_INDUSTRIES)
  await upsertTags(db, 'angles', ANGLES)
  await mergeTags(db, 'angles', 'angles_id', ANGLE_MERGES)
  await deleteTags(db, 'angles', ANGLE_OBJECTIVES.map(({ angle }) => angle))
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_ads_languages" AS ENUM('en', 'fr', 'es', 'de', 'pt', 'it');
  CREATE TYPE "public"."enum_ads_product_type" AS ENUM('app', 'physical-product', 'service');
  CREATE TYPE "public"."enum__ads_v_version_languages" AS ENUM('en', 'fr', 'es', 'de', 'pt', 'it');
  CREATE TYPE "public"."enum__ads_v_version_product_type" AS ENUM('app', 'physical-product', 'service');
  CREATE TABLE "ads_languages" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_ads_languages",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_ads_v_version_languages" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__ads_v_version_languages",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "clients" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"logo_id" integer,
  	"handle" varchar,
  	"handle_url" varchar,
  	"website_url" varchar,
  	"website_display" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "objectives" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "markets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "categories" RENAME TO "industries";
  ALTER TABLE "subcategories" RENAME TO "niches";
  ALTER TABLE "content_types" RENAME TO "angles";
  ALTER TABLE "ads" RENAME COLUMN "category_id" TO "industry_id";
  ALTER TABLE "_ads_v" RENAME COLUMN "version_category_id" TO "version_industry_id";
  ALTER TABLE "ads_rels" RENAME COLUMN "subcategories_id" TO "niches_id";
  ALTER TABLE "ads_rels" RENAME COLUMN "content_types_id" TO "angles_id";
  ALTER TABLE "_ads_v_rels" RENAME COLUMN "subcategories_id" TO "niches_id";
  ALTER TABLE "_ads_v_rels" RENAME COLUMN "content_types_id" TO "angles_id";
  ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "categories_id" TO "industries_id";
  ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "subcategories_id" TO "niches_id";
  ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "content_types_id" TO "angles_id";
  ALTER TABLE "payload_mcp_api_keys" RENAME COLUMN "categories_find" TO "industries_find";
  ALTER TABLE "payload_mcp_api_keys" RENAME COLUMN "subcategories_find" TO "niches_find";
  ALTER TABLE "payload_mcp_api_keys" RENAME COLUMN "content_types_find" TO "angles_find";
  ALTER TABLE "ads" DROP CONSTRAINT "ads_category_id_categories_id_fk";
  
  ALTER TABLE "ads_rels" DROP CONSTRAINT "ads_rels_subcategories_fk";
  
  ALTER TABLE "ads_rels" DROP CONSTRAINT "ads_rels_content_types_fk";
  
  ALTER TABLE "_ads_v" DROP CONSTRAINT "_ads_v_version_category_id_categories_id_fk";
  
  ALTER TABLE "_ads_v_rels" DROP CONSTRAINT "_ads_v_rels_subcategories_fk";
  
  ALTER TABLE "_ads_v_rels" DROP CONSTRAINT "_ads_v_rels_content_types_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_subcategories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_content_types_fk";
  
  DROP INDEX "ads_category_idx";
  DROP INDEX "ads_rels_subcategories_id_idx";
  DROP INDEX "ads_rels_content_types_id_idx";
  DROP INDEX "_ads_v_version_version_category_idx";
  DROP INDEX "_ads_v_rels_subcategories_id_idx";
  DROP INDEX "_ads_v_rels_content_types_id_idx";
  DROP INDEX "categories_slug_idx";
  DROP INDEX "categories_updated_at_idx";
  DROP INDEX "categories_created_at_idx";
  DROP INDEX "subcategories_slug_idx";
  DROP INDEX "subcategories_updated_at_idx";
  DROP INDEX "subcategories_created_at_idx";
  DROP INDEX "content_types_slug_idx";
  DROP INDEX "content_types_updated_at_idx";
  DROP INDEX "content_types_created_at_idx";
  DROP INDEX "payload_locked_documents_rels_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_subcategories_id_idx";
  DROP INDEX "payload_locked_documents_rels_content_types_id_idx";
  ALTER TABLE "ads" ADD COLUMN "client_id" integer;
  ALTER TABLE "ads" ADD COLUMN "objective_id" integer;
  ALTER TABLE "ads" ADD COLUMN "product_type" "enum_ads_product_type";
  ALTER TABLE "ads" ADD COLUMN "top_performer" boolean DEFAULT false;
  ALTER TABLE "ads_rels" ADD COLUMN "markets_id" integer;
  ALTER TABLE "_ads_v" ADD COLUMN "version_client_id" integer;
  ALTER TABLE "_ads_v" ADD COLUMN "version_objective_id" integer;
  ALTER TABLE "_ads_v" ADD COLUMN "version_product_type" "enum__ads_v_version_product_type";
  ALTER TABLE "_ads_v" ADD COLUMN "version_top_performer" boolean DEFAULT false;
  ALTER TABLE "_ads_v_rels" ADD COLUMN "markets_id" integer;
  ALTER TABLE "platforms" ADD COLUMN "description" varchar;
  ALTER TABLE "industries" ADD COLUMN "description" varchar;
  ALTER TABLE "niches" ADD COLUMN "description" varchar;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "clients_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "objectives_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "markets_find" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "clients_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "objectives_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "markets_id" integer;
  ALTER TABLE "ads_languages" ADD CONSTRAINT "ads_languages_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."ads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ads_v_version_languages" ADD CONSTRAINT "_ads_v_version_languages_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_ads_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "clients" ADD CONSTRAINT "clients_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "ads_languages_order_idx" ON "ads_languages" USING btree ("order");
  CREATE INDEX "ads_languages_parent_idx" ON "ads_languages" USING btree ("parent_id");
  CREATE INDEX "_ads_v_version_languages_order_idx" ON "_ads_v_version_languages" USING btree ("order");
  CREATE INDEX "_ads_v_version_languages_parent_idx" ON "_ads_v_version_languages" USING btree ("parent_id");
  CREATE UNIQUE INDEX "clients_slug_idx" ON "clients" USING btree ("slug");
  CREATE INDEX "clients_logo_idx" ON "clients" USING btree ("logo_id");
  CREATE INDEX "clients_updated_at_idx" ON "clients" USING btree ("updated_at");
  CREATE INDEX "clients_created_at_idx" ON "clients" USING btree ("created_at");
  CREATE UNIQUE INDEX "objectives_slug_idx" ON "objectives" USING btree ("slug");
  CREATE INDEX "objectives_updated_at_idx" ON "objectives" USING btree ("updated_at");
  CREATE INDEX "objectives_created_at_idx" ON "objectives" USING btree ("created_at");
  CREATE UNIQUE INDEX "markets_slug_idx" ON "markets" USING btree ("slug");
  CREATE INDEX "markets_updated_at_idx" ON "markets" USING btree ("updated_at");
  CREATE INDEX "markets_created_at_idx" ON "markets" USING btree ("created_at");
  ALTER TABLE "ads" ADD CONSTRAINT "ads_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ads" ADD CONSTRAINT "ads_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ads" ADD CONSTRAINT "ads_objective_id_objectives_id_fk" FOREIGN KEY ("objective_id") REFERENCES "public"."objectives"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ads_rels" ADD CONSTRAINT "ads_rels_niches_fk" FOREIGN KEY ("niches_id") REFERENCES "public"."niches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ads_rels" ADD CONSTRAINT "ads_rels_angles_fk" FOREIGN KEY ("angles_id") REFERENCES "public"."angles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ads_rels" ADD CONSTRAINT "ads_rels_markets_fk" FOREIGN KEY ("markets_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ads_v" ADD CONSTRAINT "_ads_v_version_client_id_clients_id_fk" FOREIGN KEY ("version_client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ads_v" ADD CONSTRAINT "_ads_v_version_industry_id_industries_id_fk" FOREIGN KEY ("version_industry_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ads_v" ADD CONSTRAINT "_ads_v_version_objective_id_objectives_id_fk" FOREIGN KEY ("version_objective_id") REFERENCES "public"."objectives"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ads_v_rels" ADD CONSTRAINT "_ads_v_rels_niches_fk" FOREIGN KEY ("niches_id") REFERENCES "public"."niches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ads_v_rels" ADD CONSTRAINT "_ads_v_rels_angles_fk" FOREIGN KEY ("angles_id") REFERENCES "public"."angles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ads_v_rels" ADD CONSTRAINT "_ads_v_rels_markets_fk" FOREIGN KEY ("markets_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_niches_fk" FOREIGN KEY ("niches_id") REFERENCES "public"."niches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_angles_fk" FOREIGN KEY ("angles_id") REFERENCES "public"."angles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_objectives_fk" FOREIGN KEY ("objectives_id") REFERENCES "public"."objectives"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_markets_fk" FOREIGN KEY ("markets_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "ads_client_idx" ON "ads" USING btree ("client_id");
  CREATE INDEX "ads_industry_idx" ON "ads" USING btree ("industry_id");
  CREATE INDEX "ads_objective_idx" ON "ads" USING btree ("objective_id");
  CREATE INDEX "ads_rels_niches_id_idx" ON "ads_rels" USING btree ("niches_id");
  CREATE INDEX "ads_rels_angles_id_idx" ON "ads_rels" USING btree ("angles_id");
  CREATE INDEX "ads_rels_markets_id_idx" ON "ads_rels" USING btree ("markets_id");
  CREATE INDEX "_ads_v_version_version_client_idx" ON "_ads_v" USING btree ("version_client_id");
  CREATE INDEX "_ads_v_version_version_industry_idx" ON "_ads_v" USING btree ("version_industry_id");
  CREATE INDEX "_ads_v_version_version_objective_idx" ON "_ads_v" USING btree ("version_objective_id");
  CREATE INDEX "_ads_v_rels_niches_id_idx" ON "_ads_v_rels" USING btree ("niches_id");
  CREATE INDEX "_ads_v_rels_angles_id_idx" ON "_ads_v_rels" USING btree ("angles_id");
  CREATE INDEX "_ads_v_rels_markets_id_idx" ON "_ads_v_rels" USING btree ("markets_id");
  CREATE UNIQUE INDEX "industries_slug_idx" ON "industries" USING btree ("slug");
  CREATE INDEX "industries_updated_at_idx" ON "industries" USING btree ("updated_at");
  CREATE INDEX "industries_created_at_idx" ON "industries" USING btree ("created_at");
  CREATE UNIQUE INDEX "niches_slug_idx" ON "niches" USING btree ("slug");
  CREATE INDEX "niches_updated_at_idx" ON "niches" USING btree ("updated_at");
  CREATE INDEX "niches_created_at_idx" ON "niches" USING btree ("created_at");
  CREATE UNIQUE INDEX "angles_slug_idx" ON "angles" USING btree ("slug");
  CREATE INDEX "angles_updated_at_idx" ON "angles" USING btree ("updated_at");
  CREATE INDEX "angles_created_at_idx" ON "angles" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_clients_id_idx" ON "payload_locked_documents_rels" USING btree ("clients_id");
  CREATE INDEX "payload_locked_documents_rels_industries_id_idx" ON "payload_locked_documents_rels" USING btree ("industries_id");
  CREATE INDEX "payload_locked_documents_rels_niches_id_idx" ON "payload_locked_documents_rels" USING btree ("niches_id");
  CREATE INDEX "payload_locked_documents_rels_angles_id_idx" ON "payload_locked_documents_rels" USING btree ("angles_id");
  CREATE INDEX "payload_locked_documents_rels_objectives_id_idx" ON "payload_locked_documents_rels" USING btree ("objectives_id");
  CREATE INDEX "payload_locked_documents_rels_markets_id_idx" ON "payload_locked_documents_rels" USING btree ("markets_id");`)

  await restructureTags(db)
}

// Schema only: merged and retired tags cannot be rebuilt, restore a Neon branch for that.
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE "ads_languages", "_ads_v_version_languages", "clients", "objectives", "markets" CASCADE;
  ALTER TABLE "ads" DROP COLUMN "client_id", DROP COLUMN "objective_id", DROP COLUMN "product_type", DROP COLUMN "top_performer";
  ALTER TABLE "_ads_v" DROP COLUMN "version_client_id", DROP COLUMN "version_objective_id", DROP COLUMN "version_product_type", DROP COLUMN "version_top_performer";
  ALTER TABLE "ads_rels" DROP COLUMN "markets_id";
  ALTER TABLE "_ads_v_rels" DROP COLUMN "markets_id";
  ALTER TABLE "platforms" DROP COLUMN "description";
  ALTER TABLE "industries" DROP COLUMN "description";
  ALTER TABLE "niches" DROP COLUMN "description";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "clients_find", DROP COLUMN "objectives_find", DROP COLUMN "markets_find";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "clients_id", DROP COLUMN "objectives_id", DROP COLUMN "markets_id";
  DROP TYPE "public"."enum_ads_languages";
  DROP TYPE "public"."enum_ads_product_type";
  DROP TYPE "public"."enum__ads_v_version_languages";
  DROP TYPE "public"."enum__ads_v_version_product_type";

  UPDATE "ads_rels" SET "path" = 'subcategories' WHERE "path" = 'niches';
  UPDATE "ads_rels" SET "path" = 'contentTypes' WHERE "path" = 'angles';
  UPDATE "_ads_v_rels" SET "path" = 'version.subcategories' WHERE "path" = 'version.niches';
  UPDATE "_ads_v_rels" SET "path" = 'version.contentTypes' WHERE "path" = 'version.angles';

  ALTER TABLE "ads" DROP CONSTRAINT "ads_industry_id_industries_id_fk";
  ALTER TABLE "ads_rels" DROP CONSTRAINT "ads_rels_niches_fk";
  ALTER TABLE "ads_rels" DROP CONSTRAINT "ads_rels_angles_fk";
  ALTER TABLE "_ads_v" DROP CONSTRAINT "_ads_v_version_industry_id_industries_id_fk";
  ALTER TABLE "_ads_v_rels" DROP CONSTRAINT "_ads_v_rels_niches_fk";
  ALTER TABLE "_ads_v_rels" DROP CONSTRAINT "_ads_v_rels_angles_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_industries_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_niches_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_angles_fk";
  DROP INDEX "ads_industry_idx";
  DROP INDEX "ads_rels_niches_id_idx";
  DROP INDEX "ads_rels_angles_id_idx";
  DROP INDEX "_ads_v_version_version_industry_idx";
  DROP INDEX "_ads_v_rels_niches_id_idx";
  DROP INDEX "_ads_v_rels_angles_id_idx";
  DROP INDEX "industries_slug_idx";
  DROP INDEX "industries_updated_at_idx";
  DROP INDEX "industries_created_at_idx";
  DROP INDEX "niches_slug_idx";
  DROP INDEX "niches_updated_at_idx";
  DROP INDEX "niches_created_at_idx";
  DROP INDEX "angles_slug_idx";
  DROP INDEX "angles_updated_at_idx";
  DROP INDEX "angles_created_at_idx";
  DROP INDEX "payload_locked_documents_rels_industries_id_idx";
  DROP INDEX "payload_locked_documents_rels_niches_id_idx";
  DROP INDEX "payload_locked_documents_rels_angles_id_idx";

  ALTER TABLE "payload_mcp_api_keys" RENAME COLUMN "industries_find" TO "categories_find";
  ALTER TABLE "payload_mcp_api_keys" RENAME COLUMN "niches_find" TO "subcategories_find";
  ALTER TABLE "payload_mcp_api_keys" RENAME COLUMN "angles_find" TO "content_types_find";
  ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "industries_id" TO "categories_id";
  ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "niches_id" TO "subcategories_id";
  ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "angles_id" TO "content_types_id";
  ALTER TABLE "_ads_v_rels" RENAME COLUMN "niches_id" TO "subcategories_id";
  ALTER TABLE "_ads_v_rels" RENAME COLUMN "angles_id" TO "content_types_id";
  ALTER TABLE "ads_rels" RENAME COLUMN "niches_id" TO "subcategories_id";
  ALTER TABLE "ads_rels" RENAME COLUMN "angles_id" TO "content_types_id";
  ALTER TABLE "_ads_v" RENAME COLUMN "version_industry_id" TO "version_category_id";
  ALTER TABLE "ads" RENAME COLUMN "industry_id" TO "category_id";
  ALTER TABLE "angles" RENAME TO "content_types";
  ALTER TABLE "niches" RENAME TO "subcategories";
  ALTER TABLE "industries" RENAME TO "categories";

  ALTER TABLE "ads" ADD CONSTRAINT "ads_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ads_rels" ADD CONSTRAINT "ads_rels_subcategories_fk" FOREIGN KEY ("subcategories_id") REFERENCES "public"."subcategories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ads_rels" ADD CONSTRAINT "ads_rels_content_types_fk" FOREIGN KEY ("content_types_id") REFERENCES "public"."content_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ads_v" ADD CONSTRAINT "_ads_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ads_v_rels" ADD CONSTRAINT "_ads_v_rels_subcategories_fk" FOREIGN KEY ("subcategories_id") REFERENCES "public"."subcategories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ads_v_rels" ADD CONSTRAINT "_ads_v_rels_content_types_fk" FOREIGN KEY ("content_types_id") REFERENCES "public"."content_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subcategories_fk" FOREIGN KEY ("subcategories_id") REFERENCES "public"."subcategories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_content_types_fk" FOREIGN KEY ("content_types_id") REFERENCES "public"."content_types"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "ads_category_idx" ON "ads" USING btree ("category_id");
  CREATE INDEX "ads_rels_subcategories_id_idx" ON "ads_rels" USING btree ("subcategories_id");
  CREATE INDEX "ads_rels_content_types_id_idx" ON "ads_rels" USING btree ("content_types_id");
  CREATE INDEX "_ads_v_version_version_category_idx" ON "_ads_v" USING btree ("version_category_id");
  CREATE INDEX "_ads_v_rels_subcategories_id_idx" ON "_ads_v_rels" USING btree ("subcategories_id");
  CREATE INDEX "_ads_v_rels_content_types_id_idx" ON "_ads_v_rels" USING btree ("content_types_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "subcategories_slug_idx" ON "subcategories" USING btree ("slug");
  CREATE INDEX "subcategories_updated_at_idx" ON "subcategories" USING btree ("updated_at");
  CREATE INDEX "subcategories_created_at_idx" ON "subcategories" USING btree ("created_at");
  CREATE UNIQUE INDEX "content_types_slug_idx" ON "content_types" USING btree ("slug");
  CREATE INDEX "content_types_updated_at_idx" ON "content_types" USING btree ("updated_at");
  CREATE INDEX "content_types_created_at_idx" ON "content_types" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_subcategories_id_idx" ON "payload_locked_documents_rels" USING btree ("subcategories_id");
  CREATE INDEX "payload_locked_documents_rels_content_types_id_idx" ON "payload_locked_documents_rels" USING btree ("content_types_id");`)
}
