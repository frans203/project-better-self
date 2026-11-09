# OPERATION: BETTER SELF — Plano SaaS

> Documento de planejamento. **Nada aqui está implementado.** Objetivo: transformar o tracker
> pessoal num produto rentável sem perder a estética e a arquitetura atuais.
>
> Escopo: (1) pesquisa de mercado e diferencial, (2) público-alvo, (3) planos por arquétipo e
> freemium, (4) API em NestJS com adapters (banco e gateway), (5) gateway AbacatePay,
> (6) backup e portabilidade de dados, (7) página inicial (landing), (8) ordem de execução.
>
> Pesquisa feita em nov/2026. Preços de concorrentes vêm de listagens de loja e blogs de
> comparação — conferir antes de usar como âncora final.

---

## 0. Propriedade intelectual — decisão: risco assumido na fase de tração ⚠️

**Decisão (nov/2026):** na fase de tração (até ~6 meses / ~200–500 usuários) os arquétipos
**usam os personagens** como chamariz, sabendo do risco. A troca para arquétipos originais
(abaixo) é planejada desde já e acontece num gatilho combinado.

**Leitura do risco nessa escala:** processo é improvável — Sony/Capcom agem sobre o que é
visível (loja de app, anúncio pago, produto físico). Os riscos reais são de **plataforma**:
1. **Gateway** — termos de gateway costumam proibir venda de produto que infringe IP; denúncia
   ou chargeback pode suspender a conta e travar o caixa. É o risco nº 1.
2. **Takedown de post viral** (DMCA no TikTok/Instagram) e anúncio reprovado no Meta Ads — e
   viralizar é exatamente o objetivo.
3. **Custo de troca cresce com o tempo** — quem pagou o "Kratos" sente a troca.

**Guardrails obrigatórios enquanto durar:**
- **Zero arte oficial** (render, screenshot, logo). Só fan art encomendada com estilo próprio.
  Arte é o que robô de DMCA detecta e é a infração mais clara.
- **Nome do personagem só na vitrine, nunca no pagamento.** Produto no gateway, nota e e-mail
  de cobrança usam o codinome original ("OBS Pro — Arquétipo Espartano"). O `plan_id` também.
- **"Inspirado em"**, nunca "Plano Kratos oficial"; rodapé com aviso de que não há afiliação.
- **Sem frases literais dos jogos** no produto pago.
- **Troca em uma linha:** registro único `ARCHETYPES` (no padrão do `WALLPAPERS`) com
  `codename` (original, permanente) e `showcaseName` (personagem, temporário). Código, banco e
  gateway só conhecem `codename`; a UI lê `showcaseName ?? codename`.

**Gatilhos de troca (qualquer um):** primeira notificação/takedown · 500 usuários · publicar em
App Store/Play Store · começar mídia paga em escala · parceria/patrocínio.

### 0.1 Contexto do risco (referência)

Os personagens e seus donos:

| Personagem | Dono da IP |
|---|---|
| Kratos | Sony Interactive Entertainment (Santa Monica Studio) |
| Joel | Sony Interactive Entertainment (Naughty Dog) |
| Chris Redfield, Leon S. Kennedy | Capcom |
| Dante, Nero | Capcom |

Vender assinatura com o nome/imagem de personagem de terceiro é uso comercial de marca e de
obra protegida. Consequências práticas: notificação extrajudicial, remoção do app das lojas,
bloqueio da conta do gateway de pagamento (gateways derrubam conta por denúncia de infração) e
perda de tudo que foi investido em marketing em cima do nome. O único concorrente que fez isso
direito — **Marvel Move** — é uma colaboração oficial e licenciada entre a Marvel e a Six to Start
(criadora do Zombies, Run!). Licenciar Sony/Capcom não é realista neste estágio.

**Wallpaper do Leon:** é arte oficial — pelo guardrail acima, troca por fan art antes da primeira
cobrança, mesmo mantendo o Leon como vitrine.

### 0.2 Destino final — arquétipos originais (para o gatilho de troca) O que o público ama nesses personagens não é o nome, é o
**arquétipo**: o guerreiro movido a fúria que aprende disciplina, o sobrevivente que segue andando,
o soldado que se reconstrói, o caçador com estilo, o herdeiro que está começando. Arquétipos não
têm dono. A proposta abaixo cria personagens/codinomes **próprios**, com arte encomendada, que
um gamer reconhece pela *vibe* sem que exista nenhuma referência direta:

- Sem nomes, sem silhuetas copiadas, sem armas/símbolos característicos (Lâminas do Caos,
  Rebellion, emblema da S.T.A.R.S./BSAA, etc.), sem frases dos jogos.
- Arte original (commissionada, com cessão de direitos por contrato).
- Copy de marketing fala do **gênero** ("quem zerou soulslike no modo difícil"), não de título.

Isso também vira **ativo**: a IP dos arquétipos passa a ser da empresa — dá pra fazer camiseta,
adesivo, skin, temporada. Com personagem dos outros, nada disso seria possível.

---

## 1. Público-alvo

**O "nerd forte".** Homem (majoritariamente), 18–35 anos, gamer/geek/otaku, que treina ou quer
treinar musculação de verdade e trata a própria evolução como uma build de personagem.

- Cresceu jogando RE, God of War, The Last of Us, DMC, soulslike; consome anime de progressão
  (Solo Leveling, Baki, Vagabond). Entende *nível*, *rank*, *grind*, *build*, *streak*.
- Já usou Hevy/Strong (funcionais e sem alma) ou apps "estilo Solo Leveling" (bonitos e rasos).
- Quer **disciplina como um todo**, não só treino: largar pornografia, ler, meditar, correr.
  Muitos vêm da comunidade NoFap/"monk mode"/"self-improvement".
- Rejeita estética fitness genérica (gradiente laranja, foto de modelo sem camisa, emoji 💪).
- Brasileiro: paga em **PIX**, sensível a preço em real, desconfia de assinatura em dólar.

**Tom de voz:** seco, militar, terminal. Sem "parabéns!!", sem coach motivacional. Honesto —
o app já não conta dia sem registro como falha e não inventa citação; isso é um diferencial
de confiança, não detalhe.

---

## 2. Pesquisa de mercado

### 2.1 Concorrentes

