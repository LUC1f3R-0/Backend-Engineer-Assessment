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
export function getAppConfig() {
  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT) || 8080,
    /** Expected value for `x-api-key` header. Empty means all requests are rejected. */
    xApiKey: process.env.X_API_KEY ?? '',
    swaggerEnabled: process.env.SWAGGER_ENABLED === 'true',
    corsOrigins: [...new Set([...DEFAULT_CORS_ORIGINS, ...parseOriginsFromEnv()])],
    isCloudRun: Boolean(process.env.K_SERVICE),
  };
}
