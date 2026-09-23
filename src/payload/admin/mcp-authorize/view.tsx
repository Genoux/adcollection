import { MinimalTemplate } from "@payloadcms/next/templates";
import { Button } from "@payloadcms/ui";
import { redirect } from "next/navigation";
import type { AdminViewServerProps } from "payload";
import { loginPath } from "@/payload/admin/integrations/url";
import styles from "@/payload/admin/mcp-authorize/view.module.css";
import { parseAuthorizationRequest } from "@/payload/mcp/oauth/grants";
import { authorizeViewPath } from "@/payload/mcp/oauth/urls";

const toParams = (searchParams: AdminViewServerProps["searchParams"]) =>
  new URLSearchParams(
    Object.entries(searchParams ?? {}).flatMap(([key, value]) =>
      (Array.isArray(value) ? value : [value]).flatMap((v) => (v === undefined ? [] : [[key, v]])),
    ),
  );

// Shown so a user can notice a client that claims one name but returns to another app.
const destination = (redirectUri: string) => {
  const url = new URL(redirectUri);
  return url.host ? `${url.protocol}//${url.host}` : url.protocol;
};

export async function McpAuthorizeView({ initPageResult, searchParams }: AdminViewServerProps) {
  const { req } = initPageResult;
  const params = toParams(searchParams);

  if (req.user?.collection !== "users")
    redirect(loginPath(req.payload, `${authorizeViewPath(req.payload)}?${params}`));

  const parsed = await parseAuthorizationRequest(req.payload, params);

  if (!parsed.ok && parsed.redirectTo) redirect(parsed.redirectTo);

  return (
    <MinimalTemplate>
      <div className={styles.card}>
        {parsed.ok ? (
          <>
            <h1 className={styles.title}>
              Allow {parsed.request.client.clientName ?? "this MCP client"} to use AdCollection?
            </h1>
            <p className={styles.lead}>
              It will act as <strong>{req.user.email}</strong> and can:
            </p>
            <ul className={styles.scopes}>
              <li>Browse your connected Frame.io account and import videos as draft ads</li>
              <li>Read and edit ads, and read media and taxonomy</li>
            </ul>
            <p className={styles.meta}>
              Returns to {destination(parsed.request.redirectUri)}. You can revoke access anytime
              from Integrations.
            </p>

            <form action="/api/oauth/authorize" className={styles.actions} method="post">
              {[...params].map(([key, value]) => (
                <input key={key} name={key} type="hidden" value={value} />
              ))}
              <Button
                buttonStyle="secondary"
                extraButtonProps={{ name: "decision", value: "deny" }}
                margin={false}
                type="submit"
              >
                Cancel
              </Button>
              <Button
                extraButtonProps={{ name: "decision", value: "allow" }}
                margin={false}
                type="submit"
              >
                Allow
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className={styles.title}>Can't connect this MCP client</h1>
            <p className={styles.lead}>{parsed.error.message}</p>
          </>
        )}
      </div>
    </MinimalTemplate>
  );
}