| App | O que é | Preço (aprox.) | Ponto forte | Ponto fraco p/ nosso público |
|---|---|---|---|---|
| **Habitica** | Lista de tarefas/hábitos virando RPG pixel-art | Grátis; ~US$ 4,99/mês ou US$ 47,99/ano (cosméticos + gemas) | Gamificação completa no grátis; comunidade, party, quests | Não é app de treino. Sem carga, sem 1RM, sem corrida. Estética infantil |
| **Nerd Fitness Journey** | O mais próximo do conceito "nerd forte": avatar, XP, "escolha sua aventura" | Prime ~US$ 38,99/tri ou US$ 98,99/ano | Marca forte de nicho (Nerd Fitness) | Pequeno (estimativas de ~1–2 mil MAU), só inglês, treino guiado raso, sem tracking sério de carga |
| **Arise** e clones "Solo Leveling" (Solo Level: System, Solo Hunter, Level-UP) | "Sistema" de anime: quests diárias, rank E→S | Arise: paywall obrigatório (~US$ 15–30); clones grátis c/ IAP | Arise tem 4,8★ com ~9,7 mil avaliações — prova que o tema vende | Focado em calistenia/quest diária. Sem progressão de carga real. Vários clones usam IP de Solo Leveling sem licença (risco que não queremos) |
| **Hevy** | Tracker de academia | Grátis generoso; Pro ~US$ 2,99/mês, US$ 23,99/ano, US$ 74,99 vitalício | Logging ilimitado no grátis; social; referência de UX | Zero identidade. Não cobre hábitos fora da academia |
| **Strong** | Tracker de academia | PRO ~US$ 4,99/mês, US$ 29,99/ano, US$ 99,99 vitalício | Simples e confiável | Mesmo problema: planilha bonita, sem narrativa |
| **GymBros** (BR) | Academia "à la Duolingo": streak, ranking, moedas, grupos | Premium ~R$ 7/mês ou R$ 60/ano | Brasileiro, preço em real, social | Público geral, não nerd. Estética Duolingo |
| **Marvel Move** | Treino em áudio com história Marvel | Assinatura (licenciado) | Mostra que "treinar como personagem" tem demanda | Áudio/corrida; IP licenciada inacessível para nós |

### 2.2 O que ninguém faz (nosso espaço)

Ninguém junta as quatro coisas abaixo no mesmo produto:

1. **Tracking sério de força** — e1RM calculado no banco, detecção de PR, volume, WOD separado
   da academia. Os apps "Solo Leveling" não têm; Hevy/Strong têm mas sem alma.
2. **Disciplina holística** — contenção, meditação, leitura, corrida e força num **único nível**
   que cai com recaída. Habitica é genérico demais; trackers de academia ignoram o resto.
3. **Identidade por arquétipo** — o plano não é "Pro vs Free", é **quem você está treinando para
   ser**. Cada arquétipo muda protocolo, régua de rank, frases, arte e som. Nenhum concorrente
   vende identidade; vendem features.
4. **Estética própria e honesta** — terminal/CRT, monocromático, sem gamificação falsa. Rank
   que pode **cair** (LIXO existe). Isso é raro e é o que o público hardcore respeita.

E dois pontos táticos: **pt-BR nativo** (os bons do nicho são todos em inglês) e **PIX** (nenhum
app gringo do nicho cobra em real via PIX).

---

## 3. Arquétipos (planos de personagem)

Cada arquétipo é um **pacote de identidade + protocolo**:

- **Protocolo**: templates de treino e as metas que ele propõe.
- **Régua de rank**: pesos diferentes das métricas que já existem em `shared/lib/rank.ts`
  (`volume`, `reps`, `wod`, `km`, `pace`, `meditation`, `reading`, `containment`). O motor de nível
  já é derivado e parametrizável — arquétipo = outra tabela de thresholds, sem migração.
- **Pele**: wallpaper, frases do dia, cor do glow secundário (o accent continua branco), sons
  do boot e do check-in, título do rank ("SOLDADO" vira o equivalente do arquétipo).

O **codinome** é o identificador permanente (código, banco, gateway). O **nome de vitrine** é o
personagem, usado só na UI/landing durante a fase de tração (§0) e removido no gatilho de troca.

| Codinome | Vitrine (temporária) | Fantasia | Protocolo | Métricas com mais peso |
|---|---|---|---|---|
| **OPERADOR** | Chris / Leon | Híbrido tático: força + condicionamento | Força 3x/sem + 1–2 WODs + piso de corrida (é o app de hoje) | `reps`, `wod`, `km` equilibrados |
| **ESPARTANO** (ou BERSERKER) | Kratos | Força bruta. A fúria vira disciplina | Baixas reps, cargas pesadas, básicos (agacho/terra/supino/desenvolvimento), estilo 5x5 → 5/3/1 | `volume`, e1RM dos básicos; `containment` como "controle da fúria" |
| **SOBREVIVENTE** | Joel | Resistência. Continuar andando | Corrida/caminhada com carga (ruck), calistenia, treino funcional curto; dias "de escassez" com treino mínimo | `km`, `pace`, consistência (streak vale mais que intensidade) |
| **CAÇADOR** | Dante | Estilo e técnica | Calistenia de skill (muscle-up, parada de mão, pistol), variedade; ranking de **estilo** por sessão (combo de dias, variedade de movimentos) | `reps`, variedade, `wod` |
| **HERDEIRO** | Nero | O começo. Fundamentos | Plano de entrada: 3x/sem full-body, técnica, progressão linear simples. Régua de rank mais curta e rápida | Consistência; thresholds baixos — porta de entrada |
| **MONGE** (opcional) | — | Mente | Meditação/leitura/contenção como eixo, treino como base | `meditation`, `reading`, `containment` |

**Por que isso vende:** o nerd não compra "gráficos ilimitados". Ele compra **ser o espartano**.
O arquétipo é a resposta para "por que pagar?" — e cada novo arquétipo é um lançamento
de marketing (trailer, arte nova, temporada).

**Contenção como módulo opt-in.** No app pessoal ela é central. No produto, deixar ativável no
onboarding: amplia o público (quem não está nesse tema não se assusta) e quem está encontra o
módulo com destaque. Ver LGPD no §8 — é dado sensível.

---

## 4. Freemium

### 4.1 Modelo

**Hoje (lançamento):** no cadastro o usuário **escolhe um arquétipo** — qualquer um. Esse é o
arquétipo dele no plano grátis. Quem paga o Pro tem **todos**.

**Futuro (quando houver catálogo maior):** o Pro passa a liberar as *features* completas para os
arquétipos que o usuário **possui**; cada arquétipo extra é comprado à parte (avulso ou pacote
"Arsenal"). Quem assinou antes da mudança **mantém todos** (grandfathering — é o benefício de
ter entrado cedo e evita revolta).

Para essa transição não exigir migração, o modelo de dados já nasce com dois tipos de direito
separados em `entitlements`:

