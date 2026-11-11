import { existsSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { AppConfig } from './core/config/app-config.js';

// Em dev le api/.env. Em producao as variaveis vem da hospedagem e o arquivo nao existe.
if (existsSync('.env')) process.loadEnvFile('.env');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Corpo cru preservado em req.rawBody: o webhook valida o HMAC sobre os bytes
    // exatos que o gateway assinou (SAAS_PLAN §6.4).
    rawBody: true,
  });
  const config = app.get(AppConfig);

  app.disable('x-powered-by');
  app.enableCors({
    origin: config.corsOrigins,
    allowedHeaders: ['Authorization', 'Content-Type'],
  });
  app.enableShutdownHooks();

  await app.listen(config.port);
}

await bootstrap();
