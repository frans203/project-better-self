import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { queryKeys } from '@/shared/lib/query-client'
import { getUserId } from '@/shared/lib/user'
import type {
  ExerciseRow,
  PersonalRecordRow,
  WorkoutRow,
  WorkoutSetRow,
} from '@/shared/types/database.types'
import type { DayKey } from '@/shared/lib/date'
import { showSnack } from '@/shared/components/ui'

export interface WorkoutWithSets extends WorkoutRow {
  workout_sets: WorkoutSetRow[]
}

export const exercisesQuery = () =>
  queryOptions({
    queryKey: queryKeys.exercises,
    queryFn: async (): Promise<ExerciseRow[]> => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('user_id', getUserId())
        .order('name')
      if (error) throw error
      return data ?? []
    },
    staleTime: 5 * 60_000,
  })

export const workoutsQuery = (from: DayKey, to: DayKey) =>
  queryOptions({
    queryKey: queryKeys.workoutsRange(from, to),
    queryFn: async (): Promise<WorkoutWithSets[]> => {
      const { data, error } = await supabase
        .from('workouts')
        .select('*, workout_sets(*)')
        .eq('user_id', getUserId())
        .gte('workout_date', from)
        .lte('workout_date', to)
        .order('workout_date', { ascending: false })

      if (error) throw error
      return (data ?? []) as unknown as WorkoutWithSets[]
    },
  })

export const personalRecordsQuery = () =>
  queryOptions({
    queryKey: queryKeys.personalRecords,
    queryFn: async (): Promise<PersonalRecordRow[]> => {
      const { data, error } = await supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', getUserId())
        .order('achieved_on', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })

/** Historico completo de um exercicio, para o grafico de progressao. */
export const exerciseHistoryQuery = (exerciseId: string) =>
  queryOptions({
    queryKey: queryKeys.exerciseHistory(exerciseId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_sets')
        .select('*, workouts(workout_date)')
        .eq('user_id', getUserId())
        .eq('exercise_id', exerciseId)
        .eq('is_warmup', false)
        .order('created_at', { ascending: true })

      if (error) throw error
      return (data ?? []) as unknown as (WorkoutSetRow & {
        workouts: { workout_date: string } | null
      })[]
    },
    enabled: Boolean(exerciseId),
  })

export function useCreateExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, muscleGroup }: { name: string; muscleGroup?: string | null }) => {
      const { data, error } = await supabase
        .from('exercises')
        .insert({ user_id: getUserId(), name: name.trim(), muscle_group: muscleGroup ?? null })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.exercises })
    },
    onError: (e: Error) => showSnack(e.message, 'fail'),
  })
}

export interface SetInput {
  exercise_id: string
  set_index: number
  weight_kg: number
  reps: number
  rpe?: number | null
  is_warmup?: boolean
}

export interface WorkoutInput {
  workout_date: DayKey
  split?: string | null
  duration_min?: number | null
  rpe?: number | null
  note?: string | null
  sets: SetInput[]
}

/**
 * Treino e series entram juntos: um treino sem serie nenhuma nao significa
 * nada aqui. Se a insercao das series falhar, o treino orfao e removido —
 * sem transacao no PostgREST, esse rollback manual e o que evita lixo.
 */
export function useCreateWorkout() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: WorkoutInput) => {
      const { sets, ...workout } = input

      const { data: created, error } = await supabase
        .from('workouts')
        .insert({ ...workout, user_id: getUserId() })
        .select()
        .single()
      if (error) throw error

      if (sets.length > 0) {
        const { error: setsError } = await supabase.from('workout_sets').insert(
          sets.map((s) => ({
            ...s,
            user_id: getUserId(),
            workout_id: created.id,
            is_warmup: s.is_warmup ?? false,
          })),
        )
        if (setsError) {
          await supabase.from('workouts').delete().eq('id', created.id)
          throw setsError
        }
      }

      return created
    },

    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.workouts })
      void qc.invalidateQueries({ queryKey: queryKeys.habitLogs })
      void qc.invalidateQueries({ queryKey: queryKeys.personalRecords })
      void qc.invalidateQueries({ queryKey: queryKeys.exercises })
    },
    onError: (e: Error) => showSnack(e.message, 'fail'),
  })
}

export function useDeleteWorkout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workouts').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.workouts })
      void qc.invalidateQueries({ queryKey: queryKeys.habitLogs })
      void qc.invalidateQueries({ queryKey: queryKeys.personalRecords })
      showSnack('Treino removido', 'info')
    },
    onError: (e: Error) => showSnack(e.message, 'fail'),
  })
}

/** Epley — mesma formula da coluna gerada no banco. */
export function e1rm(weightKg: number, reps: number): number {
  return Math.round(weightKg * (1 + reps / 30) * 100) / 100
}

export function volumeOf(sets: WorkoutSetRow[]): number {
  return sets.filter((s) => !s.is_warmup).reduce((acc, s) => acc + s.weight_kg * s.reps, 0)
}
