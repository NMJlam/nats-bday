// Web-safe media only. Phone-native HEIC images and HEVC/.MOV video are rejected
// because many browsers cannot display them; users export/convert to these first.
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const ALLOWED_VIDEO_TYPES = ["video/mp4"] as const;

export const ALLOWED_MEDIA_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
];

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

export const ACCEPT_ATTR = ALLOWED_MEDIA_TYPES.join(",");
export const SUPPORTED_LABEL = "JPG, PNG, WebP, GIF, or MP4 (H.264) up to 10 MB (images) / 100 MB (video)";

export type MediaKind = "image" | "video";

export function mediaKindFromMime(mime: string): MediaKind | null {
  if ((ALLOWED_IMAGE_TYPES as readonly string[]).includes(mime)) {
    return "image";
  }
  if ((ALLOWED_VIDEO_TYPES as readonly string[]).includes(mime)) {
    return "video";
  }
  return null;
}

export function maxBytesFor(kind: MediaKind): number {
  return kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
}

export function isBlobUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}
