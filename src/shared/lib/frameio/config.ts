import { z } from "zod";
import { FrameioError } from "@/shared/lib/frameio/errors";

const schema = z.object({
  FRAMEIO_CLIENT_ID: z.string().min(1),
  FRAMEIO_CLIENT_SECRET: z.string().min(1),
  FRAMEIO_ACCOUNT_ID: z.uuid(),
  // Payload's upload pipeline is buffer-based end to end, so this cap is also the
  // per-import peak heap of the serverless function. Raising it past ~a third of the
  // function's memory will OOM before it reaches R2.
  FRAMEIO_MAX_VIDEO_MB: z.coerce.number().int().positive().default(100),
});

let cached: null | z.infer<typeof schema> = null;

/**
 * Deliberately not validated at import time, unlike shared/config/env. The Payload
 * config pulls the MCP tools in transitively, so an eager parse would take the whole
 * site down whenever Frame.io is unconfigured instead of only failing the import
 * tools that actually need it.
 */
export function frameioConfig() {
  if (cached) return cached;

  const parsed = schema.safeParse(process.env);

  if (!parsed.success) {
    throw new FrameioError(
      `Frame.io is not configured on this environment:\n${z.prettifyError(parsed.error)}`,
    );
  }

  cached = parsed.data;
  return cached;
}

export const maxVideoBytes = () => frameioConfig().FRAMEIO_MAX_VIDEO_MB * 1024 * 1024;
