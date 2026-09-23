import type { PayloadRequest } from "payload";
import { z } from "zod";
import { importFrameioVideo } from "@/payload/frameio/import-video";
import { deleteMedia } from "@/payload/frameio/media";
import { withFrameio } from "@/payload/mcp/lib/auth";
import { resolveTaxonomy, resolveTaxonomyMany } from "@/payload/mcp/lib/taxonomy";
import { type McpTool, text } from "@/payload/mcp/lib/tool";
import { LANGUAGE_OPTIONS, optionValues, PRODUCT_TYPE_OPTIONS } from "@/payload/tag-options";
import { env } from "@/shared/config/env";
import type { FrameioAuth } from "@/shared/lib/frameio/client";
import { formatBytes } from "@/shared/lib/frameio/renditions";

const schema = z.object({
  frameioFileId: z.string().describe("Frame.io file id of the video, from frameioBrowse."),

  thumbnailTitle: z
    .string()
    .max(60)
    .describe("Display caption with @handles, #hashtags and emojis removed."),
  name: z.string().describe("Product being promoted. Shown on tooltips."),
  slug: z.string().describe("URL slug. Must be unique across all ads."),
  caption: z.string().min(8).max(100).optional(),

  clientSlug: z
    .string()
    .describe("Slug of a clients document. Create the client in the admin first."),
  contentTypeSlugs: z.array(z.string()).min(1).describe("Content type slugs, e.g. ugc, b-roll."),
  platformSlug: z.string().describe("Slug of a platforms document, e.g. tiktok."),
  industrySlug: z.string().optional(),
  nicheSlugs: z.array(z.string()).optional(),
  angleSlugs: z.array(z.string()).optional().describe("Angle slugs, e.g. testimonial, unboxing."),
  objectiveSlug: z.string().optional().describe("Objective slug, e.g. awareness, conversion."),
  marketSlugs: z.array(z.string()).optional().describe("Market slugs, e.g. us, canada."),
  productType: z.enum(optionValues(PRODUCT_TYPE_OPTIONS)).optional(),
  languages: z.array(z.enum(optionValues(LANGUAGE_OPTIONS))).optional(),

  madeWithInbeat: z.boolean().optional(),
  originalUrl: z.string().optional().describe("Link to the original ad if not made with inBeat."),

  soundName: z.string().optional(),
  soundUrl: z.string().optional(),

  creatorHandle: z.string().optional().describe("Creator handle without @."),
  creatorProfileUrl: z.string().optional(),

  ratingAudienceGrab: z.number().int().min(1).max(10).optional(),
  ratingWatchability: z.number().int().min(1).max(10).optional(),
  ratingClarity: z.number().int().min(1).max(10).optional(),
  highlight: z.string().max(290).optional().describe("Short statement about the strongest metric."),
  highlightMetric: z.enum(["audience-grab", "watchability", "ad-clarity"]).optional(),
});

type ImportArgs = z.infer<typeof schema>;

async function assertSlugAvailable(req: PayloadRequest, slug: string) {
  const { totalDocs } = await req.payload.count({
    collection: "ads",
    where: { slug: { equals: slug } },
    req,
  });

  if (totalDocs > 0) {
    throw new Error(`an ad already uses the slug "${slug}". Pick a different one.`);
  }
}

export const importFrameioAd: McpTool = {
  name: "importFrameioAd",
  description:
    "Import a Frame.io video as a draft ad. Downloads the web-sized rendition and its poster frame into Media, resolves the tag slugs, and creates the ad unpublished for human review. Returns the admin edit URL.",
  parameters: schema.shape,
  handler: (args, req) => withFrameio(req, (auth) => runImport(auth, args as ImportArgs, req)),
};

async function runImport(auth: FrameioAuth, input: ImportArgs, req: PayloadRequest) {
  await assertSlugAvailable(req, input.slug);

  const [client, contentTypes, platform, industry, niches, angles, objective, markets] =
    await Promise.all([
      resolveTaxonomy(req, "clients", input.clientSlug),
      resolveTaxonomyMany(req, "content-types", input.contentTypeSlugs),
      resolveTaxonomy(req, "platforms", input.platformSlug),
      input.industrySlug ? resolveTaxonomy(req, "industries", input.industrySlug) : undefined,
      resolveTaxonomyMany(req, "niches", input.nicheSlugs ?? []),
      resolveTaxonomyMany(req, "angles", input.angleSlugs ?? []),
      input.objectiveSlug ? resolveTaxonomy(req, "objectives", input.objectiveSlug) : undefined,
      resolveTaxonomyMany(req, "markets", input.marketSlugs ?? []),
    ]);

  const { file, posterAsset, thumbnail, video, videoAsset } = await importFrameioVideo(
    req,
    auth,
    input.frameioFileId,
    input.thumbnailTitle,
  );

  try {
    const ad = await req.payload.create({
      collection: "ads",
      draft: true,
      overrideAccess: false,
      req,
      data: {
        thumbnailTitle: input.thumbnailTitle,
        name: input.name,
        slug: input.slug,
        caption: input.caption,
        video: video.id,
        thumbnail: thumbnail.id,
        madeWithInbeat: input.madeWithInbeat,
        originalUrl: input.originalUrl,
        client,
        creator: {
          handle: input.creatorHandle?.trim().replace(/^@+/, ""),
          profileUrl: input.creatorProfileUrl,
        },
        soundName: input.soundName,
        soundUrl: input.soundUrl,
        contentTypes,
        platform,
        industry,
        niches,
        angles,
        objective,
        markets,
        productType: input.productType,
        languages: input.languages,
        ratingAudienceGrab: input.ratingAudienceGrab,
        ratingWatchability: input.ratingWatchability,
        ratingClarity: input.ratingClarity,
        highlight: input.highlight,
        highlightMetric: input.highlightMetric,
      },
    });

    return text(
      [
        `imported "${file.name}" as a draft ad.`,
        `video: ${videoAsset.rendition} rendition, ${formatBytes(videoAsset.data.byteLength)}`,
        `poster: ${posterAsset.rendition} rendition`,
        `review and publish: ${env.NEXT_PUBLIC_SITE_URL}/admin/collections/ads/${ad.id}`,
      ].join("\n"),
    );
  } catch (error) {
    await deleteMedia(req, [video.id, thumbnail.id]);
    throw error;
  }
}
