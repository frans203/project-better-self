import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { queryKeys } from '@/shared/lib/query-client'
import { getUserId } from '@/shared/lib/user'
import type {
  ExerciseRow,
  PersonalRecordRow,
  WodResultRow,
  WodRow,
  WorkoutKind,
  WorkoutRow,
  WorkoutSetRow,
} from '@/shared/types/database.types'
import type { DayKey } from '@/shared/lib/date'
import { showSnack } from '@/shared/components/ui'

export type WodResultWithWod = WodResultRow & {
  wods: Pick<WodRow, 'name' | 'scoring' | 'time_cap_min'> | null
}

export interface WorkoutWithSets extends WorkoutRow {
  workout_sets: WorkoutSetRow[]
  /** Presente so quando kind = 'wod'. Normalizado por `wodResultOf`. */
  wod_results?: WodResultWithWod | WodResultWithWod[] | null
}

/**
 * Series validas de um treino, tolerante a linha antiga.
 *
 * Treino de WOD nao tem workout_sets, e o PostgREST devolve o campo ausente
 * em vez de array vazio quando o embed nao casa. Todo consumidor passa por
 * aqui para nunca chamar .filter em undefined.
 */
export function setsOf(w: Pick<WorkoutWithSets, 'workout_sets'>): WorkoutSetRow[] {
  return w.workout_sets ?? []
}

/**
 * O resultado do WOD, venha ele como objeto ou como array.
 *
 * `wod_results.workout_id` e UNIQUE, entao o PostgREST costuma detectar
 * one-to-one e devolver objeto — mas isso mudou entre versoes e volta a ser
 * array dependendo do plano. Normalizar aqui evita a tela quebrar quando o
 * formato troca.
 */
export function wodResultOf(w: WorkoutWithSets): WodResultWithWod | null {
  const r = w.wod_results
  if (!r) return null
  return Array.isArray(r) ? (r[0] ?? null) : r
}

/** Treino de academia = tem serie. Dado gravado antes da 0003 le como 'gym'. */
export function isGymWorkout(w: Pick<WorkoutRow, 'kind'>): boolean {
  return (w.kind ?? 'gym') === 'gym'
}

/** Erro do PostgREST em formato util — `code` nem sempre vem preenchido. */
type PgError = { code?: string; message?: string }

/**
 * O banco ainda nao conhece essa coluna?
 *
 * 42703 e o erro do Postgres; PGRST204 e a versao do PostgREST quando o
 * schema cache nao tem o campo. Os dois aparecem enquanto a 0003 nao roda.
 */
export function isMissingColumn(error: PgError, column: string): boolean {
  if (error.code === '42703' || error.code === 'PGRST204') {
    return !error.message || error.message.includes(column)
  }
  return false
}

/** A tabela inteira ainda nao existe (0003 nao rodou). */
export function isMissingTable(error: PgError): boolean {
  return error.code === 'PGRST205' || error.code === '42P01' || error.code === 'PGRST200'
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
      const base = () =>
        supabase
          .from('workouts')
          .select('*, workout_sets(*)')
          .eq('user_id', getUserId())
          .gte('workout_date', from)
          .lte('workout_date', to)
          .order('workout_date', { ascending: false })

      // wod_results vem junto para a lista de sessoes conseguir resumir um WOD
      // sem uma segunda ida ao banco. Treino de academia devolve null.
      const { data, error } = await supabase
        .from('workouts')
        .select('*, workout_sets(*), wod_results(*, wods(name, scoring, time_cap_min))')
        .eq('user_id', getUserId())
        .gte('workout_date', from)
        .lte('workout_date', to)
        .order('workout_date', { ascending: false })

      if (error) {
        /*
          Antes da 0003 rodar, `wod_results` nao existe e o PostgREST recusa o
          embed inteiro (PGRST200) — o que derrubaria academia, home e nivel de
          uma vez. Cair para a consulta sem WOD mantem tudo que ja existia
          funcionando, e o WOD aparece sozinho assim que a migracao rodar.
        */
        if (!isMissingTable(error)) throw error

        const fallback = await base()
        if (fallback.error) throw fallback.error
        return (fallback.data ?? []) as unknown as WorkoutWithSets[]
      }

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
  kind?: WorkoutKind
  split?: string | null
  duration_min?: number | null
  rpe?: number | null
  note?: string | null
  sets: SetInput[]
}

