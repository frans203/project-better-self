import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 12.4 -> "12,4" — numero curto em pt-BR, sem zeros a toa. */
export function fmtNumber(value: number, decimals = 1) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

/** 1234 -> "1.234" */
export function fmtInt(value: number) {
  return Math.round(value).toLocaleString('pt-BR')
}

/** Minutos -> "1h 24min" | "45min" */
export function fmtDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

/** Segundos por km -> "5:32" */
export function fmtPace(secondsPerKm: number) {
  if (!Number.isFinite(secondsPerKm) || secondsPerKm <= 0) return '--:--'
  const m = Math.floor(secondsPerKm / 60)
  const s = Math.round(secondsPerKm % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Hash estavel de string -> inteiro nao negativo.
 * Usado pra escolher a frase do dia de forma deterministica: a mesma data
 * sempre devolve a mesma frase, entao ela nao troca a cada re-render.
 */
export function hashString(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function pickByDate<T>(items: readonly T[], dateKey: string): T {
  return items[hashString(dateKey) % items.length]
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
