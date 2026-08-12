# CLAUDE.md — OPERATION: BETTER SELF

## Projeto

Tracker pessoal de disciplina com estetica de terminal/CRT, tema Leon S. Kennedy (RE4).
React 19 + Vite 8 + TypeScript. Supabase (Postgres + RLS). Interface em pt-BR.
Referencia visual: `../ultimate-backlog` — mesma linguagem grafica, accent vermelho trocado por branco.

Rastreia: contencao (no-PMO), meditacao, leitura, corrida e treino de academia.

## Comandos

```bash
npm run dev      # Vite, porta 5173
npm run build    # tsc -b && vite build
npm run lint     # ESLint
npm run preview  # Preview do build

node scripts/optimize-wallpapers.mjs   # gera webp desktop/mobile + LQIP
```

## Estrutura

```
src/
  main.tsx
  index.css                       # @theme + tokens shadcn + todos os efeitos CSS
  app/       App.tsx · providers.tsx · router.tsx
  shared/
    lib/        supabase · query-client · user · date · streaks · sounds · utils
    types/      database.types.ts
    constants/  habits.ts · quotes.ts · wallpapers.ts
    store/      ui-store.ts (zustand + persist)
    hooks/      use-crt · use-sound · use-media-query
    components/
      ui/       Button · Panel · StatCard · Meter · Field · Feedback · Modal
                ConfirmDialog · Snackbar · Tabs · GlitchLogo  (barrel em index.ts)
      layout/   AppLayout · NavRail · BottomNav · PageHeader · Wallpaper
                BootScreen · NotFoundPage
      charts/   chart-theme.ts · ChartFrame.tsx
  features/
    home/ · checkin/ · running/ · gym/ · reports/ · profile/
      api/         queryOptions + useMutation
      components/  <Nome>Page.tsx como entry point
supabase/
  migrations/  0001_init.sql (rodar) · 0002_enable_auth.sql (nao rodar ainda)
```

## Convencoes

### Arquitetura
- Feature-based. Tudo reutilizavel em `src/shared/`.
- `queryOptions` factory do TanStack Query v5; chaves centralizadas em `shared/lib/query-client.ts`.
- Estado de UI em Zustand (`ui-store`), com `persist` no localStorage.
- **Rotas em ingles, labels em pt-BR.** `/check-in` `/gym` `/running` `/reports` `/profile`.

### Estilos
- Tailwind v4 com bloco `@theme` no `index.css` — sem `tailwind.config.js`.
- Efeitos complexos (CRT, glitch, animated-border, heatmap, rail) sao CSS puro no `index.css`.
- Accent e **branco**. Cores restantes (`ok`/`warn`/`fail`/`info`) sao reservadas para estado.
- `--radius: 0`. Nada arredondado exceto `status-dot` e avatar.

### shadcn / Base UI
- `components.json` aponta para `@/shared/components/ui`.
- O estilo `base-nova` usa **@base-ui/react**, nao Radix. Os primitivos (`Dialog`, `AlertDialog`)
  sao usados so pelo comportamento/a11y; o visual e todo reescrito.
- Os tokens do shadcn (`--background`, `--popover`, `--border`, ...) estao definidos no
  `index.css` apontando para a nossa paleta dark. **Sem eles, componente gerado pelo CLI
  renderiza em branco.**

### Dados
- Client tipado: `createClient<Database>` em `shared/lib/supabase.ts`.
- Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (client) — server em `supabase/.env`.
- `user_id` nunca e escrito na mao: passa por `getUserId()` em `shared/lib/user.ts`.
- Mutations de corrida/treino invalidam `queryKeys.habitLogs` tambem — triggers no banco
  marcam o habito do dia.

### Graficos
- **Monocromaticos, uma serie por grafico.** Comparacao entre habitos usa small multiples
  (uma barra por habito, todas brancas, identidade pelo rotulo) — nunca paleta categorica.
- Tema em `shared/components/charts/chart-theme.ts`; moldura e tooltip em `ChartFrame.tsx`.
- Grid/eixos recessivos, linhas 2px, marcadores 8px com anel da cor da superficie,
  barras com `radius={[4,4,0,0]}`.
- Recharts fica num chunk proprio (~358kB): as rotas com grafico sao `lazy` no router.

## Tabelas

`profiles` · `habit_logs` · `runs` · `exercises` · `workouts` · `workout_sets` · `personal_records`

- `habit_logs`: uma linha por habito por dia, `unique(user_id, habit_key, log_date)`.
  `value` = minutos | paginas | km conforme o habito.
- `workout_sets.e1rm`: **coluna gerada** (Epley, `round(peso * (1 + reps/30), 2)`) — banco e a
  fonte da verdade, grafico e deteccao de PR nunca divergem.
- Triggers: `runs`/`workouts` sincronizam `habit_logs`; `workout_sets` alimenta `personal_records`.

## Gotchas

- `@import "tailwindcss"` DEVE ser a primeira linha do `index.css`. Reset global dentro de `@layer base`.
- **Datas**: sempre `format(date, 'yyyy-MM-dd')` do date-fns. Nunca `toISOString().slice(0,10)` —
  em Brasilia isso devolve o dia seguinte depois das 21h.
- **Tipos do banco sao `type`, nunca `interface`.** Interface nao ganha index signature implicita,
  entao `Database['public']` falha o constraint `GenericSchema` do supabase-js, `Schema` vira
  `never` e todo `.insert()` passa a aceitar so `never[]` — com o `.select()` continuando a
  compilar, o que torna o erro dificil de achar.
- **`min-width: 0` em item de grid/flex que contem Swiper.** Sem isso o Swiper mede o container
  como 33554432px (2^25) e o slide estoura a viewport no mobile.
- NavRail expande com `#rail:has(:focus-visible)`, nao `:focus-within` — este ultimo dispara
  com clique de mouse e deixa o rail travado aberto depois de navegar.
- `NavRail` e `#main` precisam ser **irmaos** no DOM: o CSS usa o combinador `~`.
- `showSnack()` funciona de qualquer lugar, mas `<Snackbar />` precisa estar montado (esta no AppLayout).
- `networkMode: 'always'` no QueryClient: no modo padrao uma query que falha fica em
  `fetchStatus: 'paused'` com `status: 'pending'` (spinner eterno) em vez de mostrar o erro.
- Path alias `@` -> `./src` no `vite.config.ts` e `tsconfig.app.json`. Sem `baseUrl` (deprecado no TS 6).

## Estado atual

- **Sem autenticacao** (modo operador unico). RLS ativa com policy permissiva para `anon`.
  Rodar apenas local. Ver `SUPABASE_SETUP.md` e `PLAN.md` secao 10.1.
- A migracao `0001_init.sql` precisa ser rodada manualmente no SQL Editor do Supabase.
