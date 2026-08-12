# OPERATION: BETTER SELF

Terminal de disciplina pessoal. Estetica CRT/cyberpunk com tema Leon S. Kennedy (Resident Evil 4).

Registra e acompanha: **contencao** (sem pornografia/masturbacao), **meditacao**, **leitura**,
**corrida** (km e pace) e **academia** (carga, repeticoes e progressao de 1RM estimado).

---

## Comecando

```bash
npm install
node scripts/optimize-wallpapers.mjs   # so se adicionar arte nova
npm run dev
```

**Antes do primeiro uso**, rode a migracao — o app nao funciona sem ela:
cole `supabase/migrations/0001_init.sql` no SQL Editor do Supabase e execute.
Passo a passo em [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md).

> ⚠️ O app roda **sem autenticacao** por enquanto (modo operador unico).
> Use apenas local. Nao publique antes de ligar a auth — os dados sao pessoais e
> a base so esta protegida por uma policy permissiva. Detalhes em `PLAN.md` secao 10.1.

---

## Telas

| Rota | O que faz |
|---|---|
| `/` | Wallpaper do Leon, streak de contencao, resumo de tudo, frase do Leon do dia, slider de frases de resistencia mental, check-in rapido |
| `/check-in` | Registro diario dos 5 habitos, um dia por vez, com backfill de dias passados |
| `/gym` | Treinos, series (carga x reps), exercicios e recordes; deteccao automatica de PR |
| `/gym/exercise/:id` | Progressao de carga de um exercicio: e1RM e volume por sessao |
| `/running` | Corridas com pace, km por semana e o piso de 5 km/semana |
| `/reports` | Heatmap anual, consistencia por habito, streaks e recaidas por dia da semana |
| `/profile` | Nome, inicio da operacao, CRT/som/wallpaper, export JSON |

---

## Como algumas coisas funcionam

**Contencao tem tres estados, nao dois.** `limpo`, `recaida` e `sem registro`. Dia sem marcacao
nunca conta como falha — se contasse, esquecer de abrir o app viraria uma recaida falsa e o numero
deixaria de significar qualquer coisa. Marcar recaida pede confirmacao (e o unico registro que
zera um contador) e aceita um gatilho opcional, que vira estatistica no relatorio.

**Corrida e treino nao sao digitados duas vezes.** Voce registra a sessao na tela propria e um
trigger no Postgres marca o habito daquele dia sozinho, com a distancia/duracao somada.

**Recorde de academia e calculado no banco.** `workout_sets.e1rm` e uma coluna gerada com a
formula de Epley, entao o grafico de progressao e a deteccao de PR nunca discordam da UI.

**Piso de corrida, nao meta.** 5 km por semana aparece como linha de corte na barra — abaixo dela
o rotulo fica ambar. Sem gamificacao e sem parabens: so o fato.

**As frases sao atribuidas com honestidade.** Frase com autor e frase que a pessoa realmente
disse. Frase escrita para o app vai sem autor. Nao existe citacao inventada com nome real embaixo.

---

## Stack

React 19 · Vite 8 · TypeScript · Tailwind v4 · shadcn/Base UI · TanStack Query v5 ·
Zustand · React Router 7 · Recharts · Swiper · lucide-react · date-fns · Supabase

Documentacao interna: [`CLAUDE.md`](./CLAUDE.md) (convencoes e gotchas) ·
[`PLAN.md`](./PLAN.md) (decisoes de projeto) · [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md).
