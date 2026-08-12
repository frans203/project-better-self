import type { HabitLogRow } from '@/shared/types/database.types'

/**
 * Tres estados, nao dois. `empty` (sem linha no banco) e diferente de `missed`
 * (registrado como nao feito) — a diferenca importa no heatmap e no streak:
 * dia sem registro nunca conta como falha.
 */
export type HabitState = 'done' | 'missed' | 'empty'

export function stateOf(log: HabitLogRow | undefined): HabitState {
  if (!log) return 'empty'
  return log.done ? 'done' : 'missed'
}