```
archetype:<codename>   → pode usar aquele arquétipo     (hoje o Pro concede archetype:*)
feature:<key>          → pode usar aquela feature       (hoje o Pro concede feature:*)
```

No futuro, novos assinantes deixam de receber `archetype:*` e passam a receber só o arquétipo
escolhido + os comprados. Nenhuma tela muda: elas sempre perguntam pelo direito específico.

### 4.2 A jornada do usuário grátis

```
Dia 0 ─────────── Dia 5 ───── Dia 7 ── Dia 8 ─────────────────────────────▶
│ ALISTAMENTO (tudo do arquétipo escolhido) │ RESERVA (núcleo grátis para sempre)
│                  │ avisos amigáveis │     │ convites só em momentos de vitória
```

1. **Alistamento (dias 0–7)** — o arquétipo escolhido funciona **completo**, como Pro:
   protocolo, gráficos sem limite, relatórios todos, personalização. Só os *outros* arquétipos
   ficam na vitrine. Pode **trocar de arquétipo uma vez** nesse período (corrige escolha errada
   sem frustração). Sem cartão, sem PIX pedido.
2. **Aviso (dias 5–7)** — uma transmissão por dia, no tom do app, nunca bloqueando:
   > `TRANSMISSÃO // seu alistamento termina em 2 dias. Até aqui: 4 treinos, 11 km, rank PRATA.`
3. **Dia 8 — debriefing.** Uma tela única de fim de alistamento: resumo do que a pessoa fez,
   o que continua grátis, o que fica travado, e a oferta (anual em destaque, PIX). Botão
   "continuar no grátis" com o **mesmo peso visual** do "assinar" — sem dark pattern.
4. **Reserva (dia 8 em diante)** — o núcleo grátis abaixo, para sempre.

### 4.3 O que fica grátis e o que trava (com base no app atual)

Regra-mãe: **registrar nunca trava, e o dado nunca some.** Trava-se *profundidade de leitura*
e *identidade extra*, nunca o ciclo diário (abrir → registrar → ver o rank).

| Área | Grátis (Reserva) | Pro |
|---|---|---|
| **Check-in** (5 hábitos, backfill, recaída com gatilho) | ✅ completo | ✅ |
| **Corrida** — registrar, pace, piso de 5 km/sem | ✅ registro ilimitado; gráfico de km/semana das **últimas 4 semanas** | Histórico completo |
| **Academia** — treinos, séries, detecção de PR | ✅ registro ilimitado; PR detectado e notificado sempre | ✅ |
| **Página do exercício** (`/gym/exercise/:id`, e1RM e volume por sessão) | Últimas **5 sessões** | Histórico completo |
| **WOD** | ✅ registrar e ver placar | Histórico e comparativo |
| **Rank** | ✅ rank atual + requisitos do próximo nível, na régua do seu arquétipo | + escada inteira com todos os requisitos, histórico de rank |
| **Home** | ✅ wallpaper do arquétipo, frase do dia, check-in rápido, streak | + wallpapers/sons alternativos |
| **Relatórios** (`/reports`) | Heatmap dos **últimos 30 dias** + streaks atuais | Heatmap de 6 meses, consistência por hábito, recaídas por dia da semana, gatilhos, correlações |
| **Protocolo do arquétipo** (treinos prontos) | Só a **semana 1** (amostra) | Completo |
| **Outros arquétipos** | Vitrine (arte, descrição, "na régua do Espartano você estaria em PLATINA") | ✅ todos, troca livre |
| **Personalização** (CRT, som, wallpaper) | Liga/desliga CRT e som | Variações, temas, sons por arquétipo |
| **Export JSON** | ✅ sempre (LGPD) | ✅ |

Por que esses cortes:
- **Rank fica grátis** porque é o que faz voltar todo dia — e ele usa *todo* o histórico para
  calcular, mesmo o que o grátis não vê no gráfico. Pagar nunca dá nível.
- **Histórico curto nos gráficos, não no banco.** Depois de 2–3 meses o usuário grátis tem um
  histórico que ele *quer* ver. O desejo cresce sozinho com o uso.
- **PR sempre grátis** porque é o momento de maior emoção do app — e o melhor momento para o
  convite (abaixo), não para uma trava.

### 4.4 Como pedir o pagamento sem estragar a experiência

- **Pede em vitória, nunca em frustração.** Gatilhos: subiu de rank, bateu PR, streak de 7/30
  dias, fechou a semana acima do piso de corrida. Ex. depois do PR:
  > `NOVO RECORDE // supino 92,5 kg (e1RM). Seu histórico completo de progressão está no Pro.`
- **Nunca interrompe registro.** Nenhum convite aparece durante check-in, treino em andamento ou
  formulário aberto — só depois de salvar.
- **Frequência:** no máximo **1 convite por dia**; fechou o convite → silêncio por 3 dias; 3
  fechamentos seguidos → só volta em marco grande (rank novo).
- **Trava mostra o próprio dado, borrado.** O gráfico além do limite aparece com os dados *reais*
  do usuário desfocados e um `Panel` "ACESSO RESTRITO // nível de autorização: OPERATIVO".
  Ver o próprio progresso escondido converte muito mais que uma tela genérica.
- **Sempre no tom do app:** transmissão, autorização, alistamento. Nada de "Ops! Recurso
  premium 😢".
- **Snackbar, não modal.** O `showSnack()` já existe e é o canal padrão; modal só no debriefing
  do dia 8 e no checkout.

### 4.5 Tiers e preço (BRL)

| | **RECRUTA** (grátis) | **OPERATIVO** (Pro) | **FUNDADOR** (vitalício, lote limitado) |
|---|---|---|---|
| Arquétipos | 1, escolhido no cadastro | Todos *(no futuro: os que possuir)* | Todos, inclusive futuros, para sempre |
| Features | Núcleo do §4.3 (+7 dias de tudo no alistamento) | Todas | Todas + cosmético exclusivo |

Referências: GymBros R$ 7/mês · R$ 60/ano; Hevy ~US$ 24/ano; Strong ~US$ 30/ano; Habitica
~US$ 48/ano; Nerd Fitness ~US$ 99/ano.

| Plano | Preço sugerido | Observação |
|---|---|---|
| Mensal | **R$ 12,90** | Âncora |
| Anual | **R$ 89,90** (~R$ 7,49/mês, "5 meses grátis") | O plano que queremos vender |
| Fundador vitalício | **R$ 199–249**, só os primeiros 300–500 | Caixa inicial + evangelistas; fecha e não volta |
| Arquétipo avulso *(futuro)* | **R$ 19,90** pagamento único | Entra quando o Pro deixar de incluir todos |
| Pacote "Arsenal" *(futuro)* | ~3 avulsos pelo preço de 2 | Todos os arquétipos atuais |

