import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { queryKeys } from '@/shared/lib/query-client'
import { getUserId } from '@/shared/lib/user'
import type { HabitLogRow } from '@/shared/types/database.types'
import type { HabitKey } from '@/shared/constants/habits'
import type { DayKey } from '@/shared/lib/date'
import { showSnack } from '@/shared/components/ui'

/**
 * Uma unica query cobre a janela inteira que o app precisa (365 dias) e todas
 * as telas leem dela. Volume e pequeno — no maximo 5 habitos x 365 dias — entao
 * uma leitura por sessao sai mais barata que uma query por tela, e o heatmap,
 * os streaks e o check-in nunca discordam entre si.
 */
export const habitLogsQuery = (from: DayKey, to: DayKey) =>
  queryOptions({
    queryKey: queryKeys.habitLogsRange(from, to),
    queryFn: async (): Promise<HabitLogRow[]> => {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', getUserId())
        .gte('log_date', from)
        .lte('log_date', to)
        .order('log_date', { ascending: false })

      if (error) throw error
      return data ?? []
    },
  })

export interface UpsertHabitInput {
  habitKey: HabitKey
  date: DayKey
  done: boolean
  value?: number | null
  note?: string | null
  relapseTrigger?: string | null
}

export function useUpsertHabitLog(rangeKey: readonly unknown[]) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpsertHabitInput): Promise<HabitLogRow> => {
      const { data, error } = await supabase
        .from('habit_logs')
        .upsert(
          {
            user_id: getUserId(),
            habit_key: input.habitKey,
            log_date: input.date,
            done: input.done,
            value: input.value ?? null,
            note: input.note ?? null,
            relapse_trigger: input.relapseTrigger ?? null,
          },
          { onConflict: 'user_id,habit_key,log_date' },
        )
        .select()
        .single()

      if (error) throw error
      return data
    },

    // Optimistic: o toggle e a interacao mais frequente do app inteiro.
    // Esperar o round-trip faria o check-in parecer travado.
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: rangeKey })
      const previous = qc.getQueryData<HabitLogRow[]>(rangeKey)

      qc.setQueryData<HabitLogRow[]>(rangeKey, (old = []) => {
        const idx = old.findIndex(
          (l) => l.habit_key === input.habitKey && l.log_date === input.date,
        )
        const optimistic: HabitLogRow = {
          id: idx >= 0 ? old[idx].id : `optimistic-${input.habitKey}-${input.date}`,
          user_id: getUserId(),
          habit_key: input.habitKey,
          log_date: input.date,
          done: input.done,
          value: input.value ?? null,
          note: input.note ?? null,
          relapse_trigger: input.relapseTrigger ?? null,
          created_at: idx >= 0 ? old[idx].created_at : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        if (idx >= 0) {
          const next = [...old]
          next[idx] = optimistic
          return next
        }
        return [optimistic, ...old]
      })

      return { previous }
    },

    onError: (error: Error, _input, context) => {
      if (context?.previous) qc.setQueryData(rangeKey, context.previous)
      showSnack(`Falha ao salvar: ${error.message}`, 'fail')
    },

    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.habitLogs })
    },
  })
}

export function useDeleteHabitLog(rangeKey: readonly unknown[]) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ habitKey, date }: { habitKey: HabitKey; date: DayKey }) => {
      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('user_id', getUserId())
        .eq('habit_key', habitKey)
        .eq('log_date', date)
      if (error) throw error
    },

    onMutate: async ({ habitKey, date }) => {
      await qc.cancelQueries({ queryKey: rangeKey })
      const previous = qc.getQueryData<HabitLogRow[]>(rangeKey)
      qc.setQueryData<HabitLogRow[]>(rangeKey, (old = []) =>
        old.filter((l) => !(l.habit_key === habitKey && l.log_date === date)),
      )
      return { previous }
    },

    onError: (error: Error, _input, context) => {
      if (context?.previous) qc.setQueryData(rangeKey, context.previous)
      showSnack(`Falha ao limpar: ${error.message}`, 'fail')
    },

    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.habitLogs })
    },
  })
}
