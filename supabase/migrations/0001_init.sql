-- ============================================================================
-- OPERATION: BETTER SELF — schema inicial
--
-- Modo operador unico (sem auth). Toda tabela ja tem user_id com DEFAULT no
-- UUID do operador local, e RLS fica ATIVA com policy permissiva. Ligar auth
-- depois = rodar 0002_enable_auth.sql. Nenhuma migracao de dados necessaria.
-- Ver PLAN.md secao 10.1
-- ============================================================================

create extension if not exists "pgcrypto";

-- O "operador local". Mesma constante em src/shared/constants/user.ts
create or replace function public.local_user_id() returns uuid
language sql immutable as $$
  select '00000000-0000-0000-0000-000000000001'::uuid
$$;

-- ---------------------------------------------------------------------------
-- updated_at automatico
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key default public.local_user_id(),
  display_name text,
  avatar_url   text,
  -- Dia zero da operacao. Alimenta o contador "DIAS EM OPERACAO" da home.
  start_date   date not null default current_date,
  -- Preferencias de UI que valem sincronizar entre dispositivos.
  settings     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- habit_logs — um registro por habito por dia
--
-- `value` guarda o numero do dia conforme o habito:
--   meditation -> minutos | reading -> paginas
--   running    -> km      | training -> minutos
--   no_pmo     -> null (so booleano)
--
-- Para no_pmo, done = false e RECAIDA REGISTRADA, nao "esqueci de marcar".
-- Dia sem linha nenhuma = sem registro, e isso nunca conta como falha.
-- ---------------------------------------------------------------------------
create table if not exists public.habit_logs (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default public.local_user_id(),
  habit_key        text not null
                   check (habit_key in ('no_pmo','meditation','reading','running','training')),
  log_date         date not null,
  done             boolean not null default true,
  value            numeric(8,2) check (value is null or value >= 0),
  note             text,
  -- So faz sentido quando habit_key = 'no_pmo' e done = false.
  relapse_trigger  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, habit_key, log_date)
);

create index if not exists habit_logs_user_date_idx
  on public.habit_logs (user_id, log_date desc);
create index if not exists habit_logs_user_habit_date_idx
  on public.habit_logs (user_id, habit_key, log_date desc);

create trigger habit_logs_touch before update on public.habit_logs
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- runs
-- ---------------------------------------------------------------------------
create table if not exists public.runs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default public.local_user_id(),
  run_date     date not null,
  distance_km  numeric(6,2) not null check (distance_km > 0),
  duration_min integer check (duration_min is null or duration_min > 0),
  route        text,
  feeling      smallint check (feeling is null or feeling between 1 and 5),
  note         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists runs_user_date_idx on public.runs (user_id, run_date desc);

create trigger runs_touch before update on public.runs
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- exercises / workouts / workout_sets
-- ---------------------------------------------------------------------------
create table if not exists public.exercises (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default public.local_user_id(),
  name         text not null check (length(trim(name)) > 0),
  muscle_group text,
  created_at   timestamptz not null default now()
);

-- Case-insensitive: "supino reto" e "Supino Reto" sao o mesmo exercicio.
create unique index if not exists exercises_user_name_uniq
  on public.exercises (user_id, lower(name));

create table if not exists public.workouts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default public.local_user_id(),
  workout_date date not null,
  split        text,
  duration_min integer check (duration_min is null or duration_min > 0),
  rpe          smallint check (rpe is null or rpe between 1 and 10),
  note         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists workouts_user_date_idx
  on public.workouts (user_id, workout_date desc);

create trigger workouts_touch before update on public.workouts
  for each row execute function public.touch_updated_at();

create table if not exists public.workout_sets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default public.local_user_id(),
  workout_id  uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  set_index   smallint not null,
  weight_kg   numeric(6,2) not null check (weight_kg >= 0),
  reps        smallint not null check (reps > 0),
  rpe         smallint check (rpe is null or rpe between 1 and 10),
  is_warmup   boolean not null default false,
  -- 1RM estimado pela formula de Epley. Coluna gerada: o banco e a fonte da
  -- verdade, entao grafico e deteccao de PR nunca divergem do que a UI mostra.
  e1rm        numeric(7,2) generated always as
              (round(weight_kg * (1 + reps::numeric / 30), 2)) stored,
  created_at  timestamptz not null default now()
);

create index if not exists workout_sets_workout_idx on public.workout_sets (workout_id);
create index if not exists workout_sets_exercise_idx
  on public.workout_sets (user_id, exercise_id, created_at desc);

create table if not exists public.personal_records (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default public.local_user_id(),
  exercise_id    uuid not null references public.exercises(id) on delete cascade,
  workout_set_id uuid references public.workout_sets(id) on delete cascade,
  achieved_on    date not null,
  weight_kg      numeric(6,2) not null,
  reps           smallint not null,
  e1rm           numeric(7,2) not null,
  created_at     timestamptz not null default now()
);

