import config from "@payload-config";
import { getPayload } from "payload";
import { integrationsPath, redirectTo } from "@/payload/admin/integrations/url";
import { revokeSession } from "@/payload/mcp/oauth/grants";

export async function POST(request: Request) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });

  if (!user) return new Response(null, { status: 401 });

  const grantId = Number(new URLSearchParams(await request.text()).get("grantId"));
  if (Number.isInteger(grantId)) await revokeSession(payload, Number(user.id), grantId);

  return redirectTo(integrationsPath(payload), 303);
}
