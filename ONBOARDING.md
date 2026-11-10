# Onboarding — OPERATION: BETTER SELF

Guia pra quem chega e quer rodar o app e abrir o primeiro PR no mesmo dia.

---

## 1. Pre-requisitos

- **Node 20.19+ ou 22.12+** (Vite 8 nao roda em versao mais velha). O time usa Node 24.
- **Git** com acesso ao repo `frans203/project-better-self` no GitHub.
- **Uma conta de login no app**: pede pro Francisco criar. Nao tem tela de cadastro,
  as contas sao criadas pelo admin.
- *(Opcional)* Acesso ao dashboard do Supabase, se voce for mexer em schema.

## 2. Rodando local

```bash
git clone https://github.com/frans203/project-better-self.git
cd project-better-self
npm install
cp .env.example .env      # e preenche (ver abaixo)
npm run dev               # http://localhost:5173
```

### `.env`

So duas variaveis, e as duas sao **publicas** (vao pro bundle):

```env
VITE_SUPABASE_URL=https://sfaedcyombrnynnpkjei.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<pede pro Francisco>
```

A publishable key sozinha nao abre nada: quem protege os dados e a RLS. Mesmo assim,
**o `.env` nunca vai pro git** (ja esta no `.gitignore`).

> **`supabase/.env` e outra historia.** Ele guarda a `SUPABASE_SECRET_KEY`, que ignora a
> RLS e le/escreve dado de qualquer usuario. Voce **nao precisa dela** pra desenvolver o
> front. Se um dia precisar, ela vem por canal seguro. Nunca com prefixo `VITE_`, nunca
> importada de `src/`, nunca commitada.

### Login

Entra com o email e a senha que voce recebeu. A conta comeca **vazia**, porque cada usuario
so enxerga as proprias linhas (policy `owner_all` + `auth.uid()`). O trigger
`handle_new_user` ja criou seu `profile`.

## 3. O banco e compartilhado: cuidado

Existe **um projeto Supabase so**. Seu `npm run dev` fala com o mesmo banco que o app
publicado. Por isso:

- Seus dados de teste ficam isolados pela RLS, mas **ficam no banco de verdade**. Testar
  com a sua conta e tranquilo. Nao use a conta de outra pessoa.
- **Migracao de schema afeta todo mundo na hora.** Nao rode SQL no SQL Editor sem combinar
  antes (ver secao 6).

## 4. Comandos

```bash
npm run dev      # Vite, porta 5173
npm run build    # tsc -b && vite build. Roda antes de abrir PR
npm run lint     # ESLint
npm run preview  # serve o build

node scripts/optimize-wallpapers.mjs   # so se adicionar wallpaper novo
```

Nao ha suite de testes. Validar = `npm run build` + `npm run lint` passando + clicar no
fluxo no navegador (desktop **e** largura de celular).

## 5. Mapa do codigo

```
src/
  app/        App, providers, router (rotas com grafico sao lazy)
  shared/     tudo reutilizavel: ui/, layout/, charts/, lib/, hooks/, store/, types/
  features/   uma pasta por tela: home, checkin, running, gym, reports, profile, auth
    <feature>/api/         queryOptions + useMutation (TanStack Query v5)
    <feature>/components/  <Nome>Page.tsx e o entry point
supabase/migrations/       SQL versionado, aplicado a mao no SQL Editor
```

**Leitura obrigatoria antes do primeiro commit:** [`CLAUDE.md`](./CLAUDE.md). E curto e
tem as convencoes e as armadilhas que ja custaram bug. Os resumos:

- **Rotas em ingles, labels em pt-BR.**
- Accent e **branco**. `ok`/`warn`/`fail`/`info` so pra estado. `--radius: 0`.
- Tailwind v4 via `@theme` no `index.css` (nao existe `tailwind.config.js`).
- Graficos **monocromaticos, uma serie por grafico**. Tema em `shared/components/charts/`.
- `user_id` nunca e escrito na mao: usa `getUserId()`.
- Datas sempre com `format(date, 'yyyy-MM-dd')`, **nunca** `toISOString().slice(0,10)`.
- Tipos do banco sao `type`, nunca `interface` (quebra o client tipado em silencio).
- Mutation de corrida/treino tambem invalida `queryKeys.habitLogs`.

Contexto mais profundo (decisoes de produto e arquitetura): [`PLAN.md`](./PLAN.md).

> `SUPABASE_SETUP.md` e a secao de auth do `README.md` estao **desatualizados**: ainda
> dizem que o app roda sem auth. **A auth esta ligada.** Na duvida, vale o `CLAUDE.md`.

## 6. Mexendo no schema

1. Cria `supabase/migrations/000N_descricao.sql` (proximo numero livre).
2. Atualiza `src/shared/types/database.types.ts` na mao (sempre `type`).
3. Faz o app **degradar sem a migracao**. O padrao ja existe: `workoutsQuery` cai pra
   consulta sem WOD quando a `0003` nao rodou (PGRST200). Assim o deploy nao quebra entre o
   merge e alguem rodar o SQL.
4. Combina com o Francisco quem roda o SQL no SQL Editor e quando.
5. Documenta a tabela/gotcha nova no `CLAUDE.md`.

## 7. Fluxo de trabalho

- Branch a partir da `main`: `feat/...`, `fix/...`.
- Commits no estilo do historico: `feat: ...` / `fix: ...`, descricao em pt-BR.
- Antes do PR: `npm run build && npm run lint` limpos.
- PR pra `main`. O deploy e na **Vercel** (SPA, `vercel.json` reescreve tudo pra
  `index.html`).

## 8. Checklist do primeiro dia

- [ ] Recebi login do app e a publishable key
- [ ] `npm install` e `npm run dev` rodando
- [ ] Loguei e fiz um check-in de teste na minha conta
- [ ] Li o `CLAUDE.md` inteiro
- [ ] `npm run build` passa na minha maquina
- [ ] Abri um PR pequeno (ate um typo vale) pra validar o fluxo
