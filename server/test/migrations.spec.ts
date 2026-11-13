import type { PGlite } from '@electric-sql/pglite';
import { applyMigrations, asUser, createSupabasePglite } from './support/supabase-pglite.js';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';

/**
 * Smoke das migracoes reais (supabase/migrations/) num Postgres descartavel, com o
 * minimo do Supabase. Pega SQL que nao roda ANTES de alguem colar no SQL Editor do
 * banco compartilhado. Os casos da 0004 de billing entram aqui no H4 (SAAS_PLAN §10.3).
 */
describe('supabase/migrations em Postgres descartavel', () => {
  let db: PGlite;
  let files: string[];

  beforeAll(async () => {
    db = await createSupabasePglite();
    files = await applyMigrations(db);
    await db.query('insert into auth.users (id) values ($1), ($2)', [A, B]);
  });
  afterAll(() => db.close());

  it('aplica todas as migracoes em ordem', () => {
    expect(files[0]).toBe('0001_init.sql');
    expect(files.length).toBeGreaterThanOrEqual(3);
  });

  it('cadastro cria o profile (handle_new_user)', async () => {
    const { rows } = await db.query<{ n: number }>(
      'select count(*)::int as n from public.profiles where id in ($1, $2)',
      [A, B],
    );
    expect(rows[0].n).toBe(2);
  });

  it('RLS owner_all: cada usuario so ve as proprias linhas', async () => {
    await asUser(db, A, `insert into public.habit_logs (habit_key, log_date) values ('reading', '2026-11-11')`);
    expect(await asUser(db, A, 'select id from public.habit_logs')).toHaveLength(1);
    expect(await asUser(db, B, 'select id from public.habit_logs')).toHaveLength(0);
  });

  it('RLS owner_all: ninguem grava linha em nome de outro', async () => {
    await expect(
      asUser(db, B, `insert into public.habit_logs (user_id, habit_key, log_date) values ($1, 'reading', '2026-11-11')`, [A]),
    ).rejects.toMatchObject({ code: '42501' });
  });

  it('anon nao le nada', async () => {
    expect(await asUser(db, null, 'select id from public.habit_logs', [], 'anon')).toHaveLength(0);
  });

  it('trigger de corrida marca o habito do dia', async () => {
    await asUser(db, A, `insert into public.runs (run_date, distance_km) values ('2026-11-10', 5)`);
    const rows = await asUser<{ habit_key: string; value: string }>(
      db,
      A,
      `select habit_key, value from public.habit_logs where log_date = '2026-11-10'`,
    );
    expect(rows).toEqual([expect.objectContaining({ habit_key: 'running' })]);
  });
});
