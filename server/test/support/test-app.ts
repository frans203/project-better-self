import type { INestApplication, Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Kysely } from 'kysely';
import { PGliteDialect } from 'kysely-pglite-dialect';
import type { PGlite } from '@electric-sql/pglite';
import { AppModule } from '../../src/app.module.js';
import { AUTH_VERIFIER, type AuthVerifier } from '../../src/auth/ports/auth-verifier.js';
import { SupabaseJwksAuthVerifier } from '../../src/auth/adapters/supabase-jwks-auth-verifier.js';
import type { Database, Db } from '../../src/db/database.js';
import { KYSELY } from '../../src/db/database.js';
import { createSupabasePglite } from './supabase-pglite.js';
import { createTestIssuer, TEST_ISSUER, TEST_SUPABASE_URL } from './jwt.js';

/** Env minimo valido. Cada teste pode sobrescrever. */
export function setTestEnv(overrides: Record<string, string> = {}): void {
  Object.assign(process.env, {
    NODE_ENV: 'test',
    APP_URL: 'http://localhost:5173',
    SUPABASE_URL: TEST_SUPABASE_URL,
    DATABASE_URL: 'postgresql://ninguem@127.0.0.1:1/nada',
    ...overrides,
  });
}

export function kyselyOn(pglite: PGlite): Db {
  return new Kysely<Database>({ dialect: new PGliteDialect(pglite) });
}

type Options = {
  /** Controllers extras so do teste (rotas que lancam erro, rota protegida...). */
  controllers?: Type[];
  /** Kysely a usar. Padrao: PGlite em memoria (banco "no ar"). */
  db?: Db;
  verifier?: AuthVerifier;
};

/**
 * Sobe o AppModule de verdade — mesmo filtro, interceptor e guard da producao — trocando
 * so as bordas: banco vira PGlite e o JWKS remoto vira um JWKS local.
 */
export async function createTestApp(opts: Options = {}) {
  setTestEnv();
  const issuer = await createTestIssuer();
  const pglite = opts.db ? null : await createSupabasePglite();
  const db = opts.db ?? kyselyOn(pglite!);
  const verifier =
    opts.verifier ?? new SupabaseJwksAuthVerifier({ issuer: TEST_ISSUER, getKey: issuer.getKey });

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
    controllers: opts.controllers ?? [],
  })
    .overrideProvider(KYSELY)
    .useValue(db)
    .overrideProvider(AUTH_VERIFIER)
    .useValue(verifier)
    .compile();

  const app: INestApplication = moduleRef.createNestApplication({ rawBody: true });
  await app.init();
  return { app, issuer, http: app.getHttpServer() };
}
