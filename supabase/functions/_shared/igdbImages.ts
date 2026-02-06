/**
 * IGDB image URL helpers.
 * IGDB image base: https://images.igdb.com/igdb/image/upload/
 * Common sizes: cover_small, cover_big, screenshot_med, screenshot_big, logo_med, t_cover_big, etc.
 */

const BASE = "https://images.igdb.com/igdb/image/upload/";

export function igdbImageUrl(imageId: string | null | undefined, size: string = "t_cover_big"): string | null {
  if (!imageId) return null;
  return `${BASE}${size}/${imageId}.jpg`;
}

export function firstImageUrl(imageIds: Array<string> | null | undefined, size: string = "t_cover_big"): string | null {
  if (!imageIds || imageIds.length === 0) return null;
  return igdbImageUrl(imageIds[0], size);
}
