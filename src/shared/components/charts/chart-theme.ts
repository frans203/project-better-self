/**
 * Todos os graficos do app sao MONOCROMATICOS de uma serie so.
 *
 * Isso e decisao de design, nao limitacao: o sistema visual tem um unico
 * accent (branco) e as cores restantes sao reservadas para estado
 * (ok/aviso/falha). Introduzir uma paleta categorica de 5 tons brigaria com
 * isso e ainda exigiria validacao de daltonismo para separar as series.
 *
 * Quando precisar comparar varias coisas (ex.: consistencia dos 5 habitos),
 * a saida e small multiples — uma barra por habito, todas brancas, cada uma
 * com rotulo direto. Identidade vem do rotulo, nunca da cor.
 */

export const CHART = {
  /** Serie unica. */
  mark: '#ffffff',
  markDim: 'rgba(255,255,255,0.55)',
  markFaint: 'rgba(255,255,255,0.12)',

  /** Estados — sempre acompanhados de rotulo, nunca cor sozinha. */
  ok: '#22c55e',
  warn: '#f59e0b',
  fail: '#ef4444',

  /** Grid e eixos recessivos: contexto, nao conteudo. */
  grid: 'rgba(255,255,255,0.06)',
  axis: 'rgba(255,255,255,0.10)',
  tick: '#6e6e6e',

  surface: '#0a0a0a',
  surfaceElevated: '#111111',
} as const

export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: CHART.tick, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' },
} as const

export const gridProps = {
  stroke: CHART.grid,
  vertical: false,
} as const

/** Marcador de 8px com anel da cor da superficie, pra nao encostar na linha. */
export const dotProps = {
  r: 4,
  fill: CHART.mark,
  stroke: CHART.surface,
  strokeWidth: 2,
} as const

export const activeDotProps = {
  r: 5,
  fill: CHART.mark,
  stroke: CHART.surface,
  strokeWidth: 2,
} as const