**Taxa do PIX pesa no mensal.** AbacatePay anuncia R$ 0,80 fixo por cobrança PIX: no mensal de
R$ 12,90 isso é ~6,2%; no anual de R$ 89,90 é ~0,9%. Cartão: 3,5% + R$ 0,60. Portanto: **empurrar
anual no PIX** (destaque visual, selo "MELHOR ESCOLHA", comparação mensal x anual na página).

### 4.6 Ganchos de crescimento

- **Temporadas mensais** ("Operação Novembro: 30 dias limpos + 12 treinos"): grátis participa da
  temporada aberta, Pro tem o arquivo. Motivo para voltar e conteúdo para redes.
- **Esquadrão como loop viral**: convite por link; o convidado ganha **14 dias** de alistamento
  no lugar de 7.

### 4.7 Notas de implementação

- `trial_ends_at` e `archetype_codename` ficam no **banco** (`profiles`), nunca no localStorage —
  senão limpar o navegador reinicia o teste.
- Um hook único no front, `useEntitlement('feature:reports.full')`, e um componente `<Locked>`
  que renderiza o conteúdo borrado + CTA. Nenhuma tela checa plano por conta própria.
- Limites (30 dias, 4 semanas, 5 sessões, 1 convite/dia) num arquivo de constantes só — vão
  ser ajustados com dado real de conversão.
- O corte de histórico é **só de exibição** na fase em que o front ainda lê direto do Supabase;
  quando a leitura passar pela API (§5.5), o corte vai para o servidor.

---

## 5. API dedicada em NestJS

### 5.1 Princípio: ports & adapters (arquitetura hexagonal)

O domínio (regras de hábito, rank, PR, assinatura) não sabe que existe Supabase nem AbacatePay.
Ele conversa com **interfaces (ports)**; as implementações concretas (**adapters**) ficam na
borda e são escolhidas na injeção de dependência do Nest. Trocar banco ou gateway = escrever um
adapter novo e trocar um `provide`. Controllers e front não mudam.

```
┌──────────────┐   HTTPS + JWT   ┌──────────────────────── NestJS API ───────────────────────┐
│ React (Vite) │ ──────────────▶ │ Controllers ─▶ Use cases (domínio) ─▶ Ports (interfaces)  │
└──────────────┘                 │                                         │                 │
        │  login (Supabase Auth) │            Adapters ◀───────────────────┘                 │
        ▼                        │  ├─ PostgresHabitLogRepository  (Supabase hoje)           │
  Supabase Auth ── JWKS ───────▶ │  ├─ AbacatePayGateway           (PaymentGateway)          │
                                 │  ├─ SupabaseAuthVerifier        (AuthVerifier)            │
                                 │  └─ R2BackupStorage             (BackupStorage)           │
                                 └───────────────────────────────────────────────────────────┘
```

### 5.2 Onde fica no repo

Manter o front exatamente onde está e adicionar a API ao lado, sem reestruturar:

```
project-better-self/
  src/            # front (inalterado)
  supabase/       # migrations (continuam a fonte da verdade do schema)
  api/            # NOVO — projeto NestJS independente (package.json próprio)
    src/
      main.ts                 # rawBody: true (webhook precisa do corpo cru p/ HMAC)
      app.module.ts
      core/                   # envelope de resposta, filtros de erro, config, logger
      auth/                   # guard que valida o JWT do Supabase via JWKS → req.userId
      modules/
        habits/   runs/   workouts/   wods/   rank/   profile/
          domain/        # tipos e regras puras
          ports/         # interfaces de repositório
          adapters/      # postgres/
          *.controller.ts  *.service.ts  *.module.ts
        billing/
          domain/        # Plan, Subscription, Entitlement, PaymentEvent
          ports/         # PaymentGateway
          adapters/      # abacatepay/  (futuro: mercadopago/, stripe/)
          billing.controller.ts   webhooks.controller.ts
        backup/
          ports/         # BackupStorage, DataExporter
          adapters/
```

Se o projeto crescer (shared types entre front e API), aí sim vale migrar para monorepo com
workspaces (`apps/web`, `apps/api`, `packages/contracts`). Não é necessário no começo.

### 5.3 Ports de dados

```ts
// modules/habits/ports/habit-log.repository.ts
export interface HabitLogRepository {
  listRange(userId: string, from: DayKey, to: DayKey): Promise<HabitLog[]>
  upsert(userId: string, input: UpsertHabitLog): Promise<HabitLog>
  remove(userId: string, habitKey: HabitKey, day: DayKey): Promise<void>
}
export const HABIT_LOG_REPOSITORY = Symbol('HabitLogRepository')

// habits.module.ts
providers: [{ provide: HABIT_LOG_REPOSITORY, useClass: PostgresHabitLogRepository }]
```

**`userId` é sempre parâmetro explícito**, vindo do guard — nunca do body. Isso substitui o
`getUserId()` atual no lado do servidor.

**Decisão importante — o adapter fala SQL, não PostgREST.** Implementar o adapter com
`supabase-js` amarraria a API ao Supabase de novo. Usar um query builder tipado sobre Postgres
puro (**Kysely** ou **Drizzle**) com a connection string do Supabase. Resultado:

- Trocar Supabase por **qualquer Postgres** (Neon, RDS, VPS própria) = trocar a connection string.
  Zero código.
- Trocar para um banco **não-Postgres** = escrever novos adapters. É aqui que os ports se pagam.

**Honestidade sobre o limite da portabilidade:** hoje parte da lógica vive no Postgres — colunas
geradas (`e1rm`, `total_reps`) e triggers (`runs`/`workouts` → `habit_logs`, `workout_sets` →
`personal_records`). Isso é portável entre Postgres, não entre bancos. Recomendação: **o alvo
de portabilidade é "qualquer Postgres"**, e manter as triggers (elas garantem consistência
mesmo se alguém escrever direto no banco). Se um dia sair do Postgres, essas regras sobem para
os use cases — e o fato de estarem documentadas no CLAUDE.md torna isso tarefa delimitada.

**RLS com a API no meio.** A API conecta com um usuário de serviço, que ignora RLS. Duas camadas:
1. Todo método de repositório recebe `userId` e filtra por ele (obrigatório, coberto por teste).
2. Defesa em profundidade: dentro da transação, `set local role authenticated` +
   `set_config('request.jwt.claims', ...)` para as policies `owner_all` continuarem valendo.
   Um bug de filtro esquecido não vaza dado de outro usuário.

### 5.4 Envelope de resposta padronizado

Toda resposta da API, de qualquer módulo, tem a mesma forma — um interceptor e um exception
filter globais garantem isso:

