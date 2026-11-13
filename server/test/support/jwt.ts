import {
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  type JWTPayload,
  type JWTVerifyGetKey,
  SignJWT,
} from 'jose';

export const TEST_SUPABASE_URL = 'https://projeto-teste.supabase.co';
export const TEST_ISSUER = `${TEST_SUPABASE_URL}/auth/v1`;
export const USER_A = '11111111-1111-4111-8111-111111111111';

/**
 * Faz o papel do Supabase Auth nos testes: gera um par ES256, publica a chave publica
 * num JWKS local e assina tokens com o mesmo formato dos access tokens do Supabase.
 */
export async function createTestIssuer() {
  const { privateKey, publicKey } = await generateKeyPair('ES256');
  const jwk = { ...(await exportJWK(publicKey)), kid: 'test-key', alg: 'ES256', use: 'sig' };
  const getKey: JWTVerifyGetKey = createLocalJWKSet({ keys: [jwk] });

  /** Access token valido; `overrides` troca qualquer claim (ou o remove com undefined). */
  async function sign(
    overrides: Partial<JWTPayload> & Record<string, unknown> = {},
    opts: { expiresIn?: string | number; key?: CryptoKey } = {},
  ): Promise<string> {
    const claims: Record<string, unknown> = {
      sub: USER_A,
      role: 'authenticated',
      aud: 'authenticated',
      iss: TEST_ISSUER,
      ...overrides,
    };
    return new SignJWT(claims as JWTPayload)
      .setProtectedHeader({ alg: 'ES256', kid: 'test-key' })
      .setIssuedAt()
      .setExpirationTime(opts.expiresIn ?? '1h')
      .sign(opts.key ?? privateKey);
  }

  return { getKey, sign };
}
