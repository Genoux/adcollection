import config from "@payload-config";
import { getPayload } from "payload";
import { redirectTo } from "@/payload/admin/integrations/url";
import {
  authorizationRedirect,
  issueCode,
  parseAuthorizationRequest,
} from "@/payload/mcp/oauth/grants";

// The consent form posts here. Cross-site forgery is covered by Payload's
// SameSite=Lax session cookie, which a foreign site's POST does not carry.
export async function POST(request: Request) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });

  if (!user) return new Response("sign in to Payload first.", { status: 401 });

  const params = new URLSearchParams(await request.text());
  const decision = params.get("decision");
  params.delete("decision");

  const parsed = await parseAuthorizationRequest(payload, params);

  if (!parsed.ok) {
    return parsed.redirectTo
      ? redirectTo(parsed.redirectTo, 303)
      : new Response(parsed.error.message, { status: 400 });
  }

  const { redirectUri, state } = parsed.request;

  if (decision !== "allow") {
    return redirectTo(
      authorizationRedirect(redirectUri, {
        error: "access_denied",
        error_description: "the user declined.",
        state,
      }),
      303,
    );
  }

  const code = await issueCode(payload, Number(user.id), parsed.request);
  return redirectTo(authorizationRedirect(redirectUri, { code, state }), 303);
}
