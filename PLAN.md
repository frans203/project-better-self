# OPERATION: BETTER SELF — Plano do Projeto

> Dashboard pessoal de disciplina com estética de terminal/CRT, tema Leon S. Kennedy (RE4 Remake).
> Referência visual: `../ultimate-backlog` — mesma linguagem gráfica, accent vermelho `#ff0040` → branco.

---

## 1. Conceito

Você é o agente. O app é o **terminal de status da missão**. A metáfora do RE4/D.S.O. dá nome às
seções sem virar cosplay: relatórios de campo, status do agente, registro de operações.

- Nome interno: `OPERATION: BETTER SELF` / sigla **OBS** no rail (glitch logo, igual `UB`).
- Idioma da UI: pt-BR.
- Tom: seco, militar, sem motivação de camiseta.

---

## 2. Stack

| Camada | Escolha | Nota |
|---|---|---|
| Build | **Vite 8 + React 19 + TypeScript** | mesmo setup do ultimate-backlog |
| Estilo | **Tailwind v4** (`@tailwindcss/vite`, bloco `@theme`) | sem `tailwind.config.js` |
| Componentes | **shadcn/ui** (CLI canary, Tailwind v4) | usado como *primitivo* Radix, re-estilizado |
| Dados server | **TanStack Query v5** (`queryOptions` factory) | padrão idêntico ao repo de referência |
| Estado UI | **Zustand** | CRT toggle, filtros, tabs |
| Gráficos | **Recharts 3** | linha, barra, área, radial |
| Slider | **Swiper** (`swiper/react`) | slider de frases da home — módulos `Autoplay`, `EffectFade`, `Pagination`, `A11y`, `Keyboard` |
| Ícones | **lucide-react** | traço fino combina com os SVGs do rail |
| Rotas | **react-router-dom v7** | `createBrowserRouter` |
| Forms | **react-hook-form + zod** | schemas por feature |
| Datas | **date-fns** | streaks, semanas, heatmap |
| Backend | **Supabase** (Postgres + Auth + RLS) | sua conta |

Sem framer-motion na base: o repo de referência faz transições com CSS puro (`.boot-up`,
`.page-glitch`, `.scan-hover`) e isso é mais leve e mais coerente. Entra depois só se algo pedir.

---

## 3. Sistema visual

### 3.1 Tokens (`src/index.css`, bloco `@theme`)

```
--color-bg-base:      #0a0a0a
--color-bg-surface:   #111111
--color-bg-elevated:  #1a1a1a
--color-border:       rgba(255,255,255,0.08)
--color-accent:       #ffffff        /* era #ff0040 */
--color-accent-dim:   rgba(255,255,255,0.55)
--color-text-primary: #b9b9b9        /* rebaixado de #e0e0e0 — ver 3.2 */
--color-text-secondary:#6e6e6e
--color-text-muted:   #444444
--color-ok:    #22c55e   /* dia cumprido / PR batido */
--color-warn:  #f59e0b   /* streak em risco */
--color-fail:  #ef4444   /* recaída / falha */
--color-info:  #0ea5e9   /* em andamento */
```

### 3.2 Ponto de atenção — accent branco

Trocar vermelho por branco quebra a hierarquia do repo original: lá o texto é `#e0e0e0` e o
accent é vermelho saturado, então o accent salta. Com accent branco, texto e accent viram a
mesma cor. **Correção proposta**: rebaixar o texto para `#b9b9b9` / `#6e6e6e` e reservar
`#fff` puro + `text-shadow`/`box-shadow` branco só para estado ativo, foco e destaque.
O `glow` branco também precisa ser mais fraco que o vermelho (branco satura rápido):
`0 0 12px rgba(255,255,255,0.25)` no lugar de `rgba(255,0,64,0.5)`.

### 3.3 Efeitos herdados do ultimate-backlog

