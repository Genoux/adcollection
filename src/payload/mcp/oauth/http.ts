import { OAuthError } from "@/payload/mcp/oauth/grants";

// Wildcard CORS is safe here: none of these endpoints read cookies, and
// browser-based MCP clients (MCP Inspector) cannot sign in without it.
const CORS_HEADERS = {
  "Access-Control-Allow-Headers": "Authorization, Content-Type, MCP-Protocol-Version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

export const oauthJson = (body: unknown, status = 200) =>
  Response.json(body, {
    headers: { ...CORS_HEADERS, "Cache-Control": "no-store", Pragma: "no-cache" },
    status,
  });

export const oauthPreflight = () => new Response(null, { headers: CORS_HEADERS, status: 204 });

export function oauthErrorResponse(error: unknown) {
  if (error instanceof OAuthError) {
    const status = error.code === "invalid_client" ? 401 : 400;
    return oauthJson({ error: error.code, error_description: error.message }, status);
  }
  throw error;
}

// RFC 6749 mandates form encoding, but some clients send JSON to /register and /token.
export async function readParams(request: Request): Promise<Record<string, unknown>> {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) return (await request.json()) as Record<string, unknown>;
  return Object.fromEntries(new URLSearchParams(await request.text()));
}
