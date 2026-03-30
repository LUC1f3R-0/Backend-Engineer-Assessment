import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const SWAGGER_PATH = 'docs';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('mo.lk Assessment API')
    .setDescription('REST API')
    .setVersion('1.0')
    .addApiKey(
      { type: 'apiKey', name: 'x-api-key', in: 'header' },
      'x-api-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_PATH, app, document, { useGlobalPrefix: true });
}

export function getSwaggerUiUrl(port: number, apiGlobalPrefix: string): string {
  return `http://localhost:${port}/${apiGlobalPrefix}/${SWAGGER_PATH}`;
}
