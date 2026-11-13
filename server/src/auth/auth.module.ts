import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { createRemoteJWKSet } from 'jose';
import { AppConfig } from '../core/config/app-config.js';
import { SupabaseJwksAuthVerifier } from './adapters/supabase-jwks-auth-verifier.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { AUTH_VERIFIER } from './ports/auth-verifier.js';

@Module({
  providers: [
    {
      provide: AUTH_VERIFIER,
      inject: [AppConfig],
      useFactory: (config: AppConfig) =>
        new SupabaseJwksAuthVerifier({
          issuer: config.jwtIssuer,
          getKey: createRemoteJWKSet(new URL(config.jwksUrl)),
        }),
    },
    // Global: toda rota exige JWT, salvo @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [AUTH_VERIFIER],
})
export class AuthModule {}
