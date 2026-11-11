import { errors, jwtVerify, type JWTVerifyGetKey } from 'jose';
import {
  type AuthenticatedUser,
  type AuthVerifier,
  InvalidTokenError,
} from '../ports/auth-verifier.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type SupabaseJwksOptions = {
  /** `${SUPABASE_URL}/auth/v1` */
  issuer: string;
  /**
   * Fonte das chaves publicas. Em producao `createRemoteJWKSet(jwksUrl)` (o jose faz
   * cache e recarrega quando aparece `kid` novo — rotacao de chave nao exige deploy).
   * Nos testes, `createLocalJWKSet` com uma chave gerada na hora.
   */
  getKey: JWTVerifyGetKey;
};

/**
 * Valida o access token do Supabase Auth pela chave PUBLICA (JWKS). A API nunca guarda
 * o segredo de assinatura.
 *
 * Exige: assinatura assimetrica valida, `iss` do projeto, `aud = authenticated`, nao
 * expirado, `role = authenticated` e `sub` em formato uuid. O `role` fecha a porta para
 * qualquer outro tipo de token assinado pelo mesmo projeto.
 */
export class SupabaseJwksAuthVerifier implements AuthVerifier {
  constructor(private readonly options: SupabaseJwksOptions) {}

  async verify(token: string): Promise<AuthenticatedUser> {
    let payload;
    try {
      ({ payload } = await jwtVerify(token, this.options.getKey, {
        issuer: this.options.issuer,
        audience: 'authenticated',
        algorithms: ['ES256', 'RS256'],
      }));
    } catch (e) {
      if (e instanceof errors.JOSEError) throw new InvalidTokenError(e.code);
      // Falha de rede ao buscar o JWKS etc. Nao e culpa do token: sobe como erro interno.
      throw e;
    }

    if (payload.role !== 'authenticated') throw new InvalidTokenError(`role=${String(payload.role)}`);
    if (typeof payload.sub !== 'string' || !UUID.test(payload.sub)) {
      throw new InvalidTokenError('sub ausente ou fora do formato uuid');
    }
    return { userId: payload.sub };
  }
}