```ts
type ApiResponse<T> =
  | { ok: true;  data: T; meta?: { page?: number; total?: number } }
  | { ok: false; error: { code: ApiErrorCode; message: string; details?: unknown } }

// códigos do domínio, nunca do provedor
type ApiErrorCode =
  | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION'
  | 'ENTITLEMENT_REQUIRED'          // feature Pro sem plano
  | 'PAYMENT_PROVIDER_UNAVAILABLE'  // gateway fora do ar, qualquer que seja
  | 'PAYMENT_DECLINED' | 'CONFLICT' | 'INTERNAL'
```

Erro do Postgres, do AbacatePay ou de qualquer adapter é **traduzido no adapter** para um
desses códigos. O front nunca vê mensagem crua de fornecedor.

### 5.5 Migração do front (strangler, sem big bang)

O front já isola toda chamada em `features/*/api` com `queryOptions`. Isso é exatamente o
ponto de troca: o componente consome `useQuery(habitLogsQuery(...))` e não sabe de onde vem.

1. **Fase A** — API sobe só com `billing` + `entitlements` + webhook. Dados continuam indo direto
   do front ao Supabase. (Pagamento *precisa* de servidor: webhook e chave secreta do gateway
   nunca podem ficar no front.)
2. **Fase B** — migrar feature por feature: trocar o corpo de `queryFn`/`mutationFn` de
   `supabase.from(...)` para `api.get(...)`. Chaves de query não mudam, componentes não mudam.
3. **Fase C** — quando nenhuma feature usar mais `supabase.from`, revogar as policies de escrita
   para `authenticated` no banco. O front passa a usar o Supabase **só para login**.

Auth: manter **Supabase Auth** (login, reset de senha, OAuth Google/Discord — Discord combina
muito com o público). A API valida o JWT pelo JWKS do projeto. Se um dia trocar de provedor de
auth, é outro adapter (`AuthVerifier`).

Hospedagem da API: Railway, Fly.io ou Render (plano pequeno). Precisa de URL pública estável
para o webhook.

---

## 6. Gateway de pagamento — AbacatePay com adapter

### 6.1 O que o AbacatePay oferece (doc v2)

- API REST/JSON em `api.abacatepay.com/v2`, autenticação Bearer, só BRL.
- **PIX transparente**: `POST /transparents/create` devolve `brCode` (copia-e-cola) e
  `brCodeBase64` (QR) — dá para mostrar o QR **dentro** do terminal do app, na nossa estética,
  sem redirecionar.
- **Checkout hospedado** com cupons e metadados (opção mais rápida para o MVP).
- **Assinaturas/recorrência**: cobrança por ciclo (mensal/anual), cartão ou **PIX Automático**.
  Eventos `subscription.completed`, `subscription.renewed`, `subscription.cancelled`.
- **Webhooks** com secret por webhook e assinatura **HMAC-SHA256** no header `X-Webhook-Signature`;
  reenvio automático em falha. Ambientes Dev e Produção separados (chave e webhook por ambiente).
- Taxas anunciadas: PIX R$ 0,80 fixo; cartão 3,5% + R$ 0,60; boleto R$ 2,50. **Confirmar na
  página de pricing antes de fechar preço** — vieram de páginas comerciais.
- Há `llms.txt` em `abacatepay.com/llms.txt` resumindo as rotas da v2 — útil na implementação.

### 6.2 Port

```ts
// modules/billing/ports/payment-gateway.ts
export interface PaymentGateway {
  readonly provider: PaymentProvider            // 'abacatepay' | 'mercadopago' | 'stripe' ...

  ensureCustomer(input: CustomerInput): Promise<ProviderCustomerRef>
  createCheckout(input: CheckoutInput): Promise<CheckoutSession>
  cancelSubscription(ref: ProviderSubscriptionRef): Promise<void>

  /** Valida assinatura do webhook e traduz para o evento NOSSO. Lança se inválido. */
  parseWebhook(rawBody: Buffer, headers: Record<string, string>): PaymentEvent
}

export type CheckoutInput = {
  userId: string
  planId: PlanId                                // 'pro_monthly' | 'pro_yearly' | 'founder' | 'archetype_espartano'
  method: 'pix' | 'card'
  returnUrl: string
}

/** O que o front SEMPRE recebe, qualquer que seja o gateway. */
export type CheckoutSession = {
  id: string                                    // nosso id interno
  status: 'pending' | 'paid' | 'expired' | 'failed'
  amountCents: number
  redirectUrl?: string                          // checkout hospedado
  pix?: { copyPaste: string; qrPngBase64: string; expiresAt: string }  // PIX transparente
}

/** Eventos normalizados — o domínio só conhece estes. */
export type PaymentEvent =
  | { type: 'payment.succeeded';      providerEventId: string; checkoutId: string; paidAt: string }
  | { type: 'payment.failed';         providerEventId: string; checkoutId: string; reason?: string }
  | { type: 'subscription.activated'; providerEventId: string; subscriptionRef: string; periodEnd: string }
  | { type: 'subscription.renewed';   providerEventId: string; subscriptionRef: string; periodEnd: string }
  | { type: 'subscription.canceled';  providerEventId: string; subscriptionRef: string; endsAt: string }
```

O `AbacatePayGateway` mapeia `transparent.completed` → `payment.succeeded`,
`subscription.renewed` → `subscription.renewed`, etc. Um futuro `MercadoPagoGateway` faz o mesmo
mapeamento com os nomes dele. **Domínio, banco e front não mudam.**

Dá para ter mais de um gateway ao mesmo tempo (ex.: PIX no AbacatePay, cartão internacional no
Stripe) com um `PaymentGatewayRegistry` que escolhe por `method`/país.

### 6.3 Tabelas novas (fonte da verdade é NOSSA, não do gateway)

```
plans               id, archetype_key?, interval ('month'|'year'|'lifetime'|'one_time'), price_cents, active
subscriptions       id, user_id, plan_id, status, provider, provider_subscription_ref,
                    current_period_end, cancel_at, created_at
entitlements        user_id, feature_key, source ('subscription'|'purchase'|'trial'|'founder'), expires_at
checkouts           id, user_id, plan_id, provider, provider_ref, status, amount_cents, created_at
payment_events      provider, provider_event_id UNIQUE, type, payload jsonb, processed_at
```

- O app pergunta **"este usuário tem `archetype:espartano`?"** à tabela `entitlements` — nunca ao
  gateway. Gateway fora do ar não derruba o app.
- `payment_events.provider_event_id UNIQUE` = **idempotência**: o AbacatePay reenvia webhook; o
  segundo insert falha e o evento é ignorado.

