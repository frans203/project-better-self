# CLAUDE.md — OPERATION: BETTER SELF

## Projeto

Tracker pessoal de disciplina com estetica de terminal/CRT, tema Leon S. Kennedy (RE4).
React 19 + Vite 8 + TypeScript. Supabase (Postgres + RLS). Interface em pt-BR.
Referencia visual: `../ultimate-backlog` — mesma linguagem grafica, accent vermelho trocado por branco.

Rastreia: contencao (no-PMO), meditacao, leitura, corrida e treino de academia.

## Publico-alvo

O **"nerd forte"**: gamer/geek/otaku, 18–35 anos, que treina musculacao de verdade e trata a
propria evolucao como build de personagem (nivel, rank, grind, streak). Quer disciplina completa,
nao so treino. Rejeita estetica fitness generica. Brasileiro, paga em PIX.

- **Tom de copy:** seco, militar, terminal. Sem "parabens!!", sem coach motivacional, sem emoji.
  Honesto: dia sem registro nao e falha, rank pode cair, frase nao ganha autor inventado.
- **Rumo a SaaS** — planos por arquetipo + freemium + API NestJS com adapters. Tudo em
  `SAAS_PLAN.md`. **Nada disso esta implementado ainda.**
- **IP de personagens: risco assumido na fase de tracao** (ver `SAAS_PLAN.md` §0). Arquetipos tem
  `codename` original (permanente — unico nome que codigo, banco e gateway conhecem) e
  `showcaseName` de personagem (Kratos, Joel, Chris, Dante, Nero — temporario, so na UI/landing).
  Nunca arte oficial (so fan art), nunca nome de personagem no checkout/nota/`plan_id`, nunca
  frase literal de jogo no produto pago. Trocar a vitrine tem que continuar sendo uma linha.

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
- **Rotas em ingles, labels em pt-BR.** `/check-in` `/gym` `/running` `/rank` `/reports` `/profile`.

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
`wods` · `wod_results`

- `habit_logs`: uma linha por habito por dia, `unique(user_id, habit_key, log_date)`.
  `value` = minutos | paginas | km conforme o habito.
- `workout_sets.e1rm`: **coluna gerada** (Epley, `round(peso * (1 + reps/30), 2)`) — banco e a
  fonte da verdade, grafico e deteccao de PR nunca divergem.
- Triggers: `runs`/`workouts` sincronizam `habit_logs`; `workout_sets` alimenta `personal_records`.
- `workouts.kind`: 'gym' (tem series) | 'wod' (tem `wod_results`). DEFAULT 'gym' NOT NULL, entao
  linha gravada antes da 0003 le como 'gym' — nunca undefined. Use `isGymWorkout()`/`setsOf()`/
  `wodResultOf()` do gym-api em vez de tocar nos campos direto.
- `wod_results.total_reps`: **coluna gerada** (rounds x reps_per_round + extra_reps). `reps_per_round`
  e copiado do WOD no registro: editar a definicao depois nao reescreve o placar historico.
- Nivel (`shared/lib/rank.ts`) e 100% derivado de habit_logs + runs + workout_sets + wod_results. Nada persistido,
  entao nao ha migracao nem linha antiga sem valor. So o `celebrated` do ui-store (localStorage)
  guarda quais requisitos ja renderam confete.
- **Academia e WOD sao metricas SEPARADAS no nivel.** `reps` = so workout_sets (janela 7 dias);
  `wod` = so CrossFit (janela 15 dias). Somar os dois fazia uma Cindy (~330 reps de peso corporal)
  valer 7 semanas de academia (~17 reps de barra pesada por treino). Volume em kg e so academia:
  WOD nao tem carga registrada e estimar pelo peso corporal seria numero inventado.
- `wodRepsOf()` traduz resultado em reps: AMRAP/EMOM/rounds usam `total_reps` (coluna gerada, exato);
  for_time usa a soma de `wods.movements` (exato em passagem unica, subestima em 'N rounds for time'
  como a Helen — subestima, nunca conta a mais).
- A regua de `reps` esta calibrada no treino real do operador (~4 series de ~4 reps = ~17/sessao),
  nao num treino generico de 10-12 reps. A coluna `wod` comeca em 0 no BRONZE de proposito: da pra
  subir o primeiro nivel so levantando peso, e condicionamento so vira requisito de PRATA pra cima.

## Gotchas

- `@import "tailwindcss"` DEVE ser a primeira linha do `index.css`. Reset global dentro de `@layer base`.
- **Campo com menos de 16px da zoom no iOS.** `.field-input`/`.field-select` sobem para 16px dentro de
  `@media (pointer: coarse)`. Nao resolver com `maximum-scale=1` no viewport: mata o pinch-zoom.
- **Nunca animar `width` sobre texto.** Exige `white-space: nowrap`, e ai a frase longa vaza do
  container (foi o bug do typewriter do LeonLine). Use `transform: scaleX` — e o que o `.req-strike` faz.
- Rotulo flutuante (`floating` no `Input`) depende de `input:focus + label` no CSS: o `<label>` tem que
  ser o irmao imediatamente seguinte ao `<input>`. Nao usar com `type="date"` — input de data nunca
  satisfaz `:placeholder-shown` e o rotulo nasceria em cima do valor.
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

- **Auth ligada.** `0002_enable_auth.sql` ja rodou: `user_id` vem de `auth.uid()`, policy
  `owner_all` restrita a `authenticated`, e `getUserId()` le a sessao do `auth-store`.
  Ver `SUPABASE_SETUP.md` e `PLAN.md` secao 10.1.
- A migracao `0001_init.sql` precisa ser rodada manualmente no SQL Editor do Supabase.
- **`0003_wods.sql` idem.** Enquanto nao rodar, `workoutsQuery` cai sozinha para a consulta sem
  WOD (PGRST200) e o resto do app segue funcionando — mas o WOD nao grava.
