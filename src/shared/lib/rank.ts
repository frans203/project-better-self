import type { HabitLogRow, RunRow, WorkoutSetRow } from '@/shared/types/database.types'
import { daysSince, type DayKey } from './date'
import { fmtInt, fmtNumber, fmtPace } from './utils'

/**
 * NIVEIS DE COMPLETUDE
 *
 * Tudo aqui e derivado dos registros — nada e persistido. Isso e de proposito:
 * sem coluna nova nao ha migracao de dados, nao ha linha antiga sem valor, e
 * recalcular o passado inteiro e so reabrir a tela.
 *
 * A regra tem duas partes:
 *
 *   1. NIVEL BASE — o mais alto cujos OITO requisitos estao cumpridos. Cada
 *      nivel exige mais do que o anterior em toda medida, nunca menos.
 *
 *   2. PENALIDADE DE CONTENCAO — recaida derruba nivel, sempre. Uma nos
 *      ultimos 15 dias tira um nivel; duas ou mais tiram dois. A contencao
 *      tambem entra como requisito proprio (dias limpos), entao ela pesa nos
 *      dois lados: trava a subida e forca a descida.
 */

export const RANK_KEYS = [
  'lixo',
  'bronze',
  'prata',
  'platina',
  'diamante',
  'soldado',
  'sargento',
  'capitao',
  'mestre',
] as const

export type RankKey = (typeof RANK_KEYS)[number]

export const RANK_LABEL: Record<RankKey, string> = {
  lixo: 'LIXO',
  bronze: 'BRONZE',
  prata: 'PRATA',
  platina: 'PLATINA',
  diamante: 'DIAMANTE',
  soldado: 'SOLDADO',
  sargento: 'SARGENTO',
  capitao: 'CAPITÃO',
  mestre: 'MESTRE',
}

export type MetricKey =
  | 'containment'
  | 'volume'
  | 'reps'
  | 'wod'
  | 'km'
  | 'pace'
  | 'meditation'
  | 'reading'

/** Um degrau da escada. `pace` e teto em segundos por km; o resto e piso. */
interface RankThreshold {
  containment: number
  volume: number
  reps: number
  wod: number
  km: number
  pace: number
  meditation: number
  reading: number
}

/**
 * A escada.
 *
 * Toda coluna cresce de cima para baixo. `pace` e a excecao invertida: exigir
 * mais e exigir MENOS segundos por km, entao o numero cai — o rigor sobe do
 * mesmo jeito.
 *
 * `reps` (academia, 7 dias) esta calibrado no treino real do operador: ~4
 * series de ~4 repeticoes por sessao, ou seja ~17 reps por treino. A regua
 * antiga (60 a 800) vinha de um treino generico de 10-12 reps e era
 * inalcancavel para quem levanta pesado e baixo — 800 reps/semana daria 200
 * series. Aqui BRONZE sao ~2 treinos e MESTRE sao ~5-6 treinos densos.
 *
 * `wod` (CrossFit, 15 dias) e coluna separada de proposito: e trabalho
 * metabolico de peso corporal, nao carga na barra, e somar os dois numa
 * metrica so fazia uma Cindy valer 7 semanas de academia.
 *
 * A janela e de 15 dias porque CrossFit aqui nao e semanal — a coluna comeca
 * em ZERO no BRONZE, entao da pra subir os primeiros niveis so levantando
 * peso. Ela so passa a cobrar de PRATA em diante, e cresce devagar: a ideia e
 * que hipertrofia e perda de gordura continuem no centro, e o condicionamento
 * vire requisito de verdade so na parte alta da escada.
 *
 * Referencias usadas: a primeira Cindy do operador deu 331 reps (11 rounds);
 * Tom Holland faz 27 rounds (810 reps) nos mesmos 20 minutos.
 */
const THRESHOLDS: Record<Exclude<RankKey, 'lixo'>, RankThreshold> = {
  bronze: { containment: 3, volume: 1_000, reps: 35, wod: 0, km: 5, pace: 480, meditation: 30, reading: 50 },
  prata: { containment: 7, volume: 2_500, reps: 50, wod: 150, km: 10, pace: 450, meditation: 60, reading: 110 },
  platina: { containment: 14, volume: 4_500, reps: 70, wod: 350, km: 15, pace: 420, meditation: 105, reading: 190 },
  diamante: { containment: 21, volume: 7_000, reps: 90, wod: 600, km: 21, pace: 400, meditation: 160, reading: 290 },
  soldado: { containment: 30, volume: 10_000, reps: 110, wod: 900, km: 28, pace: 380, meditation: 225, reading: 410 },
  sargento: { containment: 45, volume: 13_500, reps: 130, wod: 1_300, km: 36, pace: 360, meditation: 300, reading: 550 },
  capitao: { containment: 60, volume: 17_500, reps: 155, wod: 1_800, km: 45, pace: 340, meditation: 390, reading: 710 },
  mestre: { containment: 90, volume: 22_000, reps: 185, wod: 2_400, km: 55, pace: 320, meditation: 495, reading: 900 },
}