Portados 1:1, com as cores trocadas:
`animated-border` · `scan-hover` · `stat-card::after` · `logo-glitch` · `boot-up` · `page-glitch`
· `terminal-text` (cursor piscando) · `status-dot` pulsante · CRT (noise + scanlines + vignette +
flicker) com toggle · scrollbar 4px · `cover-frame` tracejado.

Novos, específicos deste projeto:
- **`.heat-cell`** — célula do heatmap anual, opacidade proporcional à intensidade.
- **`.streak-bar`** — barra de streak com segmentação por dia e brilho no dia atual.
- **`.radio-line`** — a frase do Leon renderizada como transmissão (`> DSO // LEON:` + typewriter).
- **`.hero-veil`** — o backdrop preto sobre o wallpaper (ver 4.1).

### 3.4 shadcn/ui — como encaixar sem destruir a estética

shadcn vem com cantos arredondados, sombras suaves e paleta neutra: o oposto do visual daqui.
Uso previsto: **só a camada de comportamento/acessibilidade do Radix**, com o estilo reescrito.

- `--radius: 0` global. Nada arredondado, exceto `status-dot` e avatar.
- Componentes que valem a pena: `Dialog` (substitui o `Modal` manual), `Sheet` (drawer mobile de
  check-in), `Popover`, `Select`, `Tabs`, `Tooltip`, `Calendar` (date picker do backfill),
  `Sonner` (toast, substitui o `showSnackbar`), `Alert Dialog` (confirmar recaída/delete).
- Componentes que **não** valem: `Card`, `Button`, `Badge`, `Input`, `Progress` — já existem no
  ultimate-backlog em versão mais bonita e são triviais. Portar de lá.

---

## 4. Telas

### 4.1 `/` — Base de Operações (Home)

Camadas, de trás para frente:

1. **Wallpaper** — `position: fixed`, `object-fit: cover`.
   `object-position: 22% center` no mobile (mantém o rosto no enquadramento vertical),
   `center` no desktop. Convertido para `.webp` + versão 1080px para mobile, `<picture>` com
   `fetchpriority="high"` e um placeholder blur inline (LQIP base64) para não piscar.

   **Registry alternável** (decisão 4): `shared/constants/wallpapers.ts` exporta
   `WALLPAPERS: Wallpaper[]` — `{ id, label, src, srcMobile, objectPosition, veilOpacity }`.
   Hoje tem uma entrada (o poster do Leon). O perfil tem um seletor, e a escolha vive no
   `ui-slice` do Zustand com `persist` no localStorage. Adicionar arte no futuro = uma linha
   no array + o arquivo em `src/assets/wallpapers/`. `veilOpacity` por wallpaper porque arte
   clara e arte escura pedem véus diferentes.
2. **Véu** — `rgba(0,0,0,0.72)` uniforme + gradiente `to top` de `#0a0a0a` na base, para o
   conteúdo "nascer" do preto. Grão CRT por cima.
3. **Conteúdo**.

Conteúdo (mobile-first, empilhado; desktop em grid 12 col):

- **Header do agente** — `AGENTE: <nome>` · `DIAS EM OPERAÇÃO: N` (desde `profile.start_date`).
- **Streak principal** — número gigante em `Deltha`, dias limpos, com barra segmentada e o
  recorde pessoal ao lado (`RECORDE: 47`).
- **Frase do Leon** — uma linha, estilo transmissão de rádio, com typewriter na entrada.
  Determinística por data (`hash(YYYY-MM-DD) % n`), então não pisca a cada re-render.
- **Grid de StatCards** — 2 col mobile / 4 col desktop:
  dias limpos · meditação (últimos 30d) · leitura (dias + páginas) · km na semana ·
  treinos na semana · último PR.
- **Check-in rápido** — 5 toggles grandes na *thumb zone* (parte inferior no mobile).
  Um toque marca o dia. Feedback: flash + som (Web Audio, portado de `shared/lib/sounds.ts`).
