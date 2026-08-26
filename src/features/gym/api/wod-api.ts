import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { queryKeys } from '@/shared/lib/query-client'
import { getUserId } from '@/shared/lib/user'
import { showSnack } from '@/shared/components/ui'
import type { DayKey } from '@/shared/lib/date'
import type { WodMovement, WodRow, WodScoring } from '@/shared/types/database.types'

export const wodsQuery = () =>
  queryOptions({
    queryKey: queryKeys.wods,
    queryFn: async (): Promise<WodRow[]> => {
      const { data, error } = await supabase
        .from('wods')
        .select('*')
        .eq('user_id', getUserId())
        .order('name')
      if (error) throw error
      // `movements` e jsonb: o supabase-js devolve o valor cru. Um WOD gravado
      // com o campo vazio viria null e quebraria todo .map() na tela.
      return (data ?? []).map((w) => ({ ...w, movements: w.movements ?? [] }))
    },
    staleTime: 5 * 60_000,
  })

export interface WodDefinitionInput {
  name: string
  scoring: WodScoring
  time_cap_min: number | null
  reps_per_round: number | null
  movements: WodMovement[]
  description: string | null
  is_benchmark: boolean
}

/**
 * Devolve o WOD com esse nome, criando se ainda nao existir.
 *
 * E o que faz o benchmark do catalogo virar linha no banco na primeira vez que
 * voce registra. O indice unico e case-insensitive, entao "cindy" e "Cindy"
 * resolvem para a mesma linha em vez de duplicar.
 */
export function useResolveWod() {
  const qc = useQueryClient()

  return async (input: WodDefinitionInput, known: WodRow[]): Promise<WodRow> => {
    const key = input.name.trim().toLowerCase()
    const hit = known.find((w) => w.name.trim().toLowerCase() === key)
    if (hit) return hit

    const { data, error } = await supabase
      .from('wods')
      .insert({
        user_id: getUserId(),
        name: input.name.trim(),
        scoring: input.scoring,
        time_cap_min: input.time_cap_min,
        reps_per_round: input.reps_per_round,
        movements: input.movements,
        description: input.description,
        is_benchmark: input.is_benchmark,
      })
      .select()
      .single()
    if (error) throw error

    void qc.invalidateQueries({ queryKey: queryKeys.wods })
    return { ...data, movements: data.movements ?? [] }
  }
}

export interface WodWorkoutInput {
  workout_date: DayKey
  wod_id: string
  /** Vai para workouts.split — e o que a lista de sessoes mostra como titulo. */
  wod_name: string
  duration_min: number | null
  rpe: number | null
  rounds: number | null
  extra_reps: number | null
  duration_sec: number | null
  reps_per_round: number | null
  scaled: boolean
  note: string | null
}

/**
 * Grava o WOD como um `workouts` de kind='wod' mais a linha de resultado.
 *
 * Passa por `workouts` de proposito: e o que faz o trigger do banco marcar o
 * habito 'Treino' do dia sem entrada dupla, exatamente como ja acontece com
 * musculacao. Se a segunda insercao falhar, o workout orfao e removido — sem
 * transacao no PostgREST, esse rollback manual e o que evita lixo, mesma
 * estrategia do useCreateWorkout.
 */
export function useCreateWodWorkout() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: WodWorkoutInput) => {
      const { data: created, error } = await supabase
        .from('workouts')
        .insert({
          user_id: getUserId(),
          workout_date: input.workout_date,
          kind: 'wod',
          split: input.wod_name,
          duration_min: input.duration_min,
          rpe: input.rpe,
          note: input.note,
        })
        .select()
        .single()
      if (error) throw error

      const { error: resultError } = await supabase.from('wod_results').insert({
        user_id: getUserId(),
        workout_id: created.id,
        wod_id: input.wod_id,
        rounds: input.rounds,
        extra_reps: input.extra_reps,
        duration_sec: input.duration_sec,
        reps_per_round: input.reps_per_round,
        scaled: input.scaled,
        note: null,
      })
      if (resultError) {
        await supabase.from('workouts').delete().eq('id', created.id)
        throw resultError
      }

      return created
    },

    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.workouts })
      void qc.invalidateQueries({ queryKey: queryKeys.habitLogs })
      void qc.invalidateQueries({ queryKey: queryKeys.wods })
      showSnack('WOD registrado')
    },
    onError: (e: Error) => showSnack(e.message, 'fail'),
  })
}

/** "12 rounds + 7" | "13:42" — o placar do WOD em uma linha. */
export function formatWodScore(r: {
  rounds: number | null
  extra_reps: number | null
  duration_sec: number | null
}): string {
  if (r.duration_sec && r.duration_sec > 0) {
    const m = Math.floor(r.duration_sec / 60)
    const s = r.duration_sec % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }
  const rounds = r.rounds ?? 0
  const extra = r.extra_reps ?? 0
  if (rounds === 0 && extra === 0) return 'sem placar'
  return extra > 0 ? `${rounds} rounds + ${extra}` : `${rounds} rounds`
}
