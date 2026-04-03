import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { getAppConfig } from './app.config';

export function getCorsOrigins(): string[] {
  return getAppConfig().corsOrigins;
}

export function getCorsOptions(): CorsOptions {
  return {
    origin: getCorsOrigins(),
    credentials: true,
  };
}