- **Slider de frases** (**Swiper**) — canto **inferior direito** no desktop (fora do rosto do Leon,
  que fica à esquerda na imagem); no mobile vira faixa full-width logo abaixo do streak.

  ```
  modules:    [Autoplay, EffectFade, Pagination, A11y, Keyboard]
  effect:     'fade'  (fadeEffect.crossFade: true)
  autoplay:   { delay: 9000, disableOnInteraction: false, pauseOnMouseEnter: true }
  loop:       true
  speed:      700
  pagination: { clickable: true }   // bullets re-estilizados: traços 12×2px, ativo branco+glow
  keyboard:   { enabled: true, onlyInViewport: true }
  a11y:       { prevSlideMessage: 'Frase anterior', nextSlideMessage: 'Próxima frase' }
  ```

  - Swipe no mobile vem de graça; setas ficam de fora (só paginação por traços).
  - `prefers-reduced-motion` → `autoplay={false}` e `effect="slide"` com `speed: 0`; o usuário
    navega manualmente pelos bullets. Detectado via `use-media-query`.
  - Import de CSS: `swiper/css`, `swiper/css/effect-fade`, `swiper/css/pagination` — os estilos
    default são sobrescritos em `index.css` (variáveis `--swiper-pagination-*` apontando para os
    tokens do tema; nada de azul `#007aff` do Swiper vazando).
  - `<Swiper>` fica em `features/home/components/QuoteSlider.tsx`, com as frases vindo de
    `shared/constants/quotes.ts` embaralhadas uma vez por sessão (`useMemo`), não a cada render.

### 4.2 `/check-in` — Registro Diário

Coração do app. Uma tela, um dia por vez, navegável (`< ontem | hoje | amanhã >`).

- 5 linhas de hábito: **Contenção (no-PMO)** · **Meditação** · **Leitura** · **Corrida** · **Treino**.
- Cada uma: toggle + campo opcional + nota.
  Meditação → **minutos** · Leitura → **páginas** (decisão 3) · Corrida → **km** · Treino → **minutos**.
- **Contenção** tem 3 estados, não 2: `limpo` · `recaída` · `sem registro`. Marcar recaída abre
  um `AlertDialog` sóbrio (sem julgamento, com campo de gatilho — vira dado no relatório).
- **Backfill**: date picker permite registrar dias passados. Dias sem registro aparecem como gap
  cinza no heatmap, nunca como falha.
- Corrida e Treino aqui são só o *toggle*; o detalhe vai nas telas próprias (e um trigger no
  Postgres marca o hábito automaticamente quando você registra a corrida/treino — sem entrada dupla).

### 4.3 `/running` — Registro de Corridas

- Form: data, distância (km), duração, percurso, sensação (1–5), nota.
- Cálculo automático de **pace** (min/km) e exibição do delta vs. média dos últimos 5.
- Lista de corridas (cards no estilo `game-card`, com hover trailing-dot).
- Gráficos: km/semana (barra), pace ao longo do tempo (linha, eixo Y invertido — menor é melhor),
  acumulado do mês (área).
- **Piso de 5 km/semana** (decisão 2): não é meta, é linha de corte. A barra da semana mostra
  km percorridos com um marcador fixo em 5 km; abaixo dele o rótulo é `ABAIXO DO MÍNIMO` em
  âmbar, acima vira branco. Sem gamificação, sem parabéns — só o fato.
- Números que importam: **km totais** e **nº de dias corridos** no período. Nada de "meta batida".

### 4.4 `/gym` — Treino e Progressão de Carga

Isto é a parte com mais estrutura de dados. Modelo: treino → séries → exercício.

- **Registrar treino**: data, split (Push/Pull/Legs/etc.), duração, RPE geral.
- **Séries**: por exercício, `carga × reps` por série. Autocomplete de exercícios já usados;
  ao selecionar, o app pré-preenche com a última sessão daquele exercício ("bater ou superar").
