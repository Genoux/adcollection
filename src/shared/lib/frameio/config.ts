import { z } from "zod";
import { FrameioError } from "@/shared/lib/frameio/errors";

const schema = z.object({
  FRAMEIO_CLIENT_ID: z.string().min(1),
  // Rejects only the one mix-up that is easy to make, instead of requiring the
  // current `p8e-` prefix, which older Adobe credentials were issued without.
  FRAMEIO_CLIENT_SECRET: z
    .string()
    .min(1)
    .refine((value) => !value.startsWith("fio-"), {
      message:
        "this is a Frame.io developer token, not the Adobe client secret. Copy the secret from the OAuth Web App credential in the Adobe Developer Console.",
    }),
  // Payload's upload pipeline is buffer-based end to end, so this cap is also the
  // per-import peak heap of the serverless function. Raising it past ~a third of the
  // function's memory will OOM before it reaches R2.
  FRAMEIO_MAX_VIDEO_MB: z.coerce.number().int().positive().default(100),
});

/**
 * Deliberately not validated at import time, unlike shared/config/env. The Payload
 * config pulls the MCP tools in transitively, so an eager parse would take the whole
 * site down whenever Frame.io is unconfigured instead of only failing the import
 * tools that actually need it.
 *
 * Not memoised either: `next dev` reloads .env.local into process.env in place, and
 * a cached parse would keep serving the old credentials until a full restart.
 */
export function frameioConfig() {
  const parsed = schema.safeParse(process.env);

  if (!parsed.success) {
    throw new FrameioError(
      `Frame.io is not configured on this environment:\n${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data;
}

export const isFrameioConfigured = () => schema.safeParse(process.env).success;

export const CALLBACK_PATH = "/api/frameio/callback";

/**
 * Must match a redirect URI registered on the Adobe OAuth Web App credential
 * byte for byte, so it is derived from one source rather than configured twice.
 * Adobe rejects plain http even on localhost, which is why dev runs behind the
 * local.adcollection.co certificates instead of localhost.
 */
export function redirectUri() {
  // Read straight from the environment rather than shared/config/env, whose eager
  // parse would pull the whole app's schema into this module's import graph.
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

  if (!base.startsWith("https://")) {
    throw new FrameioError(
      `Adobe requires an https redirect URI, but NEXT_PUBLIC_SITE_URL is "${base}". Set it to https://local.adcollection.co:3000 for local development.`,
    );
  }

  return `${base}${CALLBACK_PATH}`;
}

export const maxVideoBytes = () => frameioConfig().FRAMEIO_MAX_VIDEO_MB * 1024 * 1024;