interface MetricMeta {
  key: MetricKey
  label: string
  /** Janela de apuracao, em dias — aparece na tela para nao virar caixa-preta. */
  window: string
  format: (v: number) => string
  /** Pace: menor e melhor. */
  lowerIsBetter?: boolean
}

export const METRICS: MetricMeta[] = [
  {
    key: 'containment',
    label: 'Contenção',
    window: 'sequência atual',
    format: (v) => `${fmtInt(v)} dias`,
  },
  { key: 'volume', label: 'Volume levantado', window: '7 dias', format: (v) => `${fmtInt(v)} kg` },
  { key: 'reps', label: 'Repetições na academia', window: '7 dias', format: (v) => fmtInt(v) },
  {
    key: 'wod',
    label: 'Repetições no WOD',
    window: '15 dias',
    format: (v) => fmtInt(v),
  },
  { key: 'km', label: 'Quilometragem', window: '7 dias', format: (v) => `${fmtNumber(v, 1)} km` },
  {
    key: 'pace',
    label: 'Pace médio',
    window: '15 dias',
    format: (v) => `${fmtPace(v)} /km`,
    lowerIsBetter: true,
  },
  { key: 'meditation', label: 'Meditação', window: '15 dias', format: (v) => `${fmtInt(v)} min` },
  { key: 'reading', label: 'Leitura', window: '15 dias', format: (v) => `${fmtInt(v)} páginas` },
]

export interface RankMetrics {
  containment: number
  volume: number
  /** So academia: soma de workout_sets validos na janela de 7 dias. */
  reps: number
  /** So CrossFit: reps feitas em WOD na janela de 15 dias. */
  wod: number
  km: number
  /** null = nenhuma corrida cronometrada na janela. */
  pace: number | null
  meditation: number
  reading: number
  relapses15d: number
  lastRelapse: DayKey | null
}

export const EMPTY_METRICS: RankMetrics = {
  containment: 0,
  volume: 0,
  reps: 0,
  wod: 0,
  km: 0,
  pace: null,
  meditation: 0,
  reading: 0,
  relapses15d: 0,
  lastRelapse: null,
}

export interface RequirementStatus {
  key: MetricKey
  label: string
  window: string
  target: number
  /** null so em `pace`, quando nao houve corrida cronometrada. */
  current: number | null
  met: boolean
  /** 0 a 100, para o medidor. */
  pct: number
  text: string
  targetText: string
  lowerIsBetter: boolean
}

export interface RankState {
  /** Nivel conquistado pelos numeros, antes da penalidade. */
  base: RankKey
  /** Nivel efetivo, ja com a penalidade de recaida. */
  current: RankKey
  currentIndex: number
  /** Quantos niveis a recaida derrubou: 0, 1 ou 2. */
  demotion: number
  next: RankKey | null
  /** Requisitos do proximo nivel — ou do MESTRE, quando ja esta no topo. */
  requirements: RequirementStatus[]
  metrics: RankMetrics
}

function statusFor(
  meta: MetricMeta,
  target: number,
  metrics: RankMetrics,
): RequirementStatus {
  const current = metrics[meta.key]
  const lower = Boolean(meta.lowerIsBetter)

  // Pace sem corrida cronometrada nao conta como cumprido. Dar de graca
  // esconderia justamente o que falta registrar.
  if (current === null) {
    return {
      key: meta.key,
      label: meta.label,
      window: meta.window,
      target,
      current: null,
      met: false,
      pct: 0,
      text: 'sem corrida cronometrada',
      targetText: meta.format(target),
      lowerIsBetter: lower,
    }
  }

  const met = lower ? current <= target : current >= target
  // No pace o progresso e o quanto o tempo ja baixou em direcao ao alvo.
  const pct = met ? 100 : lower ? Math.round((target / current) * 100) : Math.round((current / target) * 100)

  return {
    key: meta.key,
    label: meta.label,
    window: meta.window,
    target,
    current,
    met,
    pct: Math.max(0, Math.min(100, pct)),
    text: meta.format(current),
    targetText: meta.format(target),
    lowerIsBetter: lower,
  }
}

export function requirementsFor(rank: RankKey, metrics: RankMetrics): RequirementStatus[] {
  if (rank === 'lixo') return []
  const t = THRESHOLDS[rank]
  return METRICS.map((meta) => statusFor(meta, t[meta.key], metrics))
}