- **Detecção de PR**: ao salvar, compara `e1RM` (Epley: `carga × (1 + reps/30)`) com o histórico.
  PR novo → flash verde + toast + entrada no log de PRs.
- **Página do exercício**: gráfico de e1RM ao longo do tempo, volume total (carga×reps) por sessão,
  tabela de histórico. É o "diário de verificação de aumento de peso e repetições" pedido.

### 4.5 `/reports` — Estatísticas

- **Heatmap anual** (estilo GitHub) por hábito, com seletor. Célula = intensidade do dia.
- **Consistência**: % de dias cumpridos por hábito, últimos 30/90/365 dias (radial bar).
- **Streaks**: atual e recorde de cada hábito.
- **Correlações leves**: ex. distribuição de recaídas por dia da semana; treino vs. meditação.
  Sem pseudociência — só contagem descritiva, rotulada como tal.
- Filtro de período global (30d / 90d / ano / tudo).

### 4.6 `/profile` — Configurações

Nome, avatar, `start_date` da operação, toggle CRT, toggle som, toggle wallpaper, export
JSON/CSV dos dados, logout.

---

## 5. Navegação

**Navigation rail** (desktop ≥769px): 60px → 200px no hover, `cubic-bezier(.4,0,.2,1) 300ms`,
CSS puro com seletor irmão (`#rail:hover ~ #main`), exatamente como no ultimate-backlog.

Melhorias sobre o original:
- Expande também em **`:focus-within`** (o repo original só faz hover → rail inacessível por teclado).
- Hover-expand só dentro de `@media (hover: hover)` — evita o rail travar aberto em touch híbrido.
- `prefers-reduced-motion` → sem transição de largura.
- Item ativo: borda direita branca + `text-white` + glow sutil (era vermelho).

**Rotas em inglês, labels em pt-BR** — o path é código, o texto é interface:

| Rota | Label na UI | Feature | No bottom nav |
|---|---|---|---|
| `/` | Base | `home` | sim |
| `/check-in` | Check-in | `checkin` | sim |
| `/gym` | Academia | `gym` | sim |
| `/running` | Corrida | `running` | sim |
| `/reports` | Relatório | `reports` | sim |
| `/profile` | Perfil | `profile` | não — header mobile |
| `/auth` | — | `auth` | rota pública |

**Bottom nav** (mobile <769px): 5 itens + `env(safe-area-inset-bottom)`.

Ordem no rail: Base · Check-in · Academia · Corrida · Relatório · (spacer) · CRT · Perfil · Sair.

---

## 6. Banco de dados (Supabase)

RLS ativo em **todas** as tabelas, policy `auth.uid() = user_id`. Dados sensíveis — nunca
service key no client, nunca tabela pública.

```sql
profiles (id uuid pk → auth.users, username, display_name, avatar_url,
          start_date date, settings jsonb, created_at, updated_at)

habit_logs (id, user_id, habit_key text, log_date date, done boolean,
            value numeric, note text, created_at, updated_at,
            UNIQUE(user_id, habit_key, log_date))
  -- habit_key CHECK IN ('no_pmo','meditation','reading','running','training')
  -- value: minutos meditados | páginas lidas | km | minutos de treino
  -- no_pmo: done=false é recaída explícita (registrada, não inferida)

relapse_notes (id, user_id, log_date, trigger text, note text)   -- opcional, 1:1 com no_pmo done=false

runs (id, user_id, run_date date, distance_km numeric(6,2), duration_min int,
      route text, feeling smallint, note text)

exercises (id, user_id, name text, muscle_group text, UNIQUE(user_id, lower(name)))

workouts (id, user_id, workout_date date, split text, duration_min int,
          rpe smallint, note text)

workout_sets (id, workout_id fk, exercise_id fk, set_index int,
              weight_kg numeric(6,2), reps int, rpe smallint, is_warmup bool)

personal_records (id, user_id, exercise_id, achieved_on date,
                  weight_kg, reps, e1rm numeric)
```