create index if not exists personal_records_user_ex_idx
  on public.personal_records (user_id, exercise_id, e1rm desc);

-- ============================================================================
-- TRIGGERS DE SINCRONIA
--
-- Corrida e treino marcam o habito do dia sozinhos. Sem entrada dupla: voce
-- registra a corrida em /running e o check-in do dia ja aparece marcado.
-- ============================================================================

create or replace function public.refresh_running_day(p_user uuid, p_date date)
returns void language plpgsql security definer set search_path = public as $$
declare total numeric;
begin
  select sum(distance_km) into total
    from public.runs where user_id = p_user and run_date = p_date;

  if total is null then
    delete from public.habit_logs
      where user_id = p_user and habit_key = 'running' and log_date = p_date;
  else
    insert into public.habit_logs (user_id, habit_key, log_date, done, value)
    values (p_user, 'running', p_date, true, total)
    on conflict (user_id, habit_key, log_date)
    do update set done = true, value = excluded.value, updated_at = now();
  end if;
end $$;

create or replace function public.refresh_training_day(p_user uuid, p_date date)
returns void language plpgsql security definer set search_path = public as $$
declare total numeric;
declare cnt integer;
begin
  select count(*), sum(duration_min) into cnt, total
    from public.workouts where user_id = p_user and workout_date = p_date;

  if cnt = 0 then
    delete from public.habit_logs
      where user_id = p_user and habit_key = 'training' and log_date = p_date;
  else
    insert into public.habit_logs (user_id, habit_key, log_date, done, value)
    values (p_user, 'training', p_date, true, total)
    on conflict (user_id, habit_key, log_date)
    do update set done = true, value = excluded.value, updated_at = now();
  end if;
end $$;

create or replace function public.sync_run_habit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- Em UPDATE que muda a data, os dois dias precisam ser recalculados.
  if tg_op in ('UPDATE','DELETE') then
    perform public.refresh_running_day(old.user_id, old.run_date);
  end if;
  if tg_op in ('INSERT','UPDATE') then
    perform public.refresh_running_day(new.user_id, new.run_date);
    return new;
  end if;
  return old;
end $$;

create or replace function public.sync_workout_habit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op in ('UPDATE','DELETE') then
    perform public.refresh_training_day(old.user_id, old.workout_date);
  end if;
  if tg_op in ('INSERT','UPDATE') then
    perform public.refresh_training_day(new.user_id, new.workout_date);
    return new;
  end if;
  return old;
end $$;

drop trigger if exists runs_sync_habit on public.runs;
create trigger runs_sync_habit after insert or update or delete on public.runs
  for each row execute function public.sync_run_habit();

drop trigger if exists workouts_sync_habit on public.workouts;
create trigger workouts_sync_habit after insert or update or delete on public.workouts
  for each row execute function public.sync_workout_habit();

-- ---------------------------------------------------------------------------
-- Deteccao de PR: toda serie valida que supera o melhor e1RM do exercicio
-- vira uma linha em personal_records.
-- ---------------------------------------------------------------------------
create or replace function public.detect_pr() returns trigger
language plpgsql security definer set search_path = public as $$
declare best numeric;
declare w_date date;
begin
  if new.is_warmup then
    return new;
  end if;

  select max(e1rm) into best
    from public.personal_records
   where user_id = new.user_id and exercise_id = new.exercise_id;

  if best is null or new.e1rm > best then
    select workout_date into w_date from public.workouts where id = new.workout_id;
    insert into public.personal_records
      (user_id, exercise_id, workout_set_id, achieved_on, weight_kg, reps, e1rm)
    values
      (new.user_id, new.exercise_id, new.id, coalesce(w_date, current_date),
       new.weight_kg, new.reps, new.e1rm);
  end if;

  return new;
end $$;

drop trigger if exists workout_sets_detect_pr on public.workout_sets;
create trigger workout_sets_detect_pr after insert on public.workout_sets
  for each row execute function public.detect_pr();

-- ============================================================================
-- RLS
--
-- Ativa em tudo. Enquanto nao existe auth, a policy libera anon — de forma
-- EXPLICITA, pra ficar obvio o que trocar depois. Enquanto estiver assim,
-- o app e para rodar local. Ver PLAN.md secao 10.1
-- ============================================================================
alter table public.profiles         enable row level security;
alter table public.habit_logs       enable row level security;
alter table public.runs             enable row level security;
alter table public.exercises        enable row level security;
alter table public.workouts         enable row level security;
alter table public.workout_sets     enable row level security;
alter table public.personal_records enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','habit_logs','runs','exercises','workouts','workout_sets','personal_records'
  ] loop
    execute format('drop policy if exists local_operator_all on public.%I', t);
    execute format(
      'create policy local_operator_all on public.%I for all to anon, authenticated using (true) with check (true)',
      t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Seed do operador local
-- ---------------------------------------------------------------------------
insert into public.profiles (id, display_name)
values (public.local_user_id(), 'AGENTE')
on conflict (id) do nothing;
