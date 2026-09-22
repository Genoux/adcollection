import type { BasePayload } from "payload";
import { env } from "@/shared/config/env";

export const AUTHORIZE_VIEW_PATH = "/mcp/authorize";

const site = () => env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

export const issuerUrl = site;

export const mcpResourceUrl = () => `${site()}/api/mcp`;

// RFC 9728 §3.1 inserts the resource's path after the well-known segment.
export const resourceMetadataUrl = () => `${site()}/.well-known/oauth-protected-resource/api/mcp`;

export const authorizeViewPath = (payload: BasePayload) =>
  `${payload.config.routes.admin}${AUTHORIZE_VIEW_PATH}`;

export const oauthEndpoints = (payload: BasePayload) => ({
  authorization_endpoint: `${site()}${authorizeViewPath(payload)}`,
  registration_endpoint: `${site()}/api/oauth/register`,
  token_endpoint: `${site()}/api/oauth/token`,
});

// Clients disagree on trailing slashes in the RFC 8707 `resource` parameter.
export const isOwnResource = (resource: null | string | undefined) =>
  !resource || resource.replace(/\/$/, "") === mcpResourceUrl();