**Decisão**: uma tabela `habit_logs` genérica em vez de cinco tabelas. Labels, ícones e cores
ficam em `shared/constants` (tipados), não no banco. Menos migração, mesma tipagem.

**Triggers**:
- `runs` INSERT/DELETE → upsert/delete em `habit_logs('running', run_date)` com `value = distance_km`.
- `workouts` INSERT/DELETE → idem para `training`.
- `workout_sets` INSERT → recalcula `personal_records` do exercício.
- `updated_at` automático em tudo.

**Streaks**: calculados no client com `date-fns` (volume de dados é pequeno, cabe em cache do
Query e evita round-trip). Se passar de ~3 anos de dados, vira uma view materializada.

**Gotcha de fuso**: colunas são `date`, não `timestamptz`. Gerar a string do dia sempre com
`format(new Date(), 'yyyy-MM-dd')` do date-fns — **nunca** `toISOString().slice(0,10)`, que
retorna o dia errado depois das 21h no fuso de Brasília.

### 6.1 Projeto Supabase

```
Project ref:  sfaedcyombrnynnpkjei
URL:          https://sfaedcyombrnynnpkjei.supabase.co
JWKS:         https://sfaedcyombrnynnpkjei.supabase.co/auth/v1/.well-known/jwks.json
```

### 6.2 Variáveis de ambiente

Duas metades, e a separação **não é estilística — é de segurança**. O Vite injeta no bundle
qualquer variável prefixada com `VITE_`, e só essas. Tudo que leva `VITE_` vira texto legível
no JS que o navegador baixa.

**`.env` — client (Vite / React)**

```bash
VITE_SUPABASE_URL=https://sfaedcyombrnynnpkjei.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_vK1HFoVHGGfeT8ncIdtnlg_DNpLZSA8
```

A chave *publishable* é feita para ser pública — ela não dá acesso a nada por si só, quem
protege os dados é a RLS. Por isso ela pode levar o prefixo `VITE_`.

**`.env` — server (nunca prefixado com `VITE_`)**

```bash
SUPABASE_URL=https://sfaedcyombrnynnpkjei.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_vK1HFoVHGGfeT8ncIdtnlg_DNpLZSA8
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxxxxxxxxxxxxxx   # valor real so em supabase/.env
SUPABASE_JWKS_URL=https://sfaedcyombrnynnpkjei.supabase.co/auth/v1/.well-known/jwks.json
```

> ⚠️ **`SUPABASE_SECRET_KEY` ignora RLS por completo.** Quem tem essa chave lê e escreve
> qualquer linha de qualquer usuário. Ela **nunca** pode aparecer com prefixo `VITE_`, nunca
> pode ser importada de dentro de `src/`, e nunca vai para o repositório.

**Higiene:**
- `.gitignore` com `.env`, `.env.local`, `.env.*.local` — **antes** do primeiro commit.
- `.env.example` versionado, com placeholders (`sb_publishable_xxx`), nunca com valor real.
- Essa `secret key` já circulou fora do cofre (chat). Antes de qualquer deploy público,
  rotacionar em *Dashboard → Settings → API Keys → Rotate*. Em dev local, tudo bem.
- `SUPABASE_JWKS_URL` é público por natureza (é o endpoint de chaves públicas usado para
  verificar assinatura de JWT) — está no `.env` só por conveniência de configuração.

### 6.3 Camada server — `@supabase/server`

```bash
npm install @supabase/server          # v1.4.1
npx skills add supabase/agent-skills --skill supabase-server
```

> A forma curta `npx skills add supabase/server` também resolve; o pacote canônico é
> `supabase/agent-skills` e o skill dentro dele se chama `supabase-server`.
> Instala em escopo de projeto por padrão (fica em `.claude/skills/`, versionado);
> `--global` instala para todos os projetos, `--all` cobre todos os agentes detectados.

