import { type CanActivate, type ExecutionContext, Inject, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ApiException } from '../core/http/api-exception.js';
import { type AuthedRequest, IS_PUBLIC } from './decorators.js';
import { AUTH_VERIFIER, type AuthVerifier, InvalidTokenError } from './ports/auth-verifier.js';

/**
 * Guard global. Rota sem @Public() exige `Authorization: Bearer <access token do Supabase>`
 * e ganha `req.userId`. Qualquer recusa vira UNAUTHENTICATED (401) no envelope.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger('JwtAuthGuard');

  constructor(
    private readonly reflector: Reflector,
    @Inject(AUTH_VERIFIER) private readonly verifier: AuthVerifier,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest<Request & Partial<AuthedRequest>>();
    const token = bearerToken(req.headers.authorization);
    if (!token) throw new ApiException('UNAUTHENTICATED', 'Sessão ausente ou expirada.');

    try {
      req.userId = (await this.verifier.verify(token)).userId;
      return true;
    } catch (e) {
      if (e instanceof InvalidTokenError) {
        this.logger.debug(`${req.method} ${req.originalUrl} -> ${e.reason}`);
        throw new ApiException('UNAUTHENTICATED', 'Sessão ausente ou expirada.');
      }
      throw e;
    }
  }
}

function bearerToken(header: string | undefined): string | null {
  const match = /^Bearer\s+(\S+)$/i.exec(header ?? '');
  return match ? match[1] : null;
}
