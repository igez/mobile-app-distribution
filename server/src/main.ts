import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { setupFixtures } from './fixtures';
import { AppModule } from './modules/app/app.module';
import * as fs from 'fs';
import { join } from 'path';

/**
 * The url endpoint for open api ui
 * @type {string}
 */
export const SWAGGER_API_ROOT = 'api/docs';
/**
 * The url endpoint for open api ui
 * @type {string}
 */
export const SWAGGER_API_VERSION = '0.1.0';
/**
 * The name of the api
 * @type {string}
 */
export const SWAGGER_API_NAME = 'API';
/**
 * A short description of the api
 * @type {string}
 */
export const SWAGGER_API_DESCRIPTION = 'API Description';
/**
 * Current version of the api
 * @type {string}
 */
export const SWAGGER_API_CURRENT_VERSION = '1.0';
/**
 * The default authentication method
 * @type {string}
 */
export const SWAGGER_API_AUTH_NAME = 'Authorization';
/**
 * Where the SWAGGER_API_AUTH_NAME will be used in the request
 * @type {string}
 */
export const SWAGGER_API_AUTH_LOCATION = 'header';
/**
 * Types of api schemes
 * @type {string[]}
 */

(async () => {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  app.enableCors();
  // app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.useStaticAssets(join(__dirname, '../..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'client'));
  app.setViewEngine('hbs');

  const documentBuilder = new DocumentBuilder()
    .setTitle(SWAGGER_API_NAME)
    .setDescription(SWAGGER_API_DESCRIPTION)
    .setVersion(SWAGGER_API_CURRENT_VERSION)
    .addBearerAuth()
    .setVersion(SWAGGER_API_VERSION)
    .build();

  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup(SWAGGER_API_ROOT, app, document);

  const configService = app.get(ConfigService);
  const port = configService.get('APP_PORT');

  await setupFixtures();

  await app.listen(port, '0.0.0.0');

  console.log(`🚀  Server ready at ${port} [${configService.get('APP_ENV')}]`);
})();
