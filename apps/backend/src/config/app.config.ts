import { loadEnv } from './load-env';

loadEnv();

function parseOriginsFromEnv(): string[] {
  const raw = process.env.CORS_ORIGINS?.trim();
  if (!raw) {
    return [];
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const DEFAULT_CORS_ORIGINS = ['http://localhost:4200'];

/**
 * Central place for environment-derived settings (no Nest ConfigModule dependency).
 */
function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw?.trim()) {
    return fallback;
  }
  const n = parseInt(raw.trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * Service account private key from env (often uses literal `\n` in .env).
 * Empty string if unset.
 */
function firebasePrivateKeyFromEnv(): string {
  const raw = process.env.FIREBASE_PRIVATE_KEY?.trim() ?? '';
  if (!raw) {
    return '';
  }
  return raw.replace(/\\n/g, '\n');
}

export function getAppConfig() {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  return {
    nodeEnv,
    port: Number(process.env.PORT) || 8080,
    /** Expected value for `x-api-key` header. Empty means all requests are rejected. */
    xApiKey: process.env.X_API_KEY ?? '',
    swaggerEnabled: process.env.SWAGGER_ENABLED === 'true',
    corsOrigins: [...new Set([...DEFAULT_CORS_ORIGINS, ...parseOriginsFromEnv()])],
    isCloudRun: Boolean(process.env.K_SERVICE),
    /** Max-Age for HttpOnly device cookies (seconds). Default ~400 days. */
    deviceCookieMaxAgeSec: parsePositiveInt(process.env.DEVICE_COOKIE_MAX_AGE_SEC, 34560000),
    /** Set Secure flag on device cookies (required on HTTPS; auto-on in production). */
    deviceCookieSecure:
      nodeEnv === 'production' || process.env.DEVICE_COOKIE_SECURE === 'true',
    /** Optional e.g. `.example.com` when frontend and API share a parent domain. */
    deviceCookieDomain: process.env.DEVICE_COOKIE_DOMAIN?.trim() || undefined,
    /** Firebase Admin (FCM server send). All three required to send push notifications. */
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID?.trim() ?? '',
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL?.trim() ?? '',
    firebasePrivateKey: firebasePrivateKeyFromEnv(),
  };
}
