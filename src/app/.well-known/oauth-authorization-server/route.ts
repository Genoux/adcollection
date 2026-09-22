import config from "@payload-config";
import { getPayload } from "payload";
import { oauthJson, oauthPreflight } from "@/payload/mcp/oauth/http";
import { issuerUrl, oauthEndpoints } from "@/payload/mcp/oauth/urls";

export async function GET() {
  const payload = await getPayload({ config });

  return oauthJson({
    ...oauthEndpoints(payload),
    authorization_response_iss_parameter_supported: true,
    code_challenge_methods_supported: ["S256"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    issuer: issuerUrl(),
    response_types_supported: ["code"],
    token_endpoint_auth_methods_supported: ["none"],
  });
}

export const OPTIONS = oauthPreflight;
