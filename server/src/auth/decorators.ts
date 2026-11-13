import { createParamDecorator, type ExecutionContext, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = Symbol('isPublic');

/**
 * Libera a rota do JWT. Toda rota e protegida por padrao (guard global); esquecer este
 * decorator falha FECHADO. Usos previstos: GET /health, GET /billing/plans,
 * POST /webhooks/:provider (que se autentica por HMAC, nao por JWT).
 */
export const Public = () => SetMetadata(IS_PUBLIC, true);

/** Request depois do guard: `userId` sempre presente em rota nao publica. */
export type AuthedRequest = { userId: string };

/**
 * `userId` de quem chamou, vindo do token validado pelo guard. Unica fonte de userId
 * da API — nunca do body, query ou params (SAAS_PLAN §5.3).
 *
 *   @Get('entitlements') get(@UserId() userId: string) { ... }
 */
export const UserId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<Partial<AuthedRequest>>();
  if (!req.userId) {
    // So acontece se @UserId for usado numa rota @Public. Erro de programacao, nao do cliente.
    throw new Error('@UserId() usado em rota sem autenticacao');
  }
  return req.userId;
});
