-- ============================================================================
-- 0004 — Arquetipo, alistamento (trial) e billing
--
-- RASCUNHO. NAO RODAR antes de revisado pelos dois (SAAS_PLAN.md §10.2-A):
-- o banco e compartilhado e o app publicado fala com ele.
--
-- Pre-requisitos: 0001, 0002 e 0003 ja rodados.
-- Idempotente: rodar duas vezes nao quebra nada.
--
-- Vocabulario (codinomes, plan_id, chaves de entitlement, status) e o mesmo
-- de contracts/api.ts. Mudou la, muda aqui — e vice-versa.
--
-- QUEM ESCREVE O QUE
--   - profiles.archetype_codename / trial_ends_at / archetype_switch_used:
--     so pela funcao choose_archetype() (onboarding, F3) ou pela API. O
--     usuario autenticado NAO consegue escrever direto (trigger da secao 2),
--     senao bastava um PATCH no PostgREST para esticar o proprio trial.
--   - plans, subscriptions, checkouts, entitlements, payment_events: so a API
--     (service role). O usuario autenticado le as proprias linhas e nada mais.
--
-- O QUE NAO E LINHA EM `entitlements`
--   O arquetipo escolhido e o trial NAO viram linha: a API deriva os dois de
--   `profiles` na hora de montar GET /me/entitlements. Assim trocar de
--   arquetipo no alistamento nao exige sincronizar nada. `entitlements` guarda
--   so direito pago ou concedido (assinatura, compra avulsa, FUNDADOR).
--
-- COMPATIBILIDADE
--   O front de hoje nao le nada daqui, entao nao ha degradacao a tratar: com
--   ou sem esta migracao o app se comporta igual. As contas existentes ficam
--   com arquetipo e trial nulos ate passarem pelo onboarding.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Codinome de arquetipo como dominio
--
-- Um lugar so para a lista. Adicionar arquetipo depois:
--   alter domain public.archetype_codename drop constraint archetype_codename_check;
--   alter domain public.archetype_codename add constraint archetype_codename_check
--     check (value in (..., 'novo'));
-- Remover ou renomear depois que houver linha usando NAO e trivial — por isso
-- MONGE (opcional no §3) ainda nao entra.
-- ---------------------------------------------------------------------------
do $$
begin
  create domain public.archetype_codename as text
    constraint archetype_codename_check
    check (value in ('operador','espartano','sobrevivente','cacador','herdeiro'));
exception
  when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- 2. profiles — arquetipo e alistamento
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists archetype_codename    public.archetype_codename,
  -- Fim do alistamento (§4.2). Nasce na primeira escolha de arquetipo.
  -- No banco, nunca no localStorage: limpar o navegador nao pode reiniciar o teste.
  add column if not exists trial_ends_at         timestamptz,
  -- O alistamento permite UMA troca de arquetipo (§4.2, item 1).
  add column if not exists archetype_switch_used boolean not null default false;

-- Bloqueia escrita direta dessas colunas por anon/authenticated. A funcao
-- choose_archetype() e SECURITY DEFINER, entao dentro dela current_user e o
-- dono da funcao e o trigger deixa passar. A API escreve com o usuario de
-- servico — se um dia ela fizer `set local role authenticated` (defesa em
-- profundidade, §5.3), essas colunas continuam fora desse caminho.
create or replace function public.protect_profile_billing_columns() returns trigger
language plpgsql as $$
begin
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.archetype_codename is not null
       or new.trial_ends_at is not null
       or new.archetype_switch_used then
      raise exception 'arquetipo e alistamento so mudam por choose_archetype()'
        using errcode = '42501';
    end if;
  elsif new.archetype_codename    is distinct from old.archetype_codename
     or new.trial_ends_at         is distinct from old.trial_ends_at
     or new.archetype_switch_used is distinct from old.archetype_switch_used then
    raise exception 'arquetipo e alistamento so mudam por choose_archetype()'
      using errcode = '42501';
  end if;

  return new;
