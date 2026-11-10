/**
 * CONTRATO DA API — OPERATION: BETTER SELF
 *
 * RASCUNHO (feat/api-contract). Fonte: SAAS_PLAN.md §4, §5.4, §6.2, §6.3, §10.2-A.
 *
 * Este arquivo e a fronteira entre o front (Francisco) e a API NestJS (Henrique). Mudou aqui =
 * PR proprio, aprovado pelos dois ANTES do codigo que depende dele (§10.2-E).
 *
 * Regras do arquivo:
 * - So sintaxe apagavel (`erasableSyntaxOnly`): nada de `enum`, `namespace` ou parameter
 *   properties. Listas fechadas sao `as const` + tipo derivado, igual ao `HABIT_KEYS`.
 * - Zero import. Vale tanto pro Vite quanto pro Nest, sem depender de nenhum dos dois.
 * - Datas trafegam como ISO 8601 (string). Dinheiro sempre em centavos (inteiro). IDs sao uuid.
 * - Nome de personagem (Kratos, Joel...) NUNCA aparece aqui: o contrato so conhece o codinome
 *   (§0). A vitrine (`showcaseName`) mora no registro `ARCHETYPES` do front.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. Envelope de resposta (§5.4)
// ─────────────────────────────────────────────────────────────────────────────

export const API_ERROR_CODES = [
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'VALIDATION',
  /** Feature ou arquetipo sem o direito correspondente em `entitlements`. */
  'ENTITLEMENT_REQUIRED',
  /** Gateway fora do ar ou respondendo erro — qualquer que seja o gateway. */
  'PAYMENT_PROVIDER_UNAVAILABLE',
  'PAYMENT_DECLINED',
  'CONFLICT',
  'INTERNAL',
] as const
export type ApiErrorCode = (typeof API_ERROR_CODES)[number]

/** Status HTTP de cada codigo. O exception filter global do Nest le daqui. */
export const API_ERROR_HTTP_STATUS = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION: 422,
  ENTITLEMENT_REQUIRED: 402,
  PAYMENT_PROVIDER_UNAVAILABLE: 503,
  PAYMENT_DECLINED: 402,
  CONFLICT: 409,
  INTERNAL: 500,
} as const satisfies Record<ApiErrorCode, number>

/**
 * Formato de `details` por codigo. Codigo fora do mapa nao tem `details`.
 * Mensagem crua de fornecedor (Postgres, AbacatePay) nunca entra aqui: o adapter traduz.
 */
export type ApiErrorDetails = {
  /** Campo -> mensagem em pt-BR pronta pra exibir no `Field`. */
  VALIDATION: { fields: Record<string, string> }
  /** Qual direito faltou — o front usa pra montar o `<Locked>` certo. */
  ENTITLEMENT_REQUIRED: { required: EntitlementKey }
  PAYMENT_DECLINED: { method: PaymentMethod }
}

export type ApiError<C extends ApiErrorCode = ApiErrorCode> = {
  [K in C]: {
    code: K
    /** Mensagem em pt-BR, no tom do app. Pode ir direto pro `showSnack()`. */
    message: string
  } & (K extends keyof ApiErrorDetails ? { details: ApiErrorDetails[K] } : { details?: never })
}[C]

export type ApiMeta = { page?: number; total?: number }

export type ApiOk<T> = { ok: true; data: T; meta?: ApiMeta }
export type ApiFail = { ok: false; error: ApiError }
export type ApiResponse<T> = ApiOk<T> | ApiFail

// ─────────────────────────────────────────────────────────────────────────────
// 2. Arquetipos (§3)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Codinome = identificador PERMANENTE (codigo, banco, `plan_id`, gateway, nota fiscal).
 * Minusculo, ASCII, sem acento. Adicionar e barato; renomear ou remover depois que houver
 * linha no banco nao e — por isso MONGE (opcional no §3) ainda nao entra.
 *
 * PENDENTE §11: codinomes finais. ESPARTANO pode virar BERSERKER.
 */
export const ARCHETYPE_CODENAMES = [
  'operador',
  'espartano',
  'sobrevivente',
  'cacador',
  'herdeiro',
] as const
export type ArchetypeCodename = (typeof ARCHETYPE_CODENAMES)[number]

// ─────────────────────────────────────────────────────────────────────────────
// 3. Entitlements (§4.1, §4.3, §6.3)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Features travaveis. Saiu da tabela do §4.3: cada chave e uma linha "Gratis x Pro".
 * O que e gratis pra sempre (check-in, registro de treino/corrida/WOD, PR, rank atual,
 * export JSON) NAO tem chave — registrar nunca trava.
 *
 * Os limites do gratis (30 dias, 4 semanas, 5 sessoes) NAO moram aqui: ficam no arquivo de
 * constantes do front (§4.7) ate o corte ir pro servidor (fase B do strangler).
 */