### 6.4 Fluxo do webhook

1. `POST /webhooks/:provider` — rota pública, corpo cru preservado (`rawBody: true` no Nest).
2. `registry.get(provider).parseWebhook(raw, headers)` valida o HMAC em **tempo constante**
   (`crypto.timingSafeEqual`). Inválido → 401 e log.
3. Insere em `payment_events` (idempotente). Já existia → responde 200 e para.
4. Use case aplica o evento: atualiza `subscriptions`/`checkouts`, concede/revoga `entitlements`.
5. Responde 200 rápido. Trabalho pesado (e-mail de boas-vindas etc.) vai para fila depois.
6. Front faz polling de `GET /billing/checkouts/:id` (ou invalida a query) até `paid` → confete
   (o `celebrated` do ui-store já tem esse padrão).

Job diário de reconciliação: busca assinaturas com `current_period_end` vencido sem evento de
renovação e consulta o gateway — cobre webhook perdido.

---

## 7. Backup, cópia e portabilidade de dados

| Camada | Como | Por quê |
|---|---|---|
| Backup gerenciado | Backups diários do Supabase (plano Pro); avaliar PITR quando houver receita | Restauração rápida dentro do Supabase |
| Backup independente | `pg_dump` agendado (cron na API ou GitHub Action) → bucket S3/Cloudflare R2, criptografado, retenção 30 dias + 1 por mês | Não depender do fornecedor para sobreviver ao fornecedor. É o mesmo dump que permite migrar para outro Postgres |
| Port de storage | `BackupStorage` (adapter R2/S3) | Trocar de bucket sem mexer no job |
| Export por usuário | `DataExporter` — evolui o export JSON atual do perfil para sair da API | Direito de portabilidade (LGPD) e confiança |
| Teste de restore | Mensal: restaurar o último dump num Postgres descartável e rodar um smoke test | Backup que nunca foi restaurado não é backup |

Schema continua versionado em `supabase/migrations/` — é SQL Postgres comum, aplicável em
qualquer Postgres.

---

## 8. Pré-requisitos de produto (antes de cobrar)

- **Cadastro público.** Hoje as contas são criadas pelo admin. Precisa de signup (e-mail +
  Google/Discord), confirmação de e-mail e onboarding (escolha de arquétipo, módulos ativos).
- **LGPD.** Registro de contenção/recaída é **dado pessoal sensível** (vida sexual — art. 5º, II
  e art. 11 da LGPD); dados de saúde e treino também entram. Exige: consentimento específico e
  destacado para o módulo, política de privacidade, termos de uso, exclusão de conta que apaga
  de verdade, export. Vale uma revisão jurídica rápida antes do lançamento.
- **Guardrails de IP** (§0): trocar arte oficial (wallpaper do Leon) por fan art, tirar frases
  literais dos jogos do produto pago, garantir que gateway/nota só vejam o codinome.
- **Docs desatualizados**: README e PLAN.md ainda descrevem o modo "sem auth"; atualizar junto.

---

## 9. Página inicial (landing)

### 9.1 Técnica

- Rota pública `/` para visitante; usuário logado vai direto para o app (a home atual).
  Alternativa mais limpa: landing em `/` e app em `/app/*` — decidir na implementação.
- SPA tem SEO fraco. Pré-renderizar só a landing (HTML estático no build) para indexação e
  preview em redes sociais (Open Graph com arte do arquétipo).
- Reutilizar o design system: `GlitchLogo`, `BootScreen`, `Panel`, `StatCard`, `Meter`, heatmap,
  escada de rank, efeito CRT, `animated-border`. A landing **é** uma demo do app.
- Accent branco, gráficos monocromáticos, `--radius: 0` — mesmas regras do CLAUDE.md.
- Mobile primeiro (o público vai chegar por TikTok/Instagram/Reels).

### 9.2 Seções e copy (rascunho)

1. **Boot (hero).** Sequência de boot do terminal digitando, glitch no logo, e então:
   > **O NERD FORTE NÃO NASCE. É TREINADO.**
   > Você já levou personagem ao nível máximo. Agora o personagem é você.
   > `[ INICIAR OPERAÇÃO ]` — grátis, sem cartão.

2. **"Isso não é mais um app de academia."** Três `StatCard`s:
   `FORÇA — e1RM calculado, PR detectado` · `DISCIPLINA — contenção, leitura, meditação` ·
   `RANK — sobe com consistência, cai com recaída`.
   > Seu nível não é comprado. É conquistado — e pode ser perdido.

3. **Escolha seu arquétipo.** Cards em carrossel (Swiper já existe), um por arquétipo, com arte,
   fantasia em uma linha e o protocolo. Hover com `scan-hover`.
   > Todo jogador escolhe uma classe. Escolha a sua.

4. **Demo do painel ao vivo.** Dashboard real com dados fictícios: heatmap, escada
   LIXO → MESTRE com o requisito sendo riscado (`.req-strike`), gráfico de progressão de carga.
   > Sem confete falso. Sem "parabéns por abrir o app". Só o registro.

5. **A escada.** LIXO · BRONZE · PRATA · PLATINA · DIAMANTE · SOLDADO · SARGENTO · CAPITÃO · MESTRE.
   > Todo mundo começa no LIXO. Poucos chegam a MESTRE.

6. **Honestidade como feature.** Dia sem registro não é falha; recaída derruba nível; frase sem
   autor inventado.
   > Um app que mente pra você te motivar não te respeita.

7. **Preço.** RECRUTA / OPERATIVO (anual destacado, "pague no PIX") / FUNDADOR com contador de
   vagas restantes.

8. **FAQ.** "Preciso já treinar?" (HERDEIRO existe pra isso) · "Meus dados são meus?" (export,
   exclusão, LGPD) · "Posso cancelar?" · "Tem app?" (PWA instalável — ligar o item pendente da
   fase 9 do PLAN.md).

9. **CTA final** sobre o wallpaper com véu:
   > **A OPERAÇÃO COMEÇA HOJE.** `[ ALISTAR-SE ]`

---

## 10. Ordem de execução sugerida

| # | Etapa | Depende de |
|---|---|---|
| 1 | Registro `ARCHETYPES` (codinome + vitrine); fan art encomendada; guardrails de IP do §0 | — |
| 2 | Signup público + onboarding + LGPD (termos, consentimento, exclusão) | — |
| 3 | Motor de rank parametrizado por arquétipo (só front, sem banco) | — |
| 4 | API NestJS: esqueleto, guard JWT, envelope de resposta | — |
| 5 | Billing: tabelas, `PaymentGateway` + `AbacatePayGateway`, webhook, entitlements | 4 |
| 6 | Paywall no front lendo entitlements; teste reverso de 7 dias | 3, 5 |
| 7 | Landing page | 1, 3 |
| 8 | Backup independente (`pg_dump` → R2) + teste de restore | 4 |
| 9 | Strangler: migrar features do front para a API, uma por vez | 4 |
| 10 | Temporadas, esquadrões, arquétipo avulso | 6 |

