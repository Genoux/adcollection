import { FrameioError } from "@/shared/lib/frameio/errors";
import type {
  FrameioAccount,
  FrameioChild,
  FrameioFile,
  FrameioList,
  FrameioProject,
  FrameioSingle,
} from "@/shared/lib/frameio/types";

const FRAMEIO_API_BASE = "https://api.frame.io/v4";

const MEDIA_LINK_INCLUDES = [
  "media_links.efficient",
  "media_links.high_quality",
  "media_links.original",
  "media_links.thumbnail_high_quality",
  "media_links.thumbnail",
].join(",");

/**
 * Passed in rather than resolved here: tokens belong to the Payload user behind the
 * request, and resolving them in this module would make it import the connection
 * store, which already imports this module to discover the account id.
 */
export type FrameioAuth = {
  accessToken: string;
  accountId: string;
};

async function frameioFetch<T>(
  path: string,
  accessToken: string,
  searchParams?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${FRAMEIO_API_BASE}${path}`);
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new FrameioError(
      `frame.io ${path} failed: ${response.status} ${await response.text()}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

/**
 * Not account-scoped: this is how an account id is discovered in the first place.
 * /v4/me deliberately does not return one.
 */
export async function listAccounts(accessToken: string): Promise<FrameioAccount[]> {
  const { data } = await frameioFetch<FrameioList<FrameioAccount>>("/accounts", accessToken);
  return data;
}

const accountPath = (auth: FrameioAuth, path: string) => `/accounts/${auth.accountId}${path}`;

export async function listProjects(auth: FrameioAuth): Promise<FrameioProject[]> {
  const { data } = await frameioFetch<FrameioList<FrameioProject>>(
    accountPath(auth, "/projects"),
    auth.accessToken,
  );
  return data;
}

export const FOLDER_PAGE_SIZE = 50;

export type ChildrenPage = { children: FrameioChild[]; next: null | string };

export type ChildrenOptions = {
  after?: string;
  // Only the small poster: `original` would 403 for viewers without download rights.
  thumbnails?: boolean;
};

// Frame.io returns the next page as a full URL; only its opaque cursor is portable.
const cursorOf = (next: null | string | undefined) =>
  next ? new URL(next, FRAMEIO_API_BASE).searchParams.get("after") : null;

async function listChildren(
  auth: FrameioAuth,
  path: string,
  { after, thumbnails }: ChildrenOptions,
): Promise<ChildrenPage> {
  const { data, links } = await frameioFetch<FrameioList<FrameioChild>>(
    accountPath(auth, path),
    auth.accessToken,
    {
      page_size: String(FOLDER_PAGE_SIZE),
      sort: "created_at_desc",
      ...(after && { after }),
      ...(thumbnails && { include: "media_links.thumbnail" }),
    },
  );
  return { children: data, next: cursorOf(links?.next) };
}

export const listFolderChildren = (auth: FrameioAuth, folderId: string, options = {}) =>
  listChildren(auth, `/folders/${folderId}/children`, options);

export const listVersionStackChildren = (auth: FrameioAuth, stackId: string, options = {}) =>
  listChildren(auth, `/version_stacks/${stackId}/children`, options);

export async function getFile(auth: FrameioAuth, fileId: string): Promise<FrameioFile> {
  const { data } = await frameioFetch<FrameioSingle<FrameioFile>>(
    accountPath(auth, `/files/${fileId}`),
    auth.accessToken,
    { include: `${MEDIA_LINK_INCLUDES},creator` },
  );
  return data;
}
