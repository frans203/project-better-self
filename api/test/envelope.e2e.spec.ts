import { Body, Controller, Get, type INestApplication, Post } from '@nestjs/common';
import request from 'supertest';
import { Public, UserId } from '../src/auth/decorators.js';
import { ApiException } from '../src/core/http/api-exception.js';
import { WithMeta } from '../src/core/http/response-envelope.interceptor.js';
import { USER_A } from './support/jwt.js';
import { createTestApp } from './support/test-app.js';

/** Rotas que so existem no teste, para exercitar envelope, filtro e guard. */
@Controller('t')
class ProbeController {
  @Public() @Get('ok') ok() {
    return { codename: 'operador' };
  }
  @Public() @Get('meta') meta() {
    return new WithMeta([1, 2], { page: 1, total: 2 });
  }
  @Public() @Get('void') nothing(): void {}
  @Public() @Get('not-found') notFound() {
    throw new ApiException('NOT_FOUND', 'Checkout não encontrado.');
  }
  @Public() @Get('locked') locked() {
    throw new ApiException('ENTITLEMENT_REQUIRED', 'Relatório completo é do Pro.', {
      required: 'feature:reports.full',
    });
  }
  @Public() @Get('provider-down') providerDown() {
    throw new ApiException('PAYMENT_PROVIDER_UNAVAILABLE', 'Pagamento indisponível no momento.');
  }
  @Public() @Get('boom') boom() {
    throw new Error('senha do banco: hunter2');
  }
  @Public() @Post('echo') echo(@Body() body: unknown) {
    return body;
  }
  @Get('me') me(@UserId() userId: string) {
    return { userId };
  }
}

describe('envelope e erros (SAAS_PLAN §5.4)', () => {
  let app: INestApplication;
  let http: ReturnType<INestApplication['getHttpServer']>;
  let sign: () => Promise<string>;

  beforeAll(async () => {
    const t = await createTestApp({ controllers: [ProbeController] });
    app = t.app;
    http = t.http;
    sign = () => t.issuer.sign();
  });
  afterAll(() => app.close());

  it('sucesso vira { ok: true, data }', async () => {
    const res = await request(http).get('/t/ok').expect(200);
    expect(res.body).toEqual({ ok: true, data: { codename: 'operador' } });
  });

  it('WithMeta vira { ok: true, data, meta }', async () => {
    const res = await request(http).get('/t/meta').expect(200);
    expect(res.body).toEqual({ ok: true, data: [1, 2], meta: { page: 1, total: 2 } });
  });

  it('retorno vazio vira data: null', async () => {
    const res = await request(http).get('/t/void').expect(200);
    expect(res.body).toEqual({ ok: true, data: null });
  });

  it('ApiException sai com o codigo e o status do contrato', async () => {
    const res = await request(http).get('/t/not-found').expect(404);
    expect(res.body).toEqual({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'Checkout não encontrado.' },
    });
  });

  it('ENTITLEMENT_REQUIRED leva o direito que faltou (402)', async () => {
    const res = await request(http).get('/t/locked').expect(402);
    expect(res.body.error).toEqual({
      code: 'ENTITLEMENT_REQUIRED',
      message: 'Relatório completo é do Pro.',
      details: { required: 'feature:reports.full' },
    });
  });

  it('gateway fora do ar e 503', async () => {
    const res = await request(http).get('/t/provider-down').expect(503);
    expect(res.body.error.code).toBe('PAYMENT_PROVIDER_UNAVAILABLE');
  });

  it('erro nao tratado vira INTERNAL e nao vaza a mensagem', async () => {
    const res = await request(http).get('/t/boom').expect(500);
    expect(res.body).toEqual({
      ok: false,
      error: { code: 'INTERNAL', message: 'Falha interna. Tente novamente.' },
    });
    expect(JSON.stringify(res.body)).not.toContain('hunter2');
  });

  it('rota inexistente vira NOT_FOUND no envelope, sem a mensagem do Nest', async () => {
    const res = await request(http).get('/nao-existe').set('Authorization', `Bearer ${await sign()}`);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ ok: false, error: { code: 'NOT_FOUND', message: 'Rota não encontrada.' } });
  });

  it('JSON quebrado vira VALIDATION (422)', async () => {
    const res = await request(http)
      .post('/t/echo')
      .set('Content-Type', 'application/json')
      .send('{"planId": ');
    expect(res.status).toBe(422);
    expect(res.body.error).toEqual({
      code: 'VALIDATION',
      message: 'Requisição inválida.',
      details: { fields: {} },
    });
  });

  it('rota protegida recebe o userId do token', async () => {
    const res = await request(http).get('/t/me').set('Authorization', `Bearer ${await sign()}`).expect(200);
    expect(res.body).toEqual({ ok: true, data: { userId: USER_A } });
  });
});