Lançamento possível após 1–7 (com lote FUNDADOR); 8 antes de ter usuário pagante de verdade.

---

## 10.1 Tracking de eventos (analytics de produto)

### Opções gratuitas pesquisadas (nov/2026)

| Ferramenta | Grátis | Serve para | Observação |
|---|---|---|---|
| **PostHog Cloud** | 1M eventos/mês + 5 mil gravações de sessão + feature flags | Landing **e** dashboard: funil, retenção, caminhos, heatmap, replay, teste A/B | Tudo numa ferramenta; cota reseta todo mês. Exige identificar usuário |
| Mixpanel | 1M eventos/mês (+ replays) | Dashboard | Bom em funil/retenção, mas sem A/B e flags no grátis |
| Amplitude | Fontes conflitam (2M eventos ou limite por usuário) | Dashboard | Números não confirmados oficialmente |
| Umami Cloud (Hobby) | ~100 mil eventos/mês, 1 site | Landing (visitas, origem) | Leve e sem cookie, mas anônimo — não acompanha usuário logado |
| OpenPanel | Só self-host é grátis (exige Postgres + ClickHouse) | Ambos | Cloud é pago depois de 30 dias |
| Microsoft Clarity | Ilimitado | Heatmap e gravação de sessão | Não faz evento de produto; exige consentimento |

### Recomendação: PostHog Cloud

Uma ferramenta para landing e app, e a cota grátis sobra: 200 usuários × ~30 eventos/dia ≈
180 mil eventos/mês. Os **feature flags** e **testes A/B** grátis servem para calibrar o
freemium (§4.7 — limites de 30 dias/5 sessões, preço, texto do convite) com dado real.

### Cuidados

- **Adblock.** O público gamer usa muito bloqueador, e ele corta o PostHog. Usar **proxy
  reverso** (rota `/ingest` no próprio domínio, via rewrite da hospedagem ou da API Nest) —
  documentado pelo PostHog. Sem isso, os números vêm bem subestimados.
- **Dado sensível nunca vai para o analytics.** Evento de contenção registra só *que* houve
  check-in, nunca `limpo`/`recaída`, gatilho, valores de hábito ou cargas. Nada de e-mail como
  propriedade — identificar pelo `user.id` (UUID).
- **Gravação de sessão com máscara total** de inputs e textos no app (`maskAllInputs`,
  mascarar texto). Na landing pode gravar sem máscara.
- **Consentimento (LGPD):** banner na landing; sem consentimento, só eventos anônimos sem
  cookie (`persistence: 'memory'`). No app, consentimento entra no aceite dos termos no cadastro.
- **Um wrapper só:** `shared/lib/analytics.ts` com `track(evento, props)` tipado por uma lista
  fechada de eventos. Nenhum componente importa o SDK direto — trocar de ferramenta vira um
  adapter, como no resto do plano.

### Eventos

Nome `objeto_ação` em inglês (como as rotas); propriedades pequenas e sem dado sensível.

**Landing**

| Evento | Propriedades |
|---|---|
| `landing_viewed` | `utm_source`, `utm_campaign`, `referrer` |
| `landing_section_viewed` | `section` (hero, archetypes, demo, ranks, pricing, faq) |
| `archetype_card_viewed` | `archetype` (codinome) |
| `pricing_plan_clicked` | `plan` |
| `cta_clicked` | `location` (hero, final, pricing) |
| `signup_started` / `signup_completed` | `method` (email, google, discord) |

**App**

| Evento | Propriedades |
|---|---|
| `onboarding_archetype_chosen` | `archetype` |
| `checkin_saved` | `habits_count`, `is_backfill` |
| `run_logged` / `workout_logged` / `wod_logged` | `sets_count` (treino) — sem carga |
| `pr_achieved` | — |
| `rank_changed` | `from`, `to`, `direction` |
| `page_viewed` | `route` (automático do PostHog) |
| `report_viewed` | `report` (heatmap, consistency, relapse_weekday...) |
| `locked_feature_viewed` | `feature` — mede o que mais desperta vontade de pagar |
| `upgrade_prompt_shown` / `_clicked` / `_dismissed` | `trigger` (rank_up, pr, streak_7...) |
| `trial_debrief_viewed` | `trial_day` |
| `checkout_started` / `checkout_paid` | `plan`, `method` |
| `archetype_switched` | `from`, `to` |
| `settings_changed` | `setting` (crt, sound, wallpaper) |

**Funis para montar logo de cara:** landing → cadastro → 1º check-in → dia 7 ativo → pagamento;
e `upgrade_prompt_shown` → `checkout_paid` por `trigger`, para saber qual momento de vitória
converte.

---

## 10.2 Divisão de trabalho — Francisco × Henrique

**Critério:** cortar pela fronteira do código para os dois quase nunca mexerem no mesmo arquivo.
Francisco construiu o front e conhece o design system, o motor de rank e as convenções → fica
com **front, produto e marca**. Henrique entra do zero, e a API NestJS também começa do zero
(pasta `api/` nova, sem histórico para aprender) → fica com **API, pagamento e infraestrutura**.
Se o perfil do Henrique for mais front, inverter os blocos B e C.

### A. Juntos (semana 1, antes de dividir)

| Tarefa | Saída |
|---|---|
| Henrique faz o `ONBOARDING.md` inteiro e um PR pequeno | Fluxo de PR validado |
| Fechar as decisões do §11 | Lista riscada |
| **Contrato da API**: envelope de resposta (§5.4), códigos de erro, endpoints de billing e `GET /me/entitlements`, nomes das `feature:*` e `archetype:*` | Arquivo de contrato (tipos TS) commitado — é o que deixa os dois trabalharem em paralelo |
| Schema novo (`plans`, `subscriptions`, `entitlements`, `checkouts`, `payment_events`, `profiles.trial_ends_at`, `profiles.archetype_codename`) | Migração `0004` revisada pelos dois |
| Lista de eventos de analytics (§10.1) | Tipos do `track()` |

Regra: **migração de banco sempre revisada pelos dois** antes de rodar — o banco é compartilhado.

### B. Francisco — front, produto e marca

