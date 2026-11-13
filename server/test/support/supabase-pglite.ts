import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';

/** supabase/migrations/ na raiz do repo. */
export const MIGRATIONS_DIR = join(import.meta.dirname, '..', '..', '..', 'supabase', 'migrations');

/**
 * Postgres em memoria (PGlite, WASM) com o minimo do ambiente Supabase que as migracoes
 * usam: papeis anon/authenticated/service_role, schema auth com auth.users e auth.uid(),
 * e os privilegios padrao que o Supabase concede em tabela nova.
 *
 * Nao precisa de Docker nem de Postgres instalado. E a base dos testes de migracao (os
 * 35 casos da 0004 entram aqui no H4 — SAAS_PLAN §10.3) e dos testes de repositorio
 * (filtro por userId, H5).
 */
export async function createSupabasePglite(): Promise<PGlite> {
  const db = await PGlite.create({ extensions: { pgcrypto } });
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    create table auth.users (id uuid primary key, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
    alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
  `);
  return db;
}

/** Arquivos `NNNN_*.sql` de supabase/migrations/, em ordem. */
export function migrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => /^\d{4}_.+\.sql$/.test(f))
    .sort();
}

export async function applyMigrations(db: PGlite): Promise<string[]> {
  const files = migrationFiles();
  for (const f of files) await db.exec(readFileSync(join(MIGRATIONS_DIR, f), 'utf8'));
  return files;
}

/**
 * Roda `sql` como um usuario logado (role authenticated + auth.uid() = userId), igual a
 * um request do PostgREST. Sempre em transacao propria, desfeita se der erro.
 */
export async function asUser<T>(
  db: PGlite,
  userId: string | null,
  sql: string,
  params: unknown[] = [],
  role: 'authenticated' | 'anon' = 'authenticated',
): Promise<T[]> {
  return db.transaction(async (tx) => {
    await tx.exec(`set local role ${role}`);
    await tx.query(`select set_config('request.jwt.claim.sub', $1, true)`, [userId ?? '']);
    return (await tx.query<T>(sql, params)).rows;
  });
}
