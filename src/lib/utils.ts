import { NextRequest } from 'next/server';

/**
 * Validates whether a given string is a valid Instagram Reel, Video, or Post URL.
 */
export function validateInstagramUrl(url: string): boolean {
  if (!url) return false;
  // Matches:
  // - https://www.instagram.com/p/abc123xyz/
  // - https://instagram.com/reel/abc123xyz/
  // - https://www.instagram.com/tv/abc123xyz/?igsh=...
  // - https://www.instagram.com/stories/username/12345/
  const regex = /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|tv|stories)\/[A-Za-z0-9_\-\.\/]+/;
  return regex.test(url);
}

/**
 * Resolves the client IP address from a NextRequest, checking common proxy headers.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  // Fallback if not behind proxy
  return '127.0.0.1';
}

/**
 * Clean Instagram URL to remove tracking parameters
 */
export function cleanInstagramUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
}
