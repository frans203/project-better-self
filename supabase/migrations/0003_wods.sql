-- ============================================================================
-- 0003 — WODs (CrossFit)
--
-- Pronto para rodar. Cole o arquivo inteiro no SQL Editor e Run.
-- Idempotente: rodar duas vezes nao quebra nada.
--
-- Pre-requisitos: 0001_init.sql e 0002_enable_auth.sql ja rodados.
--
-- COMPATIBILIDADE COM DADO ANTIGO
--   `workouts.kind` entra NOT NULL DEFAULT 'gym', entao toda linha que ja
--   existe vira 'gym' sozinha no ALTER — nao existe workout sem kind. Nenhuma
--   query antiga precisa mudar para continuar funcionando, e o trigger
--   refresh_training_day segue contando os dois tipos (WOD tambem marca o
--   habito 'training' do dia).
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. workouts.kind — separa treino de academia de WOD
-- ---------------------------------------------------------------------------
alter table public.workouts
  add column if not exists kind text not null default 'gym';

-- `add constraint if not exists` nao existe no Postgres; o bloco captura o
-- duplicate_object para a migracao continuar idempotente.
do $$
begin
  alter table public.workouts
    add constraint workouts_kind_check check (kind in ('gym','wod'));
exception
  when duplicate_object then null;
end $$;

create index if not exists workouts_user_kind_date_idx
  on public.workouts (user_id, kind, workout_date desc);

-- ---------------------------------------------------------------------------
-- 2. wods — catalogo reutilizavel
--
-- Mesma ideia de `exercises`: a linha nasce quando voce registra pela primeira
-- vez, e dali em diante aparece na lista de sugestoes. Os benchmarks (Cindy,
-- Fran, ...) vivem em src/shared/constants/wods.ts e sao inseridos sob demanda
-- — seed global nao daria certo porque user_id vem de auth.uid().
--
-- `movements` e jsonb no formato [{ "name": "Barra fixa", "reps": 5 }, ...].
-- ---------------------------------------------------------------------------
create table if not exists public.wods (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid(),
  name           text not null check (length(trim(name)) > 0),
  scoring        text not null default 'amrap'
                 check (scoring in ('amrap','for_time','emom','rounds','other')),
  -- AMRAP/EMOM: janela do treino. FOR TIME: teto opcional.
  time_cap_min   integer check (time_cap_min is null or time_cap_min > 0),
  -- Soma das reps de um round completo. Cindy = 5 + 10 + 15 = 30.
  reps_per_round smallint check (reps_per_round is null or reps_per_round > 0),
  movements      jsonb not null default '[]'::jsonb,
  description    text,
  is_benchmark   boolean not null default false,
  created_at     timestamptz not null default now()
);

-- Case-insensitive, igual exercises: "cindy" e "Cindy" sao o mesmo WOD.
create unique index if not exists wods_user_name_uniq
  on public.wods (user_id, lower(name));

-- ---------------------------------------------------------------------------
-- 3. wod_results — um resultado por workout de kind='wod'
--
-- `reps_per_round` e copiado do WOD no momento do registro, de proposito: se
-- voce editar a definicao do WOD depois, o score historico nao se mexe. Sem
-- essa copia, `total_reps` mudaria retroativamente e o grafico de progressao
-- passaria a mentir.
--
-- `total_reps` e coluna GERADA pelo mesmo motivo do e1rm em workout_sets: o
-- banco e a fonte da verdade, entao comparacao entre sessoes e o que a UI
-- mostra nunca divergem. Os coalesce garantem que FOR TIME (sem rounds) caia
-- em 0 em vez de NULL.
-- ---------------------------------------------------------------------------
create table if not exists public.wod_results (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid(),
  workout_id     uuid not null references public.workouts(id) on delete cascade,
  wod_id         uuid not null references public.wods(id) on delete restrict,
  -- AMRAP: rounds completos + reps do round parcial.
  rounds         smallint check (rounds is null or rounds >= 0),
  extra_reps     smallint check (extra_reps is null or extra_reps >= 0),
  -- FOR TIME: tempo total.
  duration_sec   integer check (duration_sec is null or duration_sec > 0),
  reps_per_round smallint check (reps_per_round is null or reps_per_round > 0),
  scaled         boolean not null default false,
  note           text,
  total_reps     integer generated always as (
                   coalesce(rounds, 0) * coalesce(reps_per_round, 0)
                   + coalesce(extra_reps, 0)
                 ) stored,
  created_at     timestamptz not null default now(),
  -- 1:1 com o workout. Sem isso, um bug de retry criaria dois resultados para
  -- a mesma sessao e o total do dia dobraria.
  unique (workout_id)
);

create index if not exists wod_results_user_wod_idx
  on public.wod_results (user_id, wod_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 4. RLS — mesmo padrao do 0002
-- ---------------------------------------------------------------------------
alter table public.wods        enable row level security;
alter table public.wod_results enable row level security;

do $$
declare t text;
begin
  foreach t in array array['wods','wod_results'] loop
    execute format('drop policy if exists owner_all on public.%I', t);
    execute format(
      'create policy owner_all on public.%I for all to authenticated
         using (auth.uid() = user_id) with check (auth.uid() = user_id)', t
    );
  end loop;
end $$;

commit;

-- ---------------------------------------------------------------------------
-- Verificacao — rodar depois, separado.
--
--   select kind, count(*) from public.workouts group by kind;
--     -> toda linha antiga em 'gym', nenhuma com kind nulo
--
--   select tablename, policyname, roles from pg_policies
--    where schemaname = 'public' and tablename in ('wods','wod_results');
--     -> 2 linhas, ambas `owner_all` e {authenticated}
-- ---------------------------------------------------------------------------
