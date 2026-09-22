export type FrameioRendition =
  | "efficient"
  | "high_quality"
  | "original"
  | "thumbnail"
  | "thumbnail_high_quality"
  | "video_h264_180";

/**
 * `download_url` carries a Content-Disposition attachment header; `url` is the
 * header-free transcode link. Either can be null when watermarking or download
 * restrictions apply, so both are optional at the type level.
 */
export type FrameioMediaLink = {
  download_url?: null | string;
  inline_url?: null | string;
  url?: null | string;
};

export type FrameioFile = {
  created_at: string;
  creator?: { email?: string; id: string; name?: string };
  file_size: number;
  id: string;
  media_links?: Partial<Record<FrameioRendition, FrameioMediaLink>>;
  media_type: null | string;
  name: string;
  parent_id: string;
  project_id: string;
  status: "created" | "transcoded" | "uploaded";
  type: "file";
  updated_at: string;
  view_url: string;
};

export type FrameioFolder = {
  id: string;
  name: string;
  parent_id: null | string;
  project_id: string;
  type: "folder";
  view_url: string;
};

export type FrameioVersionStack = {
  id: string;
  name: string;
  type: "version_stack";
  view_url: string;
};

export type FrameioChild = FrameioFile | FrameioFolder | FrameioVersionStack;

export type FrameioAccount = {
  display_name?: string;
  id: string;
};

export type FrameioProject = {
  id: string;
  name: string;
  root_folder_id: string;
  status: "active" | "inactive";
  view_url: string;
};

export type FrameioList<T> = {
  data: T[];
  links?: { next: null | string };
};

export type FrameioSingle<T> = {
  data: T;
};
