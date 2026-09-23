import type { BasePayload } from "payload";

export const INTEGRATIONS_PATH = "/integrations";

export function integrationsPath(payload: BasePayload, params?: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  return `${payload.config.routes.admin}${INTEGRATIONS_PATH}${query ? `?${query}` : ""}`;
}

export function loginPath(payload: BasePayload, back = integrationsPath(payload)) {
  return `${payload.config.routes.admin}/login?redirect=${encodeURIComponent(back)}`;
}

/**
 * Relative on purpose. Behind `next dev --experimental-https` the request URL
 * reports localhost rather than the host the browser used, and an absolute
 * redirect built from it would move the user onto a host their session cookie
 * does not belong to.
 */
export const redirectTo = (path: string, status: 302 | 303 = 302) =>
  new Response(null, { status, headers: { Location: path } });
