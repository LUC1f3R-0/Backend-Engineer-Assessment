/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { getCorsOptions, getCorsOrigins } from './config/cors.config';
import { getSwaggerUiUrl, setupSwagger } from './config/swagger.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(getCorsOptions());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  setupSwagger(app);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  Logger.log(`CORS allowed origins: ${getCorsOrigins().join(', ')}`);
  Logger.log(
    `🚀 Application is running on ${process.env.NODE_ENV}: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(`📚 Swagger UI: ${getSwaggerUiUrl(port, globalPrefix)}`);
}

bootstrap();
