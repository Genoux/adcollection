import { frameioConfig } from "@/shared/lib/frameio/config";
import { FrameioError } from "@/shared/lib/frameio/errors";
import type {
  FrameioChild,
  FrameioFile,
  FrameioList,
  FrameioProject,
  FrameioSingle,
} from "@/shared/lib/frameio/types";

const IMS_TOKEN_URL = "https://ims-na1.adobelogin.com/ims/token/v3";
const FRAMEIO_API_BASE = "https://api.frame.io/v4";
const TOKEN_REFRESH_SKEW_MS = 60_000;

const MEDIA_LINK_INCLUDES = [
  "media_links.efficient",
  "media_links.high_quality",
  "media_links.original",
  "media_links.thumbnail_high_quality",
  "media_links.thumbnail",
].join(",");

let cachedToken: { expiresAt: number; value: string } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value;

  const config = frameioConfig();

  const response = await fetch(IMS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: config.FRAMEIO_CLIENT_ID,
      client_secret: config.FRAMEIO_CLIENT_SECRET,
      scope: "openid AdobeID frame.s2s.all",
    }),
  });

  if (!response.ok) {
    throw new FrameioError(
      `adobe ims token request failed: ${response.status} ${await response.text()}`,
      response.status,
    );
  }

  const token = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: token.access_token,
    expiresAt: Date.now() + token.expires_in * 1000 - TOKEN_REFRESH_SKEW_MS,
  };

  return cachedToken.value;
}

async function frameioFetch<T>(path: string, searchParams?: Record<string, string>): Promise<T> {
  const url = new URL(`${FRAMEIO_API_BASE}${path}`);
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${await getAccessToken()}` },
  });

  if (!response.ok) {
    throw new FrameioError(
      `frame.io ${path} failed: ${response.status} ${await response.text()}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

const accountPath = (path: string) => `/accounts/${frameioConfig().FRAMEIO_ACCOUNT_ID}${path}`;

export async function listProjects(): Promise<FrameioProject[]> {
  const { data } = await frameioFetch<FrameioList<FrameioProject>>(accountPath("/projects"));
  return data;
}

export const FOLDER_PAGE_SIZE = 50;

export async function listFolderChildren(
  folderId: string,
): Promise<{ children: FrameioChild[]; hasMore: boolean }> {
  const { data, links } = await frameioFetch<FrameioList<FrameioChild>>(
    accountPath(`/folders/${folderId}/children`),
    { sort: "created_at_desc", page_size: String(FOLDER_PAGE_SIZE) },
  );
  return { children: data, hasMore: Boolean(links?.next) };
}

export async function getFile(fileId: string): Promise<FrameioFile> {
  const { data } = await frameioFetch<FrameioSingle<FrameioFile>>(accountPath(`/files/${fileId}`), {
    include: `${MEDIA_LINK_INCLUDES},creator`,
  });
  return data;
}
