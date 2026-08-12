import type { HabitLogRow } from '@/shared/types/database.types'
import { daysSince, shiftDay, todayKey, type DayKey } from './date'

export interface StreakInfo {
  /** Dias corridos ate hoje. */
  current: number
  /** Maior sequencia ja registrada. */
  best: number
  /** Data em que a sequencia atual comecou. null se nunca comecou. */
  since: DayKey | null
  /** Data da ultima quebra (recaida ou dia perdido). */
  lastBreak: DayKey | null
}

const EMPTY: StreakInfo = { current: 0, best: 0, since: null, lastBreak: null }

/**
 * Habito de abstinencia (no_pmo).
 *
 * A regra e diferente dos outros de proposito: aqui voce esta limpo ate
 * registrar o contrario. Dia sem marcacao NAO quebra a sequencia — se
 * quebrasse, esquecer de abrir o app viraria uma recaida falsa, e o numero
 * deixaria de significar qualquer coisa.
 */
export function abstinenceStreak(logs: HabitLogRow[], startDate: DayKey): StreakInfo {
  const relapses = logs
    .filter((l) => !l.done)
    .map((l) => l.log_date)
    .sort()

  const today = todayKey()

  if (relapses.length === 0) {
    const current = Math.max(0, daysSince(startDate))
    return { current, best: current, since: startDate, lastBreak: null }
  }

  const lastRelapse = relapses[relapses.length - 1]
  const since = shiftDay(lastRelapse, 1)
  const current = Math.max(0, daysSince(lastRelapse))

  // Melhor sequencia: maior intervalo entre inicio/recaidas consecutivas.
  let best = Math.max(0, daysSince(startDate) - daysSince(relapses[0]))
  for (let i = 1; i < relapses.length; i++) {
    const gap = daysSince(relapses[i - 1]) - daysSince(relapses[i])
    if (gap > best) best = gap
  }
  if (current > best) best = current

  return { current, best, since: since > today ? today : since, lastBreak: lastRelapse }
}

/**
 * Habito comum (meditacao, leitura, corrida, treino).
 *
 * Aqui dia sem registro quebra mesmo — a sequencia mede o que voce fez.
 * Hoje ainda nao conta como quebra: a sequencia sobrevive ate o fim do dia.
 */
export function activityStreak(logs: HabitLogRow[]): StreakInfo {
  const done = new Set(logs.filter((l) => l.done).map((l) => l.log_date))
  if (done.size === 0) return EMPTY

  const today = todayKey()
  const yesterday = shiftDay(today, -1)

  let cursor = done.has(today) ? today : yesterday
  let current = 0
  let since: DayKey | null = null

  while (done.has(cursor)) {
    current++
    since = cursor
    cursor = shiftDay(cursor, -1)
  }

  const sorted = [...done].sort()
  let best = 0
  let run = 0
  let prev: DayKey | null = null
  for (const day of sorted) {
    run = prev && shiftDay(prev, 1) === day ? run + 1 : 1
    if (run > best) best = run
    prev = day
  }

  return { current, best, since, lastBreak: since ? shiftDay(since, -1) : null }
}

export function streakFor(
  habitKey: string,
  logs: HabitLogRow[],
  startDate: DayKey,
): StreakInfo {
  const scoped = logs.filter((l) => l.habit_key === habitKey)
  return habitKey === 'no_pmo' ? abstinenceStreak(scoped, startDate) : activityStreak(scoped)
}

/** Percentual de dias cumpridos dentro de uma janela de N dias. */
export function consistency(logs: HabitLogRow[], windowDays: number): number {
  if (windowDays <= 0) return 0
  const done = logs.filter((l) => l.done && daysSince(l.log_date) < windowDays).length
  return Math.min(100, Math.round((done / windowDays) * 100))
}

export function sumValue(logs: HabitLogRow[]): number {
  return logs.reduce((acc, l) => acc + (l.value ?? 0), 0)
}
