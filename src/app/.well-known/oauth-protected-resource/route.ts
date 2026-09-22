import { oauthJson, oauthPreflight } from "@/payload/mcp/oauth/http";
import { issuerUrl, mcpResourceUrl } from "@/payload/mcp/oauth/urls";

export function GET() {
  return oauthJson({
    authorization_servers: [issuerUrl()],
    bearer_methods_supported: ["header"],
    resource: mcpResourceUrl(),
    resource_name: "AdCollection",
  });
}

export const OPTIONS = oauthPreflight;