end $$;

drop trigger if exists profiles_protect_billing on public.profiles;
create trigger profiles_protect_billing before insert or update on public.profiles
  for each row execute function public.protect_profile_billing_columns();

-- ---------------------------------------------------------------------------
-- 3. plans
--
-- Preco mora aqui, nao no codigo: muda sem deploy. `id` e o PlanId do
-- contrato e so usa codinome (guardrail §0 — nome de personagem nunca chega
-- ao gateway nem a nota).
-- ---------------------------------------------------------------------------
create table if not exists public.plans (
  id                 text primary key
                     check (id ~ '^(pro_monthly|pro_yearly|founder|archetype_[a-z_]+)$'),
  -- So nos planos `archetype_<codinome>` (avulso, futuro).
  archetype_codename public.archetype_codename,
  interval           text not null check (interval in ('month','year','lifetime','one_time')),
  price_cents        integer not null check (price_cents > 0),
  -- Tamanho do lote (FUNDADOR). Vendidos = checkouts pagos desse plano; a API
  -- devolve a diferenca como `remainingSlots`.
  slot_limit         integer check (slot_limit is null or slot_limit > 0),
  active             boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- Os dois ramos precisam do `is null` / `is not null` explicito: sem isso,
  -- 'archetype_kratos' com codinome nulo da `id = 'archetype_' || null` = NULL,
  -- e CHECK que avalia NULL deixa passar.
  constraint plans_archetype_matches_id check (
    (archetype_codename is null and id !~ '^archetype_')
    or (archetype_codename is not null and id = 'archetype_' || archetype_codename)
  )
);

drop trigger if exists plans_touch on public.plans;
create trigger plans_touch before update on public.plans
  for each row execute function public.touch_updated_at();

-- Precos SUGERIDOS no §4.5, todos INATIVOS. Ativar so depois de confirmar as
-- taxas reais do AbacatePay (§11):
--   update public.plans set active = true where id in (...);
insert into public.plans (id, interval, price_cents, slot_limit) values
  ('pro_monthly', 'month',     1290, null),
  ('pro_yearly',  'year',      8990, null),
  ('founder',     'lifetime', 19900, 300)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 4. subscriptions — so planos recorrentes (month/year)
--
-- FUNDADOR e avulso nao sao assinatura: viram checkout pago + entitlement.
-- Cancelou com periodo ainda pago = status 'active' + cancel_at preenchido.
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references auth.users(id) on delete cascade,
  plan_id                   text not null references public.plans(id),
  status                    text not null
                            check (status in ('active','past_due','canceled','expired')),
  method                    text not null check (method in ('pix','card')),
  provider                  text not null,
  provider_subscription_ref text not null,
  current_period_end        timestamptz not null,
  cancel_at                 timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  unique (provider, provider_subscription_ref)
);

-- No maximo uma assinatura viva por usuario. E o que vira CONFLICT no
-- POST /billing/checkouts.
create unique index if not exists subscriptions_one_live_per_user
  on public.subscriptions (user_id) where status in ('active','past_due');

-- Job de reconciliacao (§6.4): periodo vencido sem evento de renovacao.
create index if not exists subscriptions_period_end_idx
  on public.subscriptions (current_period_end) where status in ('active','past_due');

