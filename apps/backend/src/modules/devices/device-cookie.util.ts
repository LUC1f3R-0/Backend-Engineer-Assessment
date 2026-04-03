import type { Response } from 'express';
import { getAppConfig } from '../../config/app.config';

export const DEVICE_COOKIE_ID = 'mo_device_id';
export const DEVICE_COOKIE_SECRET = 'mo_device_secret';

/** Minimal Cookie header parser (no extra dependency). */
export function parseCookieHeader(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header || typeof header !== 'string') {
    return out;
  }
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) {
      continue;
    }
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (name) {
      try {
        out[name] = decodeURIComponent(value);
      } catch {
        out[name] = value;
      }
    }
  }
  return out;
}

function buildSetCookieLine(name: string, value: string): string {
  const cfg = getAppConfig();
  const maxAge = cfg.deviceCookieMaxAgeSec;
  const parts = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    'HttpOnly',
  ];
  if (cfg.deviceCookieSecure) {
    parts.push('Secure');
    // Cross-origin SPA (e.g. Netlify) → API (e.g. Cloud Run): credentialed fetch requires SameSite=None + Secure.
    parts.push('SameSite=None');
  } else {
    parts.push('SameSite=Lax');
  }
  if (cfg.deviceCookieDomain) {
    parts.push(`Domain=${cfg.deviceCookieDomain}`);
  }
  return parts.join('; ');
}

/** Appends two Set-Cookie headers (device id + secret). */
export function appendDeviceSessionCookies(res: Response, deviceId: string, deviceSecret: string): void {
  res.append('Set-Cookie', buildSetCookieLine(DEVICE_COOKIE_ID, deviceId));
  res.append('Set-Cookie', buildSetCookieLine(DEVICE_COOKIE_SECRET, deviceSecret));
}
