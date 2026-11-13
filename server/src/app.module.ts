import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule } from './core/config/config.module.js';
import { ApiExceptionFilter } from './core/http/api-exception.filter.js';
import { ResponseEnvelopeInterceptor } from './core/http/response-envelope.interceptor.js';
import { DatabaseModule } from './db/database.module.js';
import { HealthModule } from './modules/health/health.module.js';

/**
 * Filtro, interceptor e guard sao registrados aqui (APP_*), e nao no main.ts: assim os
 * testes que montam o AppModule recebem exatamente o mesmo comportamento da producao.
 */
@Module({
  imports: [ConfigModule, DatabaseModule, AuthModule, HealthModule],
  providers: [
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseEnvelopeInterceptor },
  ],
})
export class AppModule {}