/**
 * Garante que todo nome da lista tenha um exercicio no banco, e devolve o
 * mapa nome-normalizado -> id.
 *
 * Os que faltam sao criados em paralelo. Antes isso era um `await` por
 * exercicio dentro de um for, entao um treino com seis exercicios novos
 * custava seis viagens em fila antes de o treino comecar a ser gravado —
 * era boa parte da demora que fazia o modal parecer travado.
 */
export function useResolveExercises() {
  const qc = useQueryClient()

  return async (names: string[], known: Map<string, string>): Promise<Map<string, string>> => {
    const resolved = new Map(known)
    const missing = [...new Set(names.map((n) => n.trim()).filter(Boolean))].filter(
      (n) => !resolved.has(n.toLowerCase()),
    )
    if (missing.length === 0) return resolved

    const created = await Promise.all(
      missing.map(async (name) => {
        const { data, error } = await supabase
          .from('exercises')
          .insert({ user_id: getUserId(), name, muscle_group: null })
          .select()
          .single()
        if (error) throw error
        return data
      }),
    )
    for (const ex of created) resolved.set(ex.name.trim().toLowerCase(), ex.id)

    void qc.invalidateQueries({ queryKey: queryKeys.exercises })
    return resolved
  }
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

      let { data: created, error } = await supabase
        .from('workouts')
        .insert({ ...workout, user_id: getUserId() })
        .select()
        .single()

      /*
        Antes da 0003 rodar a coluna `kind` nao existe, e o PostgREST recusa o
        insert inteiro (42703 / PGRST204) — o que quebrava ate o registro de
        musculacao, que nao tem nada a ver com WOD. Regravar sem o campo mantem
        o fluxo antigo funcionando; a linha nasce 'gym' de qualquer forma assim
        que o DEFAULT existir.
      */
      if (error && isMissingColumn(error, 'kind')) {
        const { kind: _kind, ...withoutKind } = workout
        void _kind
        ;({ data: created, error } = await supabase
          .from('workouts')
          .insert({ ...withoutKind, user_id: getUserId() })
          .select()
          .single())
      }

      if (error) throw error
      if (!created) throw new Error('Treino não foi criado.')

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

export function volumeOf(sets: WorkoutSetRow[] | undefined | null): number {
  return (sets ?? [])
    .filter((s) => !s.is_warmup)
    .reduce((acc, s) => acc + s.weight_kg * s.reps, 0)
}

/** Repeticoes validas somadas. Alimenta o requisito de reps do ranking. */
export function repsOf(sets: WorkoutSetRow[] | undefined | null): number {
  return (sets ?? []).filter((s) => !s.is_warmup).reduce((acc, s) => acc + s.reps, 0)
}

/**
 * Agrupa series consecutivas identicas: 4 linhas de 60kg x 10 viram
 * "4 x 10 x 60kg". Base tanto da lista de sessoes quanto do modo bloco do
 * formulario.
 *
 * Consecutivas, nao todas: 3x10 seguidas de 2x8 e depois mais 1x10 no mesmo
 * exercicio sao tres blocos, na ordem em que foram feitos. Agrupar tudo por
 * (peso, reps) embaralharia a ordem de uma piramide.
 */
export interface SetGroup {
  exercise_id: string
  weight_kg: number
  reps: number
  is_warmup: boolean
  count: number
}

export function groupSets(sets: WorkoutSetRow[] | undefined | null): SetGroup[] {
  const ordered = [...(sets ?? [])].sort((a, b) => a.set_index - b.set_index)
  const out: SetGroup[] = []
  for (const s of ordered) {
    const last = out[out.length - 1]
    if (
      last &&
      last.exercise_id === s.exercise_id &&
      last.weight_kg === s.weight_kg &&
      last.reps === s.reps &&
      last.is_warmup === s.is_warmup
    ) {
      last.count++
    } else {
      out.push({
        exercise_id: s.exercise_id,
        weight_kg: s.weight_kg,
        reps: s.reps,
        is_warmup: s.is_warmup,
        count: 1,
      })
    }
  }
  return out
}
