import type { Ad, Client } from "@/payload-types";
import { normalizeHandle, requirePopulated } from "./taxonomy";

export type ClientSummary = { id: number; name: string; slug: string };

export type ClientProfile = ClientSummary & {
  logoUrl: string | null;
  websiteUrl: string | null;
  websiteDisplay: string | null;
  handle: string | null;
  handleUrl: string | null;
};

export type Creator = { handle: string; profileUrl: string | null };

export function toClientSummary(client: Client): ClientSummary {
  return { id: client.id, name: client.name, slug: client.slug };
}

export function toClientProfile(client: Client): ClientProfile {
  return {
    ...toClientSummary(client),
    logoUrl: requirePopulated(client.logo, "client.logo")?.url ?? null,
    websiteUrl: client.websiteUrl ?? null,
    websiteDisplay: client.websiteDisplay ?? null,
    handle: normalizeHandle(client.handle),
    handleUrl: client.handleUrl ?? null,
  };
}

export function toCreator(creator: Ad["creator"]): Creator | null {
  const handle = normalizeHandle(creator?.handle);
  return handle ? { handle, profileUrl: creator?.profileUrl ?? null } : null;
}
