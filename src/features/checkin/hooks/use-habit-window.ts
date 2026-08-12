import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { habitLogsQuery } from '../api/habit-api'
import { queryKeys } from '@/shared/lib/query-client'
import { shiftDay, todayKey } from '@/shared/lib/date'

/** Um ano cobre heatmap, streaks e todos os recortes de periodo do relatorio. */
export const WINDOW_DAYS = 365

/**
 * Janela unica de dados de habitos, compartilhada por todas as telas.
 * As chaves sao memoizadas com base no dia — sem isso, cada render geraria
 * uma queryKey nova e o cache do TanStack nunca acertaria.
 */
export function useHabitWindow() {
  const to = todayKey()
  const from = useMemo(() => shiftDay(to, -(WINDOW_DAYS - 1)), [to])
  const rangeKey = useMemo(() => queryKeys.habitLogsRange(from, to), [from, to])

  const query = useQuery(habitLogsQuery(from, to))

  return { ...query, logs: query.data ?? [], rangeKey, from, to }
}
