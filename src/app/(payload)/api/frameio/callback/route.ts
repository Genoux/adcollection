import config from "@payload-config";
import { getPayload } from "payload";
import { integrationsPath, redirectTo } from "@/payload/admin/integrations/url";
import { completeConnection } from "@/payload/frameio/connection";

export async function GET(request: Request) {
  const payload = await getPayload({ config });
  const params = new URL(request.url).searchParams;
  const code = params.get("code");
  const state = params.get("state");

  const fail = (message: string) =>
    redirectTo(integrationsPath(payload, { frameio_error: message }));

  // Adobe reports a refused consent screen here rather than by not redirecting.
  const error = params.get("error");
  if (error) return fail(params.get("error_description") ?? error);

  if (!code || !state) return fail("the sign-in response from Adobe was incomplete.");

  try {
    await completeConnection(payload, state, code);
    return redirectTo(integrationsPath(payload));
  } catch (cause) {
    return fail(cause instanceof Error ? cause.message : "unknown error.");
  }
}
