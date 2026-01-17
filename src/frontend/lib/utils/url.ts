/**
 * URL utility functions - pure, no React dependencies
 * Easily testable without component rendering
 */

/**
 * Validates if a string is a valid HTTP/HTTPS URL
 */
export const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Extracts the hostname from a URL string
 */
export const extractDomain = (url: string): string | null => {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

/**
 * Gets a favicon URL for a given website URL using Google's favicon service
 */
export const getFaviconUrl = (url: string, size: number = 32): string | null => {
  const domain = extractDomain(url);
  return domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`
    : null;
};

/**
 * Normalizes a URL by ensuring it has a protocol
 */
export const normalizeUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};
