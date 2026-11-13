import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import request from 'supertest';
import type { Database } from '../src/db/database.js';
import { createTestApp } from './support/test-app.js';

describe('GET /health', () => {
  it('e publico e mostra o banco no ar (Kysely sobre PGlite)', async () => {
    const { app, http } = await createTestApp();
    const res = await request(http).get('/health').expect(200);
    expect(res.body).toEqual({ ok: true, data: { status: 'ok', db: 'up' } });
    await app.close();
  });

  it('banco fora do ar: continua 200, com db: down', async () => {
    // Adapter de producao (pg) apontando para uma porta onde nao ha nada.
    const db = new Kysely<Database>({
      dialect: new PostgresDialect({
        pool: new pg.Pool({ connectionString: 'postgresql://x@127.0.0.1:1/x', connectionTimeoutMillis: 1_000 }),
      }),
    });
    const { app, http } = await createTestApp({ db });
    const res = await request(http).get('/health').expect(200);
    expect(res.body).toEqual({ ok: true, data: { status: 'degraded', db: 'down' } });
    await app.close();
  });
});