drop trigger if exists subscriptions_touch on public.subscriptions;
create trigger subscriptions_touch before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 5. checkouts
--
-- A API cria a linha ANTES de chamar o gateway (provider_ref nulo ate ele
-- responder). `amount_cents` e copiado do plano na criacao: mudar o preco
-- depois nao reescreve o que ja foi cobrado.
-- redirect_url / pix_* ficam guardados para o GET /billing/checkouts/:id
-- redesenhar o QR se a pessoa recarregar a pagina.
-- ---------------------------------------------------------------------------
create table if not exists public.checkouts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  plan_id           text not null references public.plans(id),
  method            text not null check (method in ('pix','card')),
  provider          text not null,
  provider_ref      text,
  status            text not null default 'pending'
                    check (status in ('pending','paid','expired','failed')),
  amount_cents      integer not null check (amount_cents > 0),
  redirect_url      text,
  pix_copy_paste    text,
  pix_qr_png_base64 text,
  pix_expires_at    timestamptz,
  -- Preenchido quando o pagamento abre uma assinatura.
  subscription_id   uuid references public.subscriptions(id) on delete set null,
  paid_at           timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (provider, provider_ref),
  constraint checkouts_paid_has_date check (status <> 'paid' or paid_at is not null)
);

create index if not exists checkouts_user_created_idx
  on public.checkouts (user_id, created_at desc);
-- Contagem de vagas vendidas do FUNDADOR.
create index if not exists checkouts_plan_paid_idx
  on public.checkouts (plan_id) where status = 'paid';

drop trigger if exists checkouts_touch on public.checkouts;
create trigger checkouts_touch before update on public.checkouts
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 6. entitlements — fonte da verdade de "pode usar?" (§6.3)
--
-- O app pergunta aqui, nunca ao gateway: gateway fora do ar nao derruba nada.
-- `key` segue o EntitlementKey do contrato: archetype:<codinome> | archetype:*
-- | feature:<chave> | feature:*. O formato e checado; a lista de features
-- nao (feature nova nao deveria exigir migracao).
-- ---------------------------------------------------------------------------
create table if not exists public.entitlements (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  key             text not null
                  check (key ~ '^(archetype|feature):(\*|[a-z_]+(\.[a-z_]+)*)$'),
  source          text not null check (source in ('subscription','purchase','trial','founder')),
  -- De onde veio. Revogar uma assinatura apaga so os grants DELA — o
  -- cosmetico do FUNDADOR ou um arquetipo comprado ficam.
  subscription_id uuid references public.subscriptions(id) on delete cascade,
  checkout_id     uuid references public.checkouts(id) on delete set null,
  -- null = nao expira.
  expires_at      timestamptz,
  created_at      timestamptz not null default now(),
  constraint entitlements_subscription_source check (
    (source = 'subscription') = (subscription_id is not null)
  )
);

create index if not exists entitlements_user_idx on public.entitlements (user_id);
-- Webhook reprocessado nao duplica grant da mesma assinatura.
create unique index if not exists entitlements_subscription_key_uniq
  on public.entitlements (subscription_id, key) where subscription_id is not null;

-- ---------------------------------------------------------------------------
-- 7. payment_events — log bruto do webhook + idempotencia (§6.4)
--
-- O gateway reenvia webhook: o segundo insert bate no unique e a API ignora.
-- `type` e o nome do evento NO GATEWAY (ex.: transparent.completed); a
-- traducao para o PaymentEvent do contrato acontece no adapter.
-- Sem user_id de proposito: o payload pode chegar antes de sabermos de quem e.
-- ---------------------------------------------------------------------------
create table if not exists public.payment_events (
  id                bigint generated always as identity primary key,
  provider          text not null,
  provider_event_id text not null,
  type              text not null,
  payload           jsonb not null,
  received_at       timestamptz not null default now(),
  processed_at      timestamptz,
  -- Falha ao aplicar o evento. Linha com erro e sem processed_at = reprocessar.
  error             text,
  unique (provider, provider_event_id)
);

create index if not exists payment_events_unprocessed_idx
  on public.payment_events (received_at) where processed_at is null;

