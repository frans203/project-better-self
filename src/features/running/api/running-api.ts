import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { queryKeys } from '@/shared/lib/query-client'
import { getUserId } from '@/shared/lib/user'
import type { RunRow } from '@/shared/types/database.types'
import type { DayKey } from '@/shared/lib/date'
import { showSnack } from '@/shared/components/ui'

export const runsQuery = (from: DayKey, to: DayKey) =>
  queryOptions({
    queryKey: queryKeys.runsRange(from, to),
    queryFn: async (): Promise<RunRow[]> => {
      const { data, error } = await supabase
        .from('runs')
        .select('*')
        .eq('user_id', getUserId())
        .gte('run_date', from)
        .lte('run_date', to)
        .order('run_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
  })

export interface RunInput {
  run_date: DayKey
  distance_km: number
  duration_min?: number | null
  route?: string | null
  feeling?: number | null
  note?: string | null
}

/**
 * Um trigger no banco marca o habito `running` do dia a partir daqui, entao
 * toda mutation de corrida precisa invalidar habit_logs tambem — senao o
 * check-in continua mostrando o dia em branco ate o proximo reload.
 */
function invalidateRunRelated(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: queryKeys.runs })
  void qc.invalidateQueries({ queryKey: queryKeys.habitLogs })
}

export function useCreateRun() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: RunInput) => {
      const { data, error } = await supabase
        .from('runs')
        .insert({ ...input, user_id: getUserId() })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      invalidateRunRelated(qc)
      showSnack('Corrida registrada')
    },
    onError: (e: Error) => showSnack(e.message, 'fail'),
  })
}

export function useUpdateRun() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }: RunInput & { id: string }) => {
      const { data, error } = await supabase
        .from('runs')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      invalidateRunRelated(qc)
      showSnack('Corrida atualizada')
    },
    onError: (e: Error) => showSnack(e.message, 'fail'),
  })
}

export function useDeleteRun() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('runs').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      invalidateRunRelated(qc)
      showSnack('Corrida removida', 'info')
    },
    onError: (e: Error) => showSnack(e.message, 'fail'),
  })
}

/** Segundos por km. null quando nao houve cronometragem. */
export function paceOf(run: Pick<RunRow, 'distance_km' | 'duration_min'>): number | null {
  if (!run.duration_min || run.distance_km <= 0) return null
  return (run.duration_min * 60) / run.distance_km
}