/** O maior nivel cujos requisitos estao todos cumpridos. */
function baseRank(metrics: RankMetrics): RankKey {
  let best: RankKey = 'lixo'
  for (const key of RANK_KEYS) {
    if (key === 'lixo') continue
    const ok = requirementsFor(key, metrics).every((r) => r.met)
    // Escada: parar no primeiro que falha evita conceder um nivel alto quando
    // um intermediario nao bate (o que so aconteceria com tabela nao monotona,
    // mas a trava e barata e documenta a intencao).
    if (!ok) break
    best = key
  }
  return best
}

export function computeRank(metrics: RankMetrics): RankState {
  const base = baseRank(metrics)
  const baseIndex = RANK_KEYS.indexOf(base)

  // Recaida derruba, sempre. Duas em menos de 15 dias derrubam o dobro.
  const demotion = metrics.relapses15d >= 2 ? 2 : metrics.relapses15d === 1 ? 1 : 0
  const currentIndex = Math.max(0, baseIndex - demotion)
  const current = RANK_KEYS[currentIndex]

  const next = currentIndex < RANK_KEYS.length - 1 ? RANK_KEYS[currentIndex + 1] : null

  return {
    base,
    current,
    currentIndex,
    demotion,
    next,
    requirements: requirementsFor(next ?? 'mestre', metrics),
    metrics,
  }
}

/**
 * Chave de comemoracao de um requisito.
 *
 * Inclui o nivel alvo porque a meta muda quando voce sobe: "volume >= 2.500"
 * (PRATA) e "volume >= 4.500" (PLATINA) sao conquistas diferentes, e as duas
 * merecem o confete.
 */
export function celebrationKey(rank: RankKey, metric: MetricKey): string {
  return `${rank}:${metric}`
}

// ---------------------------------------------------------------------------
// Extracao das metricas a partir das linhas cruas
// ---------------------------------------------------------------------------

const WEEK_WINDOW = 7
const LONG_WINDOW = 15

/** Dentro da janela e inclui hoje: `daysSince` de hoje e 0. */
const inWindow = (day: DayKey, days: number) => {
  const d = daysSince(day)
  return d >= 0 && d < days
}

export function buildMetrics(input: {
  habitLogs: HabitLogRow[]
  runs: RunRow[]
  sets: WorkoutSetRow[]
  /**
   * Repeticoes de WOD na janela de 15 dias (`wodRepsOf`).
   *
   * Metrica PROPRIA, nao somada em `reps`. Uma Cindy sao ~330 reps de peso
   * corporal contra ~17 reps de barra pesada num treino de academia: juntar
   * as duas numa metrica so fazia uma sessao de CrossFit valer sete semanas
   * de musculacao, e a regua deixava de medir qualquer coisa.
   *
   * Nao entra em `volume` tampouco — WOD nao tem carga registrada, e estimar
   * pelo peso corporal seria numero inventado.
   */
  wodReps?: number
  containmentStreak: number
}): RankMetrics {
  const { habitLogs, runs, sets, wodReps = 0, containmentStreak } = input

  let volume = 0
  let reps = 0
  for (const s of sets) {
    if (s.is_warmup) continue
    volume += (s.weight_kg ?? 0) * (s.reps ?? 0)
    reps += s.reps ?? 0
  }

  let km = 0
  let pacedKm = 0
  let pacedSec = 0
  for (const r of runs) {
    const dist = r.distance_km ?? 0
    if (inWindow(r.run_date, WEEK_WINDOW)) km += dist
    // Pace medio ponderado pela distancia, na janela longa. Media simples entre
    // corridas daria o mesmo peso a um tiro de 1 km e a um longao de 15 km.
    if (inWindow(r.run_date, LONG_WINDOW) && r.duration_min && dist > 0) {
      pacedKm += dist
      pacedSec += r.duration_min * 60
    }
  }

  let meditation = 0
  let reading = 0
  let relapses15d = 0
  let lastRelapse: DayKey | null = null

  for (const log of habitLogs) {
    if (log.habit_key === 'no_pmo' && !log.done) {
      if (inWindow(log.log_date, LONG_WINDOW)) relapses15d++
      if (!lastRelapse || log.log_date > lastRelapse) lastRelapse = log.log_date
      continue
    }
    if (!log.done) continue
    if (!inWindow(log.log_date, LONG_WINDOW)) continue
    if (log.habit_key === 'meditation') meditation += log.value ?? 0
    if (log.habit_key === 'reading') reading += log.value ?? 0
  }

  return {
    containment: Math.max(0, containmentStreak),
    volume: Math.round(volume),
    reps,
    wod: Math.max(0, Math.round(wodReps)),
    km: Math.round(km * 100) / 100,
    pace: pacedKm > 0 ? pacedSec / pacedKm : null,
    meditation: Math.round(meditation),
    reading: Math.round(reading),
    relapses15d,
    lastRelapse,
  }
}
