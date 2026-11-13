import { Controller, Get, type INestApplication } from '@nestjs/common';
import { generateKeyPair, SignJWT } from 'jose';
import request from 'supertest';
import { UserId } from '../src/auth/decorators.js';
import { TEST_ISSUER, USER_A } from './support/jwt.js';
import { createTestApp } from './support/test-app.js';

@Controller('t')
class MeController {
  @Get('me') me(@UserId() userId: string) {
    return { userId };
  }
}

const UNAUTHENTICATED = {
  ok: false,
  error: { code: 'UNAUTHENTICATED', message: 'Sessão ausente ou expirada.' },
};

describe('guard JWT do Supabase (JWKS)', () => {
  let app: INestApplication;
  let http: ReturnType<INestApplication['getHttpServer']>;
  let issuer: Awaited<ReturnType<typeof createTestApp>>['issuer'];

  beforeAll(async () => {
    const t = await createTestApp({ controllers: [MeController] });
    ({ app, http, issuer } = t);
  });
  afterAll(() => app.close());

  const call = (token?: string) => {
    const r = request(http).get('/t/me');
    return token === undefined ? r : r.set('Authorization', `Bearer ${token}`);
  };

  it('token valido passa e entrega o sub como userId', async () => {
    const res = await call(await issuer.sign()).expect(200);
    expect(res.body.data).toEqual({ userId: USER_A });
  });

  it('rota e protegida por padrao: sem header -> 401', async () => {
    const res = await call().expect(401);
    expect(res.body).toEqual(UNAUTHENTICATED);
  });

  it('header sem o prefixo Bearer -> 401', async () => {
    const token = await issuer.sign();
    await request(http).get('/t/me').set('Authorization', token).expect(401);
  });

  it('lixo no lugar do token -> 401', async () => {
    const res = await call('nao.e.jwt').expect(401);
    expect(res.body).toEqual(UNAUTHENTICATED);
  });

  const recusados: [string, () => Promise<string>][] = [
    ['expirado', () => issuer.sign({}, { expiresIn: Math.floor(Date.now() / 1000) - 60 })],
    ['emissor de outro projeto', () => issuer.sign({ iss: 'https://outro.supabase.co/auth/v1' })],
    ['audience errada', () => issuer.sign({ aud: 'anon' })],
    ['role service_role', () => issuer.sign({ role: 'service_role' })],
    ['role anon', () => issuer.sign({ role: 'anon' })],
    ['sem sub', () => issuer.sign({ sub: undefined })],
    ['sub fora do formato uuid', () => issuer.sign({ sub: 'admin' })],
    [
      'assinado por outra chave',
      async () => issuer.sign({}, { key: (await generateKeyPair('ES256')).privateKey }),
    ],
    [
      'HS256 com segredo (algoritmo simetrico nao aceito)',
      () =>
        new SignJWT({ sub: USER_A, role: 'authenticated', aud: 'authenticated', iss: TEST_ISSUER })
          .setProtectedHeader({ alg: 'HS256', kid: 'test-key' })
          .setExpirationTime('1h')
          .sign(new TextEncoder().encode('segredo-legado-do-supabase-com-32-bytes!!')),
    ],
  ];

  it.each(recusados)('recusa token %s -> 401 sem dizer o motivo', async (_nome, make) => {
    const res = await call(await make()).expect(401);
    expect(res.body).toEqual(UNAUTHENTICATED);
  });
});
