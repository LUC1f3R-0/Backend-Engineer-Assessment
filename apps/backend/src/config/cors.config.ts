import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const DEFAULT_ORIGINS = ['http://localhost:4200'];

function parseOriginsFromEnv(): string[] {
  const raw = process.env.CORS_ORIGINS?.trim();
  if (!raw) return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

export function getCorsOrigins(): string[] {
  return [...new Set([...DEFAULT_ORIGINS, ...parseOriginsFromEnv()])];
}

export function getCorsOptions(): CorsOptions {
  return {
    origin: getCorsOrigins(),
    credentials: true,
  };
}
