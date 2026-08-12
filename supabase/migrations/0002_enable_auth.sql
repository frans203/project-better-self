-- ============================================================================
-- 0002 — LIGA A AUTH
--
-- Pronto para rodar. Nada aqui precisa ser descomentado ou editado.
-- Cole o arquivo inteiro no SQL Editor e Run.
--
-- Pre-requisitos (ja feitos):
--   1. 0001_init.sql rodado.
--   2. Conta criada em Authentication > Users com "Auto Confirm User".
--      UUID: d84dd1e8-4b0a-46dc-8b93-a9236ce380af
--
-- Depois de rodar, em src/shared/lib/user.ts o getUserId() passa a ler a
-- sessao em vez de devolver a constante do operador local.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Adota os dados existentes
--
-- Tudo que hoje pertence ao operador local (00000000-...-0001) passa a
-- pertencer a sua conta. `profiles` vem por ultimo porque as outras tabelas
-- nao tem FK para ela — a ordem so importa para leitura humana.
-- ---------------------------------------------------------------------------
update public.habit_logs       set user_id = 'd84dd1e8-4b0a-46dc-8b93-a9236ce380af' where user_id = public.local_user_id();
update public.runs             set user_id = 'd84dd1e8-4b0a-46dc-8b93-a9236ce380af' where user_id = public.local_user_id();
update public.exercises        set user_id = 'd84dd1e8-4b0a-46dc-8b93-a9236ce380af' where user_id = public.local_user_id();
update public.workouts         set user_id = 'd84dd1e8-4b0a-46dc-8b93-a9236ce380af' where user_id = public.local_user_id();
update public.workout_sets     set user_id = 'd84dd1e8-4b0a-46dc-8b93-a9236ce380af' where user_id = public.local_user_id();
update public.personal_records set user_id = 'd84dd1e8-4b0a-46dc-8b93-a9236ce380af' where user_id = public.local_user_id();
update public.profiles         set id      = 'd84dd1e8-4b0a-46dc-8b93-a9236ce380af' where id      = public.local_user_id();

-- ---------------------------------------------------------------------------
-- 2. user_id passa a vir da sessao, nao de um default fixo
-- ---------------------------------------------------------------------------
alter table public.habit_logs       alter column user_id set default auth.uid();
alter table public.runs             alter column user_id set default auth.uid();
alter table public.exercises        alter column user_id set default auth.uid();
alter table public.workouts         alter column user_id set default auth.uid();
alter table public.workout_sets     alter column user_id set default auth.uid();
alter table public.personal_records alter column user_id set default auth.uid();
alter table public.profiles         alter column id      set default auth.uid();

-- ---------------------------------------------------------------------------
-- 3. Policies reais
--
-- Sai a policy permissiva `to anon using (true)`, entra `auth.uid() = user_id`
-- restrita a `authenticated`. Depois disso, requisicao anonima nao le nada.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'habit_logs','runs','exercises','workouts','workout_sets','personal_records'
  ] loop
    execute format('drop policy if exists local_operator_all on public.%I', t);
    execute format(
      'create policy owner_all on public.%I for all to authenticated
         using (auth.uid() = user_id) with check (auth.uid() = user_id)', t
    );
  end loop;

  drop policy if exists local_operator_all on public.profiles;
  create policy owner_all on public.profiles for all to authenticated
    using (auth.uid() = id) with check (auth.uid() = id);
end $$;

-- ---------------------------------------------------------------------------
-- 4. Perfil criado automaticamente no signup
--
-- Nao dispara para a conta que ja existe — ela ja tem perfil, adotado no
-- passo 1. Fica para o caso de a base ser recriada do zero.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'AGENTE'))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

commit;

-- ---------------------------------------------------------------------------
-- Verificacao — rodar depois, separado.
--
--   select id, display_name from public.profiles;
--     -> id = d84dd1e8-4b0a-46dc-8b93-a9236ce380af
--
--   select tablename, policyname, roles from pg_policies
--    where schemaname = 'public' order by tablename;
--     -> 7 linhas, todas `owner_all` e {authenticated}
-- ---------------------------------------------------------------------------
