import config from "@payload-config";
import { getPayload } from "payload";
import { OAuthError, redeemCode, refreshGrant } from "@/payload/mcp/oauth/grants";
import {
  oauthErrorResponse,
  oauthJson,
  oauthPreflight,
  readParams,
} from "@/payload/mcp/oauth/http";
import { isOwnResource } from "@/payload/mcp/oauth/urls";

const required = (params: Record<string, unknown>, key: string) => {
  const value = params[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new OAuthError("invalid_request", `${key} is required.`);
  }
  return value;
};

export async function POST(request: Request) {
  const payload = await getPayload({ config });

  try {
    const params = await readParams(request);
    const resource = typeof params.resource === "string" ? params.resource : null;
    if (!isOwnResource(resource)) {
      throw new OAuthError("invalid_target", "tokens can only be issued for this MCP server.");
    }

    switch (params.grant_type) {
      case "authorization_code":
        return oauthJson(
          await redeemCode(payload, {
            clientId: required(params, "client_id"),
            code: required(params, "code"),
            codeVerifier: required(params, "code_verifier"),
            redirectUri: required(params, "redirect_uri"),
          }),
        );
      case "refresh_token":
        return oauthJson(
          await refreshGrant(payload, {
            clientId: required(params, "client_id"),
            refreshToken: required(params, "refresh_token"),
          }),
        );
      default:
        throw new OAuthError("unsupported_grant_type", "use authorization_code or refresh_token.");
    }
  } catch (error) {
    return oauthErrorResponse(error);
  }
}

export const OPTIONS = oauthPreflight;