**O que esse pacote faz:** cria o client Supabase no servidor e injeta o contexto de auth,
verificando o JWT do usuário contra o **JWKS** (assinatura assimétrica, sem round-trip ao
Supabase a cada request). É exatamente o par das duas variáveis server acima.

**Implicação arquitetural — precisa da sua decisão.** O plano hoje descreve um SPA puro que
fala direto com o Supabase e é protegido só por RLS. Nesse desenho não existe servidor, e
`@supabase/server` / `SECRET_KEY` / `JWKS` não têm onde rodar. Adotá-los significa acrescentar
uma camada backend. Duas formas:

- **A — Edge Functions do Supabase** *(recomendado)*: sem infra nova, sem deploy separado,
  já vive dentro do projeto que você tem. Serve bem para o que de fato precisa de servidor:
  recálculo pesado de streaks/PRs, export de dados, seed/migração, e futuros cron jobs
  (ex. lembrete de check-in).
- **B — API própria com Hono** (`apps/api`, o caso de uso principal do `@supabase/server`):
  monorepo com `apps/web` + `apps/api`. Mais controle e mais lugar para lógica de negócio,
  ao custo de mais um deploy e mais uma superfície para manter.

Em ambos os casos o CRUD do dia a dia continua indo direto do client para o Supabase via RLS —
o servidor entra só onde ele agrega algo. Botar tudo atrás da API só adiciona latência e
elimina o optimistic update do TanStack Query, que é o que faz o check-in parecer instantâneo.

---

## 7. Frases

Duas coleções separadas, ambas em `shared/constants/quotes.ts`:

1. **`LEON_LINES`** — falas do Leon (RE4 / RE4 Remake / RE2), curtas, usadas na home. Mistura de
   canônicas e de "rádio de missão" escritas para o app (marcadas como tal, sem atribuir falsamente).
2. **`FIELD_QUOTES`** — o slider. ~30 frases sobre resistência mental, disciplina e sair do buraco.

