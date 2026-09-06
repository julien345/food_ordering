/**
 * Resolves the full URL for dish/category images.
 * - If the URL starts with http:// or https:// (e.g. Cloudinary: https://res.cloudinary.com/...),
 *   it returns the raw URL directly as-is without any prefix.
 * - If it's a data/blob/protocol-relative URL, returns it directly.
 * - If it's a relative path (e.g. /uploads/...), prefixes it with Vite's import.meta.env.VITE_API_URL.
 */
export function getDishImageUrl(
  dishOrUrl?: { imageUrl?: string | null; image?: string | null } | string | null
): string | null {
  if (!dishOrUrl) {
    return null;
  }

  let rawUrl: string | null = null;
  if (typeof dishOrUrl === 'string') {
    rawUrl = dishOrUrl;
  } else if (typeof dishOrUrl === 'object') {
    rawUrl = dishOrUrl.imageUrl || dishOrUrl.image || null;
  }

  if (!rawUrl || typeof rawUrl !== 'string') {
    return null;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return null;
  }

  // 1. Direct absolute URLs (Cloudinary, AWS S3, HTTPS, HTTP, data, blob)
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Protocol-relative URLs (e.g. //res.cloudinary.com/...)
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  // 2. Relative paths resolution using Vite environment variable
  const rawBaseUrl =
    (import.meta.env.VITE_API_URL as string | undefined) ||
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    '';

  const baseUrl = rawBaseUrl.trim().replace(/\/+$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  if (!baseUrl) {
    return cleanPath;
  }

  return `${baseUrl}${cleanPath}`;
}

/**
 * Resolves the full URL for category images.
 * Accepts either:
 * - a raw URL string (e.g. category.image)
 * - a Category object: { image?: string | null; ... }
 */
export function getCategoryImageUrl(
  categoryOrUrl?: { image?: string | null; imageUrl?: string | null } | string | null
): string | null {
  if (!categoryOrUrl) {
    return null;
  }

  let rawUrl: string | null = null;
  if (typeof categoryOrUrl === 'string') {
    rawUrl = categoryOrUrl;
  } else if (typeof categoryOrUrl === 'object') {
    rawUrl = categoryOrUrl.image || categoryOrUrl.imageUrl || null;
  }

  return getDishImageUrl(rawUrl);
}
