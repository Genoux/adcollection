"use client";

import { Link, NavGroup, useConfig } from "@payloadcms/ui";
import { usePathname } from "next/navigation";
import { INTEGRATIONS_PATH } from "@/payload/admin/integrations/url";

// Mirrors the markup of Payload's own nav entries (DefaultNavClient) so the link
// picks up the built-in nav styles, including the active indicator.
export function IntegrationsNavLink() {
  const pathname = usePathname();
  const { config } = useConfig();
  const href = `${config.routes.admin}${INTEGRATIONS_PATH}`;
  const isActive = pathname === href;

  const label = (
    <>
      {isActive && <div className="nav__link-indicator" />}
      <span className="nav__link-label">Integrations</span>
    </>
  );

  return (
    <NavGroup label="Settings">
      {isActive ? (
        <div className="nav__link">{label}</div>
      ) : (
        <Link className="nav__link" href={href} prefetch={false}>
          {label}
        </Link>
      )}
    </NavGroup>
  );
}
