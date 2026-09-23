import config from "@payload-config";
import { getPayload } from "payload";
import { integrationsPath, redirectTo } from "@/payload/admin/integrations/url";
import { disconnect } from "@/payload/frameio/connection";

// POST only, so a link or image tag on another site cannot disconnect someone.
// Payload's session cookie is SameSite=Lax, which already withholds it from
// cross-site form posts.
export async function POST(request: Request) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });

  if (!user) return new Response(null, { status: 401 });

  await disconnect(payload, user.id);

  // 303 so the browser follows with a GET rather than re-posting to the admin page.
  return redirectTo(integrationsPath(payload), 303);
}
