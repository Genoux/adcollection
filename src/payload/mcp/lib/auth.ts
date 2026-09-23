import type { PayloadRequest } from "payload";
import { integrationsPath } from "@/payload/admin/integrations/url";
import { authForUser, FrameioNotConnectedError } from "@/payload/frameio/connection";
import { type McpToolResult, text } from "@/payload/mcp/lib/tool";
import { env } from "@/shared/config/env";
import type { FrameioAuth } from "@/shared/lib/frameio/client";
import { FrameioError } from "@/shared/lib/frameio/errors";

/**
 * Answers with the connect link instead of throwing when the caller has no usable
 * Frame.io credential, so an agent can hand the human something actionable rather
 * than surfacing a stack trace it cannot resolve on its own.
 */
export async function withFrameio(
  req: PayloadRequest,
  run: (auth: FrameioAuth) => Promise<McpToolResult>,
): Promise<McpToolResult> {
  if (!req.user) return text("this tool requires an authenticated Payload user.");

  try {
    return await run(await authForUser(req.payload, Number(req.user.id)));
  } catch (error) {
    if (error instanceof FrameioNotConnectedError) {
      return text(
        `${error.message}\nconnect Frame.io here, then run this again: ${env.NEXT_PUBLIC_SITE_URL}${integrationsPath(req.payload)}`,
      );
    }
    // Frame.io failures (not a video, still transcoding, over the size cap) are
    // messages the agent can act on, not server faults.
    if (error instanceof FrameioError) return text(error.message);
    throw error;
  }
}