| # | Tarefa | Seção | Depende de |
|---|---|---|---|
| F1 | Registro `ARCHETYPES` (codinome + vitrine) e motor de rank parametrizado por arquétipo | §0, §3 | — |
| F2 | Encomendar fan art dos arquétipos; trocar wallpaper oficial do Leon | §0 | — |
| F3 | Cadastro público + onboarding (escolha do arquétipo, módulo de contenção opt-in, aceite LGPD) | §8 | Auth do Supabase (já existe) |
| F4 | `analytics.ts` + PostHog + banner de consentimento | §10.1 | A |
| F5 | Landing page | §9 | F1, F2 |
| F6 | `useEntitlement`, `<Locked>`, limites do grátis, jornada do alistamento (avisos, debriefing do dia 8), convites em momento de vitória | §4 | Contrato (A); usa mock até H4 ficar pronto |
| F7 | Telas de checkout/PIX e status do pagamento | §6.4 | H3 |
| F8 | Strangler no front: trocar `queryFn`/`mutationFn` feature por feature | §5.5 | H7 |
| F9 | Textos legais (termos, privacidade) com revisão jurídica; atualizar README/PLAN.md | §8 | — |

### C. Henrique — API, pagamento e infraestrutura

| # | Tarefa | Seção | Depende de |
|---|---|---|---|
| H1 | Esqueleto NestJS em `api/`: config, envelope + filtro de erro, guard JWT do Supabase (JWKS), adapter Postgres (Kysely/Drizzle) | §5 | A |
| H2 | Ambientes dev/prod (projeto Supabase separado para dev, chaves AbacatePay de teste), deploy da API, CI com build + lint | §5.5 | H1 |
| H3 | `PaymentGateway` + `AbacatePayGateway` + checkout (hospedado ou PIX transparente) | §6.2 | H1 |
| H4 | Webhook (HMAC, idempotência, `payment_events`) → `subscriptions` → `entitlements`; `GET /me/entitlements`; trial de 7 dias no cadastro | §6.3, §6.4, §4.7 | H3 |
| H5 | Job de reconciliação diária + testes do webhook e do filtro por `userId` | §6.4, §5.3 | H4 |
| H6 | Proxy reverso `/ingest` do PostHog (contra adblock) | §10.1 | H2 |
| H7 | Módulos de dados na API (habits, runs, workouts, wods, profile), um por vez, com RLS de defesa em profundidade | §5.3 | H1 |
| H8 | Backup independente (`pg_dump` → R2) + teste de restauração | §7 | H2 |

### D. Linha do tempo (sugestão, ~6 semanas até cobrar)

| Semana | Francisco | Henrique |
|---|---|---|
| 1 | **A** (juntos) · F1 | **A** (juntos) · H1 |
| 2 | F2 (encomenda) · F3 | H1 · H2 |
| 3 | F4 · F6 (com mock) | H3 |
| 4 | F5 | H4 |
| 5 | F6 ligado na API real · F7 | H5 · H6 |
| 6 | F9 · testes ponta a ponta juntos | H8 · testes ponta a ponta juntos |
| **Lançamento** (lote FUNDADOR) | | |
| 7+ | F8 | H7 |

Pontos de sincronização: fim da semana 1 (contrato fechado), fim da semana 4 (F6 troca o mock
pela API real), semana 6 (pagamento de verdade, ponta a ponta, em ambiente de teste).

### E. Como trabalhar junto

- Branch por tarefa (`feat/f3-signup`, `feat/h4-webhook`), PR pequeno, **o outro revisa** —
  cada um aprende a metade do outro sem precisar fazê-la.
- Mudança no contrato da API = PR no arquivo de contrato, aprovado pelos dois antes do código.
- Quadro simples (GitHub Projects) com os códigos F1–F9 / H1–H8 como cards.
- 15 min de sincronização 2× por semana.

---

## 11. Decisões em aberto

- Codinomes finais e artista dos arquétipos.
- Landing em `/` com app em `/app/*`, ou landing condicional em `/`?
- Checkout hospedado (rápido) ou PIX transparente dentro do terminal (mais bonito) no MVP?
- Kysely ou Drizzle no adapter Postgres?
- Contenção ligada por padrão ou opt-in no onboarding?
- Preço final após confirmar taxas reais do AbacatePay.

---

## Fontes

- Nerd Fitness Journey — [App Store](https://apps.apple.com/us/app/-/id1480318629) · [AppGoblin](https://appgoblin.info/apps/1480318629)
- Habitica — [App Store](https://apps.apple.com/na/app/id994882113?l=en-gb) · [Adapty paywall library](https://adapty.io/paywall-library/habitica/)
- Apps "Solo Leveling" — [Arise](https://apps.apple.com/app/id6743036247) · [Solo Level: System](https://apps.apple.com/us/app/id6755756882) · [Solo Hunter](https://apps.apple.com/app/id6758021041) · [AppsHunter](https://appshunter.io/ios/topics/solo-leveling-workout)
- Hevy/Strong — [SensAI: pricing 2026](https://www.sensai.fit/blog/fitness-app-pricing-free-tier-comparison) · [Strong review](https://www.sensai.fit/blog/strong-app-review-2026) · [App Pricing Lab (Hevy)](https://apppricinglab.com/iap/apple/1458862350)
- GymBros — [MacMagazine, mar/2026](https://macmagazine.com.br/post/2026/03/17/gymbros-e-um-app-de-exercicios-com-gamificacao-a-la-duolingo/)
- Marvel Move — [TechCrunch](https://techcrunch.com/2023/04/18/marvels-new-fitness-app-marvel-move-brings-superheroes-to-your-workout-routine/) · [Six to Start — Superhero Workout](https://sixtostart.com/superhero-workout)
- Analytics — [PostHog pricing](https://posthog.com/pricing) · [PostHog free plan (CostBench)](https://costbench.com/software/product-analytics/posthog/free-plan/) · [Mixpanel pricing](https://mixpanel.com/pricing.md) · [Amplitude vs Mixpanel free](https://agentdeals.dev/amplitude-vs-mixpanel) · [Umami Cloud FAQ](https://umami.is/docs/cloud/faq) · [OpenPanel vs Umami](https://openpanel.dev/compare/umami-alternative) · [Microsoft Clarity FAQ](https://learn.microsoft.com/en/clarity/faq)
- AbacatePay — [Docs](https://docs.abacatepay.com/pages/v1/introduction) · [Webhooks](https://docs.abacatepay.com/pages/webhooks) · [PIX](https://www.abacatepay.com/pix) · [Assinaturas](https://www.abacatepay.com/assinaturas) · [SaaS](https://www.abacatepay.com/saas) · [llms.txt](https://www.abacatepay.com/llms.txt)
