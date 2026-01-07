const IGDB_IMAGE_BASE_URL = 'https://images.igdb.com/igdb/image/upload';
const DEFAULT_IMAGE_URL = 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg';

export type ImageSize =
  | 't_cover_small'
  | 't_cover_big'
  | 't_screenshot_med'
  | 't_screenshot_big'
  | 't_screenshot_huge'
  | 't_thumb'
  | 't_micro'
  | 't_720p'
  | 't_1080p'
  | 't_logo_med';

export interface ImageOptions {
  size?: ImageSize;
  format?: 'jpg' | 'png' | 'webp';
  fallback?: string;
}

export function buildImageUrl(
  imageId: string | null | undefined,
  options: ImageOptions = {}
): string {
  if (!imageId) {
    return options.fallback || DEFAULT_IMAGE_URL;
  }

  const size = options.size || 't_cover_big';
  const format = options.format || 'jpg';

  return `${IGDB_IMAGE_BASE_URL}/${size}/${imageId}.${format}`;
}

export function buildCoverUrl(imageId: string | null | undefined, large = true): string {
  return buildImageUrl(imageId, {
    size: large ? 't_cover_big' : 't_cover_small',
  });
}

export function buildScreenshotUrl(
  imageId: string | null | undefined,
  size: 'med' | 'big' | 'huge' = 'big'
): string {
  const sizeMap = {
    med: 't_screenshot_med',
    big: 't_screenshot_big',
    huge: 't_screenshot_huge',
  } as const;

  return buildImageUrl(imageId, {
    size: sizeMap[size],
  });
}

export function buildLogoUrl(imageId: string | null | undefined): string {
  return buildImageUrl(imageId, {
    size: 't_logo_med',
    format: 'png',
  });
}

export function build720pUrl(imageId: string | null | undefined): string {
  return buildImageUrl(imageId, {
    size: 't_720p',
  });
}

export function build1080pUrl(imageId: string | null | undefined): string {
  return buildImageUrl(imageId, {
    size: 't_1080p',
  });
}

export function buildThumbnailUrl(imageId: string | null | undefined): string {
  return buildImageUrl(imageId, {
    size: 't_thumb',
  });
}

export function getDefaultImageUrl(): string {
  return DEFAULT_IMAGE_URL;
}

export function sanitizeImageUrl(url: string | null | undefined): string {
  if (!url) return DEFAULT_IMAGE_URL;

  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  return url;
}
