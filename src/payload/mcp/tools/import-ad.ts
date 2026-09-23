import type { PayloadRequest } from "payload";
import { z } from "zod";
import { importFrameioVideo } from "@/payload/frameio/import-video";
import { deleteMedia } from "@/payload/frameio/media";
import { withFrameio } from "@/payload/mcp/lib/auth";
import { resolveTaxonomy, resolveTaxonomyMany } from "@/payload/mcp/lib/taxonomy";
import { type McpTool, text } from "@/payload/mcp/lib/tool";
import { env } from "@/shared/config/env";
import type { FrameioAuth } from "@/shared/lib/frameio/client";
import { formatBytes } from "@/shared/lib/frameio/renditions";

const schema = z.object({
  frameioFileId: z.string().describe("Frame.io file id of the video, from frameioBrowse."),

  thumbnailTitle: z
    .string()
    .max(60)
    .describe("Display caption with @handles, #hashtags and emojis removed."),
  name: z.string().describe("Product or brand being promoted. Shown on tooltips."),
  slug: z.string().describe("URL slug. Must be unique across all ads."),
  caption: z.string().min(8).max(100).optional(),

  platformSlug: z.string().describe("Slug of a platforms document, e.g. tiktok."),
  categorySlug: z.string().optional().describe("Slug of a categories document."),
  subcategorySlugs: z.array(z.string()).optional(),
  contentTypeSlugs: z.array(z.string()).optional(),

  madeWithInbeat: z.boolean().optional(),
  originalUrl: z.string().optional().describe("Link to the original ad if not made with inBeat."),

  companyName: z.string().optional(),
  companyWebsiteUrl: z.string().optional(),
  companyWebsiteDisplay: z.string().optional().describe("Shortened version of the website link."),
  brandHandleName: z.string().min(5).max(25).optional().describe("e.g. @dr.squatch"),
  brandHandleUrl: z.string().optional(),
  soundName: z.string().optional(),
  soundUrl: z.string().optional(),

  creatorHandle: z.string().optional(),
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
    "Import a Frame.io video as a draft ad. Downloads the web-sized rendition and its poster frame into Media, resolves the taxonomy slugs, and creates the ad unpublished for human review. Returns the admin edit URL.",
  parameters: schema.shape,
  handler: (args, req) => withFrameio(req, (auth) => runImport(auth, args as ImportArgs, req)),
};

async function runImport(auth: FrameioAuth, input: ImportArgs, req: PayloadRequest) {
  await assertSlugAvailable(req, input.slug);

  const [platform, category, subcategories, contentTypes] = await Promise.all([
    resolveTaxonomy(req, "platforms", input.platformSlug),
    input.categorySlug ? resolveTaxonomy(req, "categories", input.categorySlug) : undefined,
    resolveTaxonomyMany(req, "subcategories", input.subcategorySlugs ?? []),
    resolveTaxonomyMany(req, "content-types", input.contentTypeSlugs ?? []),
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
        companyName: input.companyName,
        companyWebsiteUrl: input.companyWebsiteUrl,
        companyWebsiteDisplay: input.companyWebsiteDisplay,
        brandHandleName: input.brandHandleName,
        brandHandleUrl: input.brandHandleUrl,
        soundName: input.soundName,
        soundUrl: input.soundUrl,
        creatorHandle: input.creatorHandle,
        creatorProfileUrl: input.creatorProfileUrl,
        platform,
        category,
        subcategories,
        contentTypes,
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