-- ---------------------------------------------------------------------------
-- 8. choose_archetype() — unico caminho do front para arquetipo e trial
--
-- Chamada do onboarding (F3): supabase.rpc('choose_archetype', { p_codename })
-- Regras:
--   - primeira escolha: grava o arquetipo e abre o alistamento de 7 dias
--     (se a API ja tiver aberto um maior — convite de esquadrao, 14 dias, §4.6 —
--     mantem o maior);
--   - mesmo arquetipo de novo: nao faz nada;
--   - tem direito ao arquetipo (archetype:* ou archetype:<alvo>): troca livre;
--   - no alistamento e a troca unica ainda nao usada: troca e queima a troca;
--   - fora disso: erro P0001 com hint ENTITLEMENT_REQUIRED.
-- Codinome invalido cai no check do dominio (23514).
-- ---------------------------------------------------------------------------
create or replace function public.choose_archetype(p_codename text)
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare
  v_uid      uuid := auth.uid();
  v_target   public.archetype_codename := p_codename;
  v_profile  public.profiles;
begin
  if v_uid is null then
    raise exception 'sessao ausente' using errcode = '28000';
  end if;

  select * into v_profile from public.profiles where id = v_uid for update;
  if not found then
    raise exception 'perfil inexistente' using errcode = 'P0002';
  end if;

  if v_profile.archetype_codename is null then
    update public.profiles
       set archetype_codename = v_target,
           trial_ends_at = greatest(trial_ends_at, now() + interval '7 days')
     where id = v_uid
    returning * into v_profile;

  elsif v_profile.archetype_codename = v_target then
    null;

  elsif exists (
    select 1 from public.entitlements e
     where e.user_id = v_uid
       and e.key in ('archetype:*', 'archetype:' || v_target)
       and (e.expires_at is null or e.expires_at > now())
  ) then
    update public.profiles set archetype_codename = v_target
     where id = v_uid
    returning * into v_profile;

  elsif not v_profile.archetype_switch_used and v_profile.trial_ends_at > now() then
    update public.profiles
       set archetype_codename = v_target, archetype_switch_used = true
     where id = v_uid
    returning * into v_profile;

  else
    raise exception 'troca de arquetipo indisponivel'
      using errcode = 'P0001', hint = 'ENTITLEMENT_REQUIRED';
  end if;

  return v_profile;
end $$;

revoke execute on function public.choose_archetype(text) from public, anon;
grant  execute on function public.choose_archetype(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 9. RLS e privilegios
--
-- O Supabase concede tudo em tabela nova para anon/authenticated por padrao;
-- RLS sem policy de escrita ja bloqueia, e o revoke e a segunda trava.
-- ---------------------------------------------------------------------------
alter table public.plans          enable row level security;
alter table public.subscriptions  enable row level security;
alter table public.checkouts      enable row level security;
alter table public.entitlements   enable row level security;
alter table public.payment_events enable row level security;

revoke insert, update, delete, truncate on
  public.plans, public.subscriptions, public.checkouts, public.entitlements
  from anon, authenticated;
revoke all on public.payment_events from anon, authenticated;

-- Plano ativo e publico (a landing mostra preco sem login).
drop policy if exists plans_read_active on public.plans;
create policy plans_read_active on public.plans for select to anon, authenticated
  using (active);

do $$
declare t text;
begin
  foreach t in array array['subscriptions','checkouts','entitlements'] loop
    execute format('drop policy if exists owner_read on public.%I', t);
    execute format(
      'create policy owner_read on public.%I for select to authenticated
         using (auth.uid() = user_id)', t
    );
  end loop;
end $$;

commit;

-- ---------------------------------------------------------------------------
-- Verificacao — rodar depois, separado.
--
--   select id, interval, price_cents, slot_limit, active from public.plans;
--     -> 3 linhas, todas active = false
--
--   select tablename, policyname, roles, cmd from pg_policies
--    where schemaname = 'public'
--      and tablename in ('plans','subscriptions','checkouts','entitlements','payment_events');
--     -> plans_read_active {anon,authenticated} SELECT + 3x owner_read
--        {authenticated} SELECT. payment_events sem policy.
--
--   select id, archetype_codename, trial_ends_at from public.profiles;
--     -> contas existentes com os dois nulos
-- ---------------------------------------------------------------------------
