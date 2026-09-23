import config from "@payload-config";
import { getPayload } from "payload";
import { registerClient } from "@/payload/mcp/oauth/grants";
import {
  oauthErrorResponse,
  oauthJson,
  oauthPreflight,
  readParams,
} from "@/payload/mcp/oauth/http";

// Open by design (RFC 7591): a client row grants nothing until a signed-in user
// approves it on the consent screen.
export async function POST(request: Request) {
  const payload = await getPayload({ config });

  try {
    return oauthJson(await registerClient(payload, await readParams(request)), 201);
  } catch (error) {
    return oauthErrorResponse(error);
  }
}

export const OPTIONS = oauthPreflight;