export const FEATURE_KEYS = [
  /** /reports: heatmap de 6 meses, consistencia, recaidas por dia da semana, gatilhos. */
  'reports.full',
  /** /running: grafico de km/semana alem das ultimas 4 semanas. */
  'running.history',
  /** /gym/exercise/:id: e1RM e volume alem das ultimas 5 sessoes. */
  'gym.exercise_history',
  /** WOD: historico e comparativo (registrar e ver placar e gratis). */
  'wod.history',
  /** /rank: escada inteira com todos os requisitos + historico de rank. */
  'rank.ladder',
  /** Protocolo do arquetipo alem da semana 1. */
  'protocol.full',
  /** Wallpapers, sons e temas alternativos (ligar/desligar CRT e som e gratis). */
  'customization.full',
  /** Cosmetico exclusivo do FUNDADOR. Nunca entra no `feature:*`. */
  'cosmetic.founder',
] as const
export type FeatureKey = (typeof FEATURE_KEYS)[number]

/** Features que o `feature:*` NAO cobre: so vem por concessao explicita. */
export const FEATURE_KEYS_OUTSIDE_WILDCARD = ['cosmetic.founder'] as const satisfies readonly FeatureKey[]

/**
 * `archetype:*` / `feature:*` sao curingas. Hoje o Pro concede os dois (§4.1); no futuro,
 * assinante novo deixa de receber `archetype:*` e passa a receber so o escolhido + comprados.
 * Tela NENHUMA pergunta por curinga: sempre pelo direito especifico (`useEntitlement`).
 */
export type EntitlementKey =
  | `archetype:${ArchetypeCodename}`
  | 'archetype:*'
  | `feature:${FeatureKey}`
  | 'feature:*'

/** Direito que uma tela pode exigir (curinga nao entra). */
export type RequirableEntitlement = `archetype:${ArchetypeCodename}` | `feature:${FeatureKey}`

export const ENTITLEMENT_SOURCES = ['subscription', 'purchase', 'trial', 'founder'] as const
export type EntitlementSource = (typeof ENTITLEMENT_SOURCES)[number]

export type EntitlementGrant = {
  key: EntitlementKey
  source: EntitlementSource
  /** null = nao expira (FUNDADOR, compra avulsa). */
  expiresAt: string | null
}

/**
 * Regra unica de "o usuario tem esse direito?". Front (`useEntitlement`) e API (guard de
 * feature) chamam a MESMA funcao — se a regra de curinga mudar, muda nos dois lados juntos.
 *
 * A API ja manda so grants vigentes, mas o trial pode vencer com a aba aberta: por isso a
 * expiracao e checada de novo aqui, contra `now`.
 */
