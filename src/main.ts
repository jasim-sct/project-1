import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  VersioningType,
  Logger,
  RequestMethod,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { createSecurityLayer } from './security/security.layer';
import { createReliabilityLayer } from './security/reliability.layer';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(AppModule, {
      bufferLogs: true,
    });

  app.enableShutdownHooks();

  /* Security Layer */
  app.use(createSecurityLayer());

  /* Health Endpoint (no prefix) */
  app.getHttpAdapter().getInstance().get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now(),
    });
  });

  /* API Configuration */
  app.setGlobalPrefix('api', {
    exclude: [
      { path: '/', method: RequestMethod.ALL },
      { path: 'health', method: RequestMethod.ALL },
      { path: 'client/(.*)', method: RequestMethod.ALL }, // client website (no /api)
    ],
  });

  app.enableVersioning({
    type: VersioningType.URI,
  });

  /* Global Validation */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: true,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  /* Structured Logging */
  app.use((req: any, res: any, next: any) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.log(
        `[${req.requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`,
      );
    });

    next();
  });

  /* Reliability Layer (LAST) */
  app.use(createReliabilityLayer());

  const port = process.env.PORT || 3000;

  const server = await app.listen(port);

  logger.log(`Server running on port ${port}`);

  const shutdown = async (signal: string) => {
    logger.warn(`${signal} received. Shutting down...`);
    await app.close();
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap();

/* Process-Level Fail Fast */

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception', err?.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  console.error('Unhandled Rejection', reason?.stack || reason);
  process.exit(1);
});
