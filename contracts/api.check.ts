/**
 * Checagem do contrato. Duas partes:
 *
 * 1. Tipos — conferidos pelo `tsc` (este arquivo esta no `contracts/tsconfig.json`, que o
 *    `npm run build` tambem compila). Cada `@ts-expect-error` e um formato que o contrato
 *    TEM que recusar: se um dia ele aceitar, o tsc reclama que o erro esperado sumiu.
 * 2. Regra do `hasEntitlement` — executada pelo node (type stripping nativo, Node 22.18+).
 *
 * Rodar: npm run check:contracts
 */
import {
  hasEntitlement,
  type ApiError,
  type ApiResponse,
  type CreateCheckoutRequest,
  type EntitlementGrant,
  type MeEntitlements,
} from './api.ts'

// ─── 1. Tipos ────────────────────────────────────────────────────────────────

export const typeCases: unknown[] = [
  { code: 'ENTITLEMENT_REQUIRED', message: 'x', details: { required: 'feature:reports.full' } } satisfies ApiError,
  { code: 'NOT_FOUND', message: 'x' } satisfies ApiError,
  { ok: true, data: 1 } satisfies ApiResponse<number>,
  { planId: 'pro_yearly', method: 'pix' } satisfies CreateCheckoutRequest,

  // @ts-expect-error VALIDATION exige details.fields
  { code: 'VALIDATION', message: 'x' } satisfies ApiError,
  // @ts-expect-error NOT_FOUND nao aceita details
  { code: 'NOT_FOUND', message: 'x', details: { fields: {} } } satisfies ApiError,
  // @ts-expect-error codigo de erro fora da lista fechada
  { code: 'ABACATEPAY_TIMEOUT', message: 'x' } satisfies ApiError,
  // @ts-expect-error plan_id nunca leva nome de personagem (guardrail §0)
  { planId: 'archetype_kratos', method: 'pix' } satisfies CreateCheckoutRequest,
  // @ts-expect-error returnUrl nao vem do cliente
  { planId: 'pro_yearly', method: 'pix', returnUrl: 'https://evil.example' } satisfies CreateCheckoutRequest,
  // @ts-expect-error arquetipo desconhecido
  { phase: 'reserve', archetype: 'monge', trialEndsAt: null, subscription: null, grants: [] } satisfies MeEntitlements,
]

// ─── 2. hasEntitlement ───────────────────────────────────────────────────────

const now = new Date('2026-11-09T12:00:00Z')
const grant = (key: EntitlementGrant['key'], expiresAt: string | null = null): EntitlementGrant => ({
  key,
  source: 'subscription',
  expiresAt,
})

const cases: [name: string, got: boolean, want: boolean][] = [
  ['curinga cobre feature', hasEntitlement([grant('feature:*')], 'feature:reports.full', now), true],
  ['curinga NAO cobre cosmetico do fundador', hasEntitlement([grant('feature:*')], 'feature:cosmetic.founder', now), false],
  ['cosmetico do fundador concedido explicito', hasEntitlement([grant('feature:cosmetic.founder')], 'feature:cosmetic.founder', now), true],
  ['curinga de arquetipo', hasEntitlement([grant('archetype:*')], 'archetype:espartano', now), true],
  ['arquetipo diferente do concedido', hasEntitlement([grant('archetype:operador')], 'archetype:espartano', now), false],
  ['curinga de arquetipo nao libera feature', hasEntitlement([grant('archetype:*')], 'feature:reports.full', now), false],
  ['trial vencido um segundo antes', hasEntitlement([grant('feature:*', '2026-11-09T11:59:59Z')], 'feature:reports.full', now), false],
  ['trial vencendo exatamente agora', hasEntitlement([grant('feature:*', '2026-11-09T12:00:00Z')], 'feature:reports.full', now), false],
  ['trial vigente', hasEntitlement([grant('feature:*', '2026-11-10T00:00:00Z')], 'feature:reports.full', now), true],
  ['sem nenhum grant', hasEntitlement([], 'feature:reports.full', now), false],
]

let failures = 0
for (const [name, got, want] of cases) {
  const pass = got === want
  if (!pass) failures++
  console.log(`${pass ? 'OK   ' : 'FALHA'} ${name}${pass ? '' : ` (veio ${got}, esperado ${want})`}`)
}
console.log(failures ? `\n${failures} de ${cases.length} falharam` : `\n${cases.length} casos ok`)
if (failures) process.exitCode = 1