export function hasEntitlement(
  grants: readonly EntitlementGrant[],
  required: RequirableEntitlement,
  now: Date = new Date(),
): boolean {
  const [kind, value] = required.split(':') as ['archetype' | 'feature', string]
  const wildcardCovers =
    kind === 'archetype' ||
    !(FEATURE_KEYS_OUTSIDE_WILDCARD as readonly string[]).includes(value)

  return grants.some((g) => {
    if (g.expiresAt !== null && new Date(g.expiresAt).getTime() <= now.getTime()) return false
    if (g.key === required) return true
    return wildcardCovers && g.key === `${kind}:*`
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Planos (§4.5, §6.3)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `plan_id` usa so codinome (guardrail §0). Preco NAO esta no contrato: vem da tabela
 * `plans` via GET /billing/plans, pra poder mudar sem deploy.
 * `archetype_<codinome>` e o avulso futuro (§4.5) — o tipo ja aceita, a tabela ainda nao tem.
 */
export type PlanId = 'pro_monthly' | 'pro_yearly' | 'founder' | `archetype_${ArchetypeCodename}`

export const PLAN_INTERVALS = ['month', 'year', 'lifetime', 'one_time'] as const
export type PlanInterval = (typeof PLAN_INTERVALS)[number]

export type Plan = {
  id: PlanId
  interval: PlanInterval
  priceCents: number
  /** So nos planos `archetype_*`. */
  archetype: ArchetypeCodename | null
  /**
   * So no `founder`: vagas que sobram no lote. null = sem limite.
   * A landing mostra o contador (§9.2, secao 7).
   */
  remainingSlots: number | null
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Checkout e assinatura (§6.2, §6.4)
// ─────────────────────────────────────────────────────────────────────────────

export const PAYMENT_METHODS = ['pix', 'card'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const CHECKOUT_STATUSES = ['pending', 'paid', 'expired', 'failed'] as const
export type CheckoutStatus = (typeof CHECKOUT_STATUSES)[number]

/**
 * Body de POST /billing/checkouts.
 *
 * Sem `returnUrl` de proposito: a API monta a URL de volta a partir da propria config
 * (`APP_URL`). Aceitar URL do cliente abre redirect arbitrario saindo do gateway.
 */
export type CreateCheckoutRequest = {
  planId: PlanId
  method: PaymentMethod
}

/** O que o front SEMPRE recebe, qualquer que seja o gateway. */
export type CheckoutSession = {
  /** Id NOSSO (tabela `checkouts`), nunca o do gateway. */
  id: string
  planId: PlanId
  method: PaymentMethod
  status: CheckoutStatus
  amountCents: number
  createdAt: string
  /**
   * Exatamente um dos dois vem preenchido enquanto `status === 'pending'`:
   * - `redirectUrl`: checkout hospedado
   * - `pix`: PIX transparente, QR desenhado dentro do terminal
   * PENDENTE §11: qual dos dois no MVP. O contrato aceita ambos pra decisao nao travar o F7.
   */
  redirectUrl: string | null
  pix: {
    /** BR Code copia-e-cola. */
    copyPaste: string
    qrPngBase64: string
    expiresAt: string
  } | null
}

export const SUBSCRIPTION_STATUSES = ['active', 'past_due', 'canceled', 'expired'] as const
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number]

/**
 * Cancelou mas ainda tem periodo pago = `status: 'active'` + `cancelAt` preenchido.
 * So vira `canceled` quando o acesso de fato acaba.
 */
export type Subscription = {
  planId: PlanId
  status: SubscriptionStatus
  method: PaymentMethod
  currentPeriodEnd: string
  cancelAt: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. /me (§4.1, §4.2, §4.7)
// ─────────────────────────────────────────────────────────────────────────────

/** Fase da jornada do gratis (§4.2). Derivada no servidor de `trial_ends_at` + assinatura. */
export const ACCESS_PHASES = [
  /** Dias 0–7: arquetipo escolhido completo. */
  'enlistment',
  /** Dia 8+: nucleo gratis. */
  'reserve',
  /** Pro ativo (inclui cancelado com periodo ainda pago). */
  'operative',
  /** Vitalicio. */
  'founder',
] as const
export type AccessPhase = (typeof ACCESS_PHASES)[number]

/** Resposta de GET /me/entitlements. */
export type MeEntitlements = {
  phase: AccessPhase
  /** Escolhido no onboarding. null = onboarding ainda nao concluido. */
  archetype: ArchetypeCodename | null
  /** `profiles.trial_ends_at`. null se o onboarding nao rodou. */
  trialEndsAt: string | null
  subscription: Subscription | null
  /** Ja filtrados para os vigentes. */
  grants: EntitlementGrant[]
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Mapa de endpoints
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Toda rota que o FRONT chama. Chave = "METODO /caminho" exatamente como no controller Nest.
 * Um client tipado (`api.request('GET /billing/checkouts/:id', { params: { id } })`) se monta
 * em cima disto sem repetir tipo.
 *
 * Toda rota exige JWT do Supabase (`Authorization: Bearer`), exceto as marcadas `public`.
 * `userId` NUNCA vai em params/body: vem do guard (§5.3).
 *
 * Fora deste mapa por nao serem chamadas pelo front:
 * - POST /webhooks/:provider — publica, corpo cru, HMAC `X-Webhook-Signature` (§6.4).
 */
export type ApiEndpoints = {
  'GET /me/entitlements': {
    params: never
    body: never
    response: MeEntitlements
  }
  /** Publica: a landing mostra preco e vagas do FUNDADOR sem login. */
  'GET /billing/plans': {
    public: true
    params: never
    body: never
    response: Plan[]
  }
  /**
   * Erros esperados: VALIDATION (plano inativo/inexistente), CONFLICT (ja tem assinatura
   * ativa, ou FUNDADOR esgotado), PAYMENT_PROVIDER_UNAVAILABLE.
   */
  'POST /billing/checkouts': {
    params: never
    body: CreateCheckoutRequest
    response: CheckoutSession
  }
  /** Polling ate `paid` (§6.4, passo 6). NOT_FOUND tambem para checkout de outro usuario. */
  'GET /billing/checkouts/:id': {
    params: { id: string }
    body: never
    response: CheckoutSession
  }
  /** Cancela no fim do periodo pago. NOT_FOUND se nao houver assinatura ativa. */
  'POST /billing/subscription/cancel': {
    params: never
    body: never
    response: Subscription
  }
}

export type ApiRoute = keyof ApiEndpoints
export type ApiParams<R extends ApiRoute> = ApiEndpoints[R]['params']
export type ApiBody<R extends ApiRoute> = ApiEndpoints[R]['body']
export type ApiResult<R extends ApiRoute> = ApiEndpoints[R]['response']
