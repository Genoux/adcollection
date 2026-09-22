import { DefaultTemplate } from "@payloadcms/next/templates";
import { Banner, Button, Gutter, Pill, SetStepNav } from "@payloadcms/ui";
import { redirect } from "next/navigation";
import type { AdminViewServerProps } from "payload";
import { FrameioLogo } from "@/payload/admin/integrations/frameio-logo";
import { loginPath } from "@/payload/admin/integrations/url";
import styles from "@/payload/admin/integrations/view.module.css";
import { type ConnectionStatus, connectionStatus } from "@/payload/frameio/connection";
import { listSessions } from "@/payload/mcp/oauth/grants";
import { mcpResourceUrl } from "@/payload/mcp/oauth/urls";
import { isFrameioConfigured } from "@/shared/lib/frameio/config";

// Date only: this renders on the server, whose timezone is not the viewer's.
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

function StatusPill({ status }: { status: ConnectionStatus }) {
  if (status.state === "connected") {
    return (
      <Pill pillStyle="success" rounded size="small">
        Connected
      </Pill>
    );
  }
  if (status.state === "expired") {
    return (
      <Pill pillStyle="warning" rounded size="small">
        Needs reconnect
      </Pill>
    );
  }
  return null;
}

function StatusLine({ configured, status }: { configured: boolean; status: ConnectionStatus }) {
  if (!configured) {
    return (
      <p className={styles.meta}>
        Not configured on this server. Set FRAMEIO_CLIENT_ID and FRAMEIO_CLIENT_SECRET.
      </p>
    );
  }
  if (status.state === "connected") {
    return (
      <p className={styles.meta}>
        {status.accountName} · renewed {formatDate(status.renewedAt)}
      </p>
    );
  }
  if (status.state === "expired") {
    return (
      <p className={`${styles.meta} ${styles.warning}`}>
        Access to {status.accountName} expired or was revoked.
      </p>
    );
  }
  return null;
}

function FrameioAction({ status }: { status: ConnectionStatus }) {
  if (status.state === "connected") {
    return (
      <form action="/api/frameio/disconnect" method="post">
        <Button buttonStyle="secondary" margin={false} size="medium" type="submit">
          Disconnect
        </Button>
      </form>
    );
  }

  return (
    <Button el="anchor" margin={false} size="medium" url="/api/frameio/authorize">
      {status.state === "expired" ? "Reconnect" : "Connect"}
    </Button>
  );
}

function McpClients({ sessions }: { sessions: Awaited<ReturnType<typeof listSessions>> }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>MCP clients</h2>
      <p className={styles.subtitle}>
        Add <code className={styles.code}>{mcpResourceUrl()}</code> to Cursor, Claude or any MCP
        client. It will ask you to sign in here, and act as you.
      </p>

      {sessions.length > 0 && (
        <ul className={styles.sessions}>
          {sessions.map((session) => (
            <li className={styles.session} key={session.id}>
              <div>
                <p className={styles.title}>{session.clientName}</p>
                <p className={styles.meta}>Signed in {formatDate(session.signedInAt)}</p>
              </div>
              <form action="/api/oauth/sessions/revoke" method="post">
                <input name="grantId" type="hidden" value={session.id} />
                <Button buttonStyle="secondary" margin={false} size="small" type="submit">
                  Revoke
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const firstParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export async function IntegrationsView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { req } = initPageResult;

  // Custom root views are not behind Payload's auth wall; each one has to check.
  if (!req.user) redirect(loginPath(req.payload));

  const configured = isFrameioConfigured();
  const [status, sessions] = await Promise.all([
    connectionStatus(req.payload, Number(req.user.id)),
    listSessions(req.payload, Number(req.user.id)),
  ]);
  const error = firstParam(searchParams?.frameio_error);

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={req.user}
      visibleEntities={initPageResult.visibleEntities}
    >
      <SetStepNav nav={[{ label: "Integrations" }]} />
      <Gutter>
        <header className={styles.header}>
          <h1>Integrations</h1>
          <p className={styles.subtitle}>
            Services the AdCollection MCP can use on your behalf. Connections are personal to your
            account.
          </p>
        </header>

        {error && <Banner type="error">{error}</Banner>}

        <div className={styles.list}>
          <article className={styles.card}>
            <div className={styles.logo}>
              <FrameioLogo />
            </div>

            <div className={styles.body}>
              <div className={styles.titleRow}>
                <h2 className={styles.title}>Frame.io</h2>
                {configured && <StatusPill status={status} />}
              </div>
              <p className={styles.description}>Browse projects and import videos as draft ads.</p>
              <StatusLine configured={configured} status={status} />
            </div>

            {configured && (
              <div className={styles.action}>
                <FrameioAction status={status} />
              </div>
            )}
          </article>
        </div>

        <McpClients sessions={sessions} />
      </Gutter>
    </DefaultTemplate>
  );
}
