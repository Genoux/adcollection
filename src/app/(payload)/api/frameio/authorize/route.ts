import config from "@payload-config";
import { getPayload } from "payload";
import { integrationsPath, loginPath, redirectTo } from "@/payload/admin/integrations/url";
import { beginConnection } from "@/payload/frameio/connection";

// Static segments win over the sibling [...slug] catch-all that serves Payload's
// REST API, so this does not shadow any Payload route.
export async function GET(request: Request) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });

  if (!user) return redirectTo(loginPath(payload));

  try {
    return redirectTo(await beginConnection(payload, user.id));
  } catch (error) {
    const message = error instanceof Error ? error.message : "could not start the connection.";
    return redirectTo(integrationsPath(payload, { frameio_error: message }));
  }
}
