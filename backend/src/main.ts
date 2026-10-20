import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/api.filter';
import { MoneyInterceptor } from './common/money.interceptor';
import { validationException } from './common/validation';

async function bootstrap() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL es obligatoria.');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  // CORS pertenece exclusivamente a Nginx.
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true, exceptionFactory: validationException,
  }));
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalInterceptors(new MoneyInterceptor());
  const logger = new Logger('HTTP');
  app.use((request: Request, response: Response, next: NextFunction) => {
    const requestId = request.header('X-Request-ID') ?? randomUUID();
    response.setHeader('X-Request-ID', requestId);
    const started = Date.now();
    response.on('finish', () => logger.log(JSON.stringify({
      requestId, method: request.method, path: request.path,
      status: response.statusCode, durationMs: Date.now() - started,
    })));
    next();
  });
  const config = new DocumentBuilder().setTitle('StockFlow API')
    .setDescription('Inventario y ventas. Importes como cadenas decimales (BOB). Demostración local sin autenticación.')
    .setVersion('1.0.0').build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config), {
    jsonDocumentUrl: 'api/docs-json',
    swaggerOptions: { persistAuthorization: false, displayRequestDuration: true },
  });
  await app.listen(3000, '0.0.0.0');
}
bootstrap().catch((error: unknown) => { Logger.error(error); process.exitCode = 1; });
