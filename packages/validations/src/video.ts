import { getStorageRelativePath } from "./image";

export const MAX_HERO_VIDEO_SIZE = 30 * 1024 * 1024;

export function isValidVideoUrl(url: string): boolean {
  const storagePath = getStorageRelativePath(url);
  return storagePath !== null && /\.mp4$/i.test(storagePath);
}

export function isOwnedVideoUrl(url: string, ownerPrefix: string): boolean {
  const storagePath = getStorageRelativePath(url);
  if (storagePath === null) return false;

  const normalizedPrefix = ownerPrefix.replace(/^\/+|\/+$/g, "");
  return storagePath.startsWith(`${normalizedPrefix}/`) && isValidVideoUrl(url);
}
