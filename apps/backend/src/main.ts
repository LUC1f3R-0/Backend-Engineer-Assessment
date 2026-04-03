/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { loadEnv } from './config/load-env';
import { AppModule } from './app.module';
import { getAppConfig } from './config/app.config';
import { getCorsOptions, getCorsOrigins } from './config/cors.config';
import { getSwaggerUiUrl, setupSwagger } from './config/swagger.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

loadEnv();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cfg = getAppConfig();

  app.enableCors(getCorsOptions());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  if (cfg.swaggerEnabled) {
    setupSwagger(app);
  }

  const port = cfg.port;
  const listenHost = cfg.isCloudRun || cfg.nodeEnv === 'production' ? '0.0.0.0' : 'localhost';
  await app.listen(port, listenHost);

  Logger.log(`CORS allowed origins: ${getCorsOrigins().join(', ')}`);
  Logger.log(
    `Application is running on ${cfg.nodeEnv}: http://localhost:${port}/${globalPrefix}`,
  );

  if (cfg.swaggerEnabled) {
    Logger.log(`Swagger UI: ${getSwaggerUiUrl(port, globalPrefix)}`);
  }
}

bootstrap();