Sobre o Goggins: as ideias centrais dele são **calejar a mente pelo desconforto**, o
**espelho da responsabilidade** (encarar o próprio reflexo e dizer a verdade), a **regra dos 40%**
(quando a mente diz "acabou", você está em 40%) e o desprezo pela motivação como combustível.
Vou usar frases dele **atribuídas corretamente** e frases originais **sem atribuição** — nada de
inventar citação e colar o nome dele embaixo. As batidas ("não pare quando cansar, pare quando
terminar") ficam de fora por pedido explícito.

Amostra do tom pretendido:

```
"A motivação é uma merda. Ela vem e vai. Disciplina é o que sobra às 5h da manhã."   — Goggins
"Ninguém vem te salvar. Essa é a má e a boa notícia."
"Depressão não negocia. Você não vence discutindo, vence levantando."
"O espelho não aceita desculpa. Ele só mostra o que você fez ontem."                 — Goggins (Accountability Mirror)
"Quando a sua cabeça diz que acabou, você está em 40%."                              — Goggins (regra dos 40%)
"Dia ruim registrado ainda é dia registrado. Sumir é a única derrota real."
```

Fontes consultadas: [Goodreads — David Goggins](https://www.goodreads.com/author/quotes/17977069.David_Goggins) ·
[Survived Nation — Forging Mental Resilience](https://survivednation.com/mindset/forging-mental-resilience-insights-from-david-goggins-quotes/) ·
[CBR — Leon's best quotes in RE4 Remake](https://www.cbr.com/resident-evil-4-remake-leon-best-quotes/) ·
[Screen Rant — greatest Leon Kennedy quote](https://screenrant.com/resident-evil-leon-kennedy-greatest-quote/)

---

## 8. Estrutura de pastas

Mesma arquitetura feature-based do ultimate-backlog (você já conhece, e o CLAUDE.md de lá vira
base do CLAUDE.md daqui):

```
src/
  main.tsx
  index.css                      # @theme + todos os efeitos CSS
  app/  App.tsx · providers.tsx · router.tsx
  shared/
    lib/          supabase · query-client · sounds · utils · streaks · date
    types/        database.types.ts
    constants/    habits.ts · quotes.ts · colors.ts
    store/        ui-slice.ts
    hooks/        use-sound · use-crt · use-boot-up · use-page-transition · use-media-query
    components/
      ui/         (portados do UB + wrappers shadcn)
      layout/     AppLayout · NavRail · BottomNav · PageHeader · CRTVignette
  features/
    home/ · checkin/ · running/ · gym/ · reports/ · profile/
```

(`auth/` só entra quando a decisão 1 mudar — ver §10.)

---

## 9. Fases de implementação

| # | Fase | Entrega |
|---|---|---|
| 0 | **Scaffold** | Vite+React+TS, Tailwind v4, alias `@`, ESLint, shadcn init (`radius: 0`) |
| 1 | **Tema** | `index.css` completo: tokens brancos, todos os efeitos CRT/glitch portados |
| 2 | **Supabase** | `.gitignore` + `.env` + `.env.example` (§6.2), SQL de todas as tabelas + RLS + triggers, `database.types.ts`, client tipado, `npm i @supabase/server`, `npx skills add`, `SUPABASE_SETUP.md` |
| 3 | **Shell** | Boot screen, AppLayout, NavRail com focus-within, BottomNav, router (sem auth — §10) |
| 4 | **Check-in** | Feature completa de hábitos: queries, mutations, optimistic update, backfill, recaída |
| 5 | **Corrida** | CRUD, pace, cards, gráficos |
| 6 | **Academia** | Exercícios, treinos, séries, detecção de PR, página do exercício |
| 7 | **Home** | Wallpaper otimizado, véu, hero, StatCards, slider de frases, frase do Leon, quick check-in |
| 8 | **Relatório** | Heatmap, consistência, streaks, correlações |
| 9 | **Polimento** | A11y (foco visível, `aria-live` nos toasts, contraste AA), `prefers-reduced-motion` em tudo, skeletons, empty states, PWA + ícone, export de dados |

Fases 4–6 são independentes entre si — podem sair em qualquer ordem. A 7 depende de 4/5/6
existirem para ter o que resumir.

---

## 10. Decisões — RESOLVIDAS

| # | Tema | Decisão |
|---|---|---|
| 0 | Camada server | **Edge Functions** do Supabase. Repo single-app, sem monorepo. |
| 1 | Auth | **Sem auth por enquanto** — modo operador único. Ver §10.1. |
| 2 | Metas | Corrida **sem meta rígida**; só total de km e nº de dias. Mas **5 km/semana é o piso** — a UI mostra "MÍNIMO" e não "meta". Treino sem meta. |
| 3 | Leitura | Por **páginas**. Sem tabela `books` agora (`habit_logs.value` = páginas). |
| 4 | Wallpaper | Registry de wallpapers desde já (`WALLPAPERS[]` + seletor no perfil), começando com a arte do Leon. Trocar de arte no futuro = uma linha no array. |
| 5 | Nome | `project-better-self` no `package.json`; **OPERATION: BETTER SELF** visível, sigla **OBS** no rail. |

### 10.1 Modo operador único (sem auth)

Sem `auth.uid()`, não existe dono da linha. Implementação escolhida para não travar o futuro:

- Toda tabela **mantém a coluna `user_id`**, com `DEFAULT` num UUID constante
  (`00000000-0000-0000-0000-000000000001`, o "operador local"), exportado como `LOCAL_USER_ID`
  em `shared/constants`.
- RLS **fica ativa**, com policy permissiva para `anon` — explícita e fácil de trocar depois.
- O client nunca escreve `user_id` na mão: passa por `getUserId()` em `shared/lib/user.ts`,
  que hoje devolve a constante e amanhã devolve `session.user.id`.
- Ligar auth depois = trocar essa função + rodar `002_enable_auth.sql` (troca as policies
  por `auth.uid() = user_id`). Zero migração de dados, zero mudança nas features.

> ⚠️ **Enquanto não houver auth, o app é para rodar local (`npm run dev`).** A publishable key
> vai no bundle, então qualquer pessoa com a URL de um deploy público conseguiria ler e escrever
> essa base — e o dado aqui é o mais pessoal possível. Deploy público só depois da decisão 1 virar
> "com auth". Isso está anotado no `SUPABASE_SETUP.md` também.

---

## 11. Desvios do plano durante a implementação

O que foi construído diferente do que está escrito acima, e por quê.

| Onde | Plano | Implementado | Motivo |
|---|---|---|---|
| §6 schema | Tabela `relapse_notes` separada | Coluna `relapse_trigger` em `habit_logs` | Relação 1:1 com a própria linha do hábito; a tabela extra só somaria um join para guardar um campo de texto |
| §3.4 shadcn | Primitivos **Radix** | shadcn v4 resolveu para o estilo `base-nova`, que usa **@base-ui/react** | Foi o que o CLI instalou. Base UI é headless igual e a lista de primitivos usada (`Dialog`, `AlertDialog`) é a mesma; o visual é reescrito de qualquer forma |
| §3.2 texto | `#b9b9b9` / `#6e6e6e` / `#444` | `#cfcfcf` / `#949494` / `#7d7d7d` | Os valores originais reprovavam em contraste: rótulos de 9–10px em maiúscula sobre o wallpaper ficavam ilegíveis. O accent continua separado por ser `#fff` puro + glow, não por ser "mais claro" |
| §4.5 gráficos | Radial bar de consistência (5 séries) | Small multiples: uma barra por hábito, todas brancas, rótulo direto | Paleta categórica de 5 tons brigaria com o sistema de um accent só e ainda exigiria validação de daltonismo. Identidade por rótulo é mais legível aqui |
| §4.5 heatmap | Ano inteiro (52 semanas) | 27 semanas (~6 meses) | 52 colunas no mobile viram células de 3px: não dá para tocar nem ler |
| §4.1 véu | Uma opacidade por wallpaper | Uma por breakpoint (`veilOpacity` + `veilOpacityMobile`) | O recorte mobile é um close com céu claro atrás, bem mais claro que a panorâmica — a mesma opacidade não serve nos dois |
| §5 rail | Expande em `:focus-within` | `#rail:has(:focus-visible)` | `:focus-within` também dispara com clique de mouse, e o rail ficava travado aberto depois de navegar |
| — | (não previsto) | `networkMode: 'always'` no QueryClient | No padrão `'online'`, query que falha fica em `fetchStatus: 'paused'` com `status: 'pending'` — spinner eterno em vez de erro na tela |
| — | (não previsto) | Rotas com gráfico são `lazy` no router | Recharts sozinho é ~358kB; sem split ia tudo no bundle inicial |
| §9 fase 9 | PWA + service worker | **Não feito** | Fora do mínimo útil enquanto o app só roda local. O export JSON do perfil foi entregue |

### Verificação — o que foi e o que não foi testado

Rodado e limpo: `npm run build` (tsc + vite), `npm run lint` (0 erros, 1 warning de fast-refresh
esperado no `Snackbar`).

Verificado no browser: home, check-in, relatório (heatmap, consistência), academia; rail
expandindo no hover e recolhendo após o clique; breakpoint mobile em 410px (rail some, bottom nav
aparece, sem overflow horizontal); Swiper com autoplay e wrap correto.

**Não verificado**: qualquer caminho que dependa de dados reais — gravar check-in, corrida,
treino, detecção de PR, triggers de sincronia. A migração `0001_init.sql` ainda não foi aplicada
(DDL não passa pela API do PostgREST), então as telas foram inspecionadas com dados injetados no
cache do TanStack Query, não vindos do banco.
