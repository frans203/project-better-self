# Supabase — setup

Projeto: `sfaedcyombrnynnpkjei` · https://sfaedcyombrnynnpkjei.supabase.co

---

## 1. Rodar a migracao (obrigatorio, uma vez)

O schema **ainda nao esta aplicado**. DDL nao passa pela API do PostgREST, entao
esse passo e manual:

1. Abra o [SQL Editor](https://supabase.com/dashboard/project/sfaedcyombrnynnpkjei/sql/new).
2. Cole o conteudo de `supabase/migrations/0001_init.sql` inteiro.
3. Run.

Cria: `profiles`, `habit_logs`, `runs`, `exercises`, `workouts`, `workout_sets`,
`personal_records` — com RLS, triggers de sincronia, deteccao de PR e o seed do
operador local.

Verificacao rapida (deve devolver uma linha com `display_name = 'AGENTE'`):

```sql
select id, display_name, start_date from public.profiles;
```

**Nao rode `0002_enable_auth.sql`.** Ele esta todo comentado de proposito — e o
roteiro para o dia em que a auth for ligada.

---

## 2. Variaveis de ambiente

Ja estao preenchidas. Duas metades, e a separacao e de seguranca:

| Arquivo | Conteudo | Vai para o bundle? |
|---|---|---|
| `.env` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | **Sim** — e por isso que so a publishable entra aqui |
| `supabase/.env` | `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWKS_URL` | Nao — Edge Functions / scripts |

O Vite injeta no bundle **toda** variavel prefixada com `VITE_`, e apenas essas.
A publishable key e feita para ser publica: sozinha ela nao da acesso a nada,
quem protege os dados e a RLS.

A `SUPABASE_SECRET_KEY` **ignora RLS por completo** — le e escreve qualquer linha
de qualquer usuario. Nunca prefixar com `VITE_`, nunca importar de dentro de
`src/`, nunca commitar. Ambos os `.env` estao no `.gitignore`.

> Essa secret key ja circulou fora do cofre. Antes de qualquer deploy publico,
> rotacione em **Dashboard > Settings > API Keys > Rotate**.

---

## 3. Camada server — `@supabase/server`

Instalado (`v1.4.1`) junto com o skill do agente:

```bash
npm install @supabase/server
npx skills add supabase/agent-skills --skill supabase-server
```

Cria o client no servidor e injeta o contexto de auth verificando o JWT contra o
**JWKS** (assinatura assimetrica, sem round-trip ao Supabase por request).

Decisao de arquitetura (PLAN.md 6.3): **Edge Functions**, sem monorepo. O CRUD do
dia a dia vai direto do client para o Supabase via RLS — passar tudo por tras de
uma API so adicionaria latencia e mataria o optimistic update do check-in. O
servidor entra apenas onde agrega: recalculo pesado, export, seed, cron de
lembrete. Nenhuma function foi escrita ainda; nada no app depende disso hoje.

---

## 4. Estado atual da seguranca

**Sem auth (decisao 1 do PLAN.md).** Modo operador unico:

- Toda tabela tem `user_id` com `DEFAULT public.local_user_id()`
  (`00000000-0000-0000-0000-000000000001`).
- RLS esta **ativa**, com uma policy permissiva para `anon` — explicita, para
  ficar obvio o que trocar depois.
- O client nunca escreve `user_id` na mao: passa por `getUserId()` em
  `src/shared/lib/user.ts`.

> ⚠️ **Enquanto estiver assim, rode o app apenas local (`npm run dev`).**
> A publishable key esta no bundle, entao qualquer pessoa com a URL de um deploy
> publico conseguiria ler e escrever esta base — e o dado aqui e o mais pessoal
> possivel. Ligar auth = rodar `0002_enable_auth.sql` + trocar `getUserId()`.
> Zero migracao de dados, zero mudanca nas features.
