export type PickerItem =
  | { id: string; kind: "folder"; name: string }
  | { id: string; kind: "stack"; name: string }
  | { id: string; kind: "video"; name: string; ready: boolean; thumbnail: null | string };

export type PickerPlace = { id: string; kind: "folder" | "stack"; name: string };

export type BrowseResponse = { items: PickerItem[]; next: null | string };

export type ImportResponse = { thumbnail: number; video: number };

export type PickerError = { connectUrl?: string; error: string };
