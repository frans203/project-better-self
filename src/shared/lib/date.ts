import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
  subDays,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * String de dia no formato do banco (coluna `date`).
 *
 * ATENCAO: nunca usar toISOString().slice(0,10) para isso. toISOString converte
 * para UTC, entao depois das 21h no horario de Brasilia ele devolve o dia
 * seguinte e o check-in cai na data errada. format() do date-fns e local.
 */
export type DayKey = string // 'yyyy-MM-dd'

export function toDayKey(date: Date = new Date()): DayKey {
  return format(date, 'yyyy-MM-dd')
}

export function fromDayKey(key: DayKey): Date {
  return parseISO(key)
}

export function todayKey(): DayKey {
  return toDayKey(new Date())
}

export function isToday(key: DayKey) {
  return key === todayKey()
}

export function isFuture(key: DayKey) {
  return key > todayKey()
}

export function shiftDay(key: DayKey, days: number): DayKey {
  return toDayKey(addDays(fromDayKey(key), days))
}

/** '2026-08-12' -> 'ter, 12 ago' */
export function fmtDayShort(key: DayKey) {
  return format(fromDayKey(key), "EEE, dd MMM", { locale: ptBR })
}

/** '2026-08-12' -> '12 de agosto de 2026' */
export function fmtDayLong(key: DayKey) {
  return format(fromDayKey(key), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

/** 'Hoje' | 'Ontem' | 'ter, 12 ago' */
export function fmtDayRelative(key: DayKey) {
  const diff = differenceInCalendarDays(new Date(), fromDayKey(key))
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Ontem'
  if (diff === -1) return 'Amanha'
  return fmtDayShort(key)
}

/** Semana comecando na segunda, como toda planilha de treino. */
export function weekRange(reference: Date = new Date()) {
  const start = startOfWeek(reference, { weekStartsOn: 1 })
  const end = endOfWeek(reference, { weekStartsOn: 1 })
  return { start, end, startKey: toDayKey(start), endKey: toDayKey(end) }
}

export function lastNDays(n: number, reference: Date = new Date()): DayKey[] {
  const end = reference
  const start = subDays(end, n - 1)
  return eachDayOfInterval({ start, end }).map(toDayKey)
}

export function daysBetween(a: DayKey, b: DayKey) {
  return Math.abs(differenceInCalendarDays(fromDayKey(a), fromDayKey(b)))
}

export function daysSince(key: DayKey) {
  return differenceInCalendarDays(new Date(), fromDayKey(key))
}
