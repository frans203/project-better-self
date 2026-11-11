/** Quem fez o request, segundo o provedor de auth. */
export type AuthenticatedUser = {
  /** `auth.users.id` — o mesmo `user_id` das tabelas. */
  userId: string;
};

/**
 * Port de autenticacao (SAAS_PLAN §5.1). Hoje: Supabase Auth via JWKS. Trocar de
 * provedor = outro adapter e outro `provide` no AuthModule; guard e controllers nao mudam.
 */
export interface AuthVerifier {
  /** Valida o token e devolve o usuario. Lanca InvalidTokenError se nao servir. */
  verify(token: string): Promise<AuthenticatedUser>;
}

export const AUTH_VERIFIER = Symbol('AuthVerifier');

/**
 * Token recusado. `reason` vai so para o log: para o cliente, qualquer recusa e o mesmo
 * UNAUTHENTICATED (dizer "expirou" vs "assinatura invalida" ajuda quem esta forjando).
 */
export class InvalidTokenError extends Error {
  constructor(readonly reason: string) {
    super(`token recusado: ${reason}`);
    this.name = 'InvalidTokenError';
  }
}
