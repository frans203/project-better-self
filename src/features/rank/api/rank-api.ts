import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { shiftDay, todayKey } from '@/shared/lib/date'
import { streakFor } from '@/shared/lib/streaks'
import { buildMetrics, computeRank, EMPTY_METRICS, type RankState } from '@/shared/lib/rank'
import { profileQuery } from '@/features/profile/api/profile-api'
import { useHabitWindow } from '@/features/checkin/hooks/use-habit-window'
import { runsQuery } from '@/features/running/api/running-api'
import { setsOf, wodRepsOf, wodResultOf, workoutsQuery } from '@/features/gym/api/gym-api'

/** Pace, meditacao e leitura olham 15 dias; volume, reps e km olham 7. */
const LONG_WINDOW = 15
const WEEK_WINDOW = 7

/**
 * Junta as tres fontes que o nivel precisa.
 *
 * habit_logs sozinho nao basta: ele tem km e minutos, mas nao tem carga nem
 * repeticao (isso vive em workout_sets) nem duracao de corrida (que vive em
 * runs e e o que da o pace). Sao duas queries a mais, ambas curtas.
 */
export function useRank(): { rank: RankState; isPending: boolean; isError: boolean } {
  const today = todayKey()
  const longFrom = useMemo(() => shiftDay(today, -(LONG_WINDOW - 1)), [today])
  const weekFrom = useMemo(() => shiftDay(today, -(WEEK_WINDOW - 1)), [today])

  const { logs, isPending: logsPending, isError } = useHabitWindow()
  const { data: profile } = useQuery(profileQuery())
  const { data: runs = [], isPending: runsPending } = useQuery(runsQuery(longFrom, today))
  /*
    Busca 15 dias de treino, nao 7: academia e WOD tem janelas diferentes
    (7 e 15 dias). Uma consulta so, filtrada por data depois — duas consultas
    sobrepostas gastariam duas idas ao banco pelo mesmo periodo.
  */
  const { data: workouts = [], isPending: workoutsPending } = useQuery(
    workoutsQuery(longFrom, today),
  )

  const rank = useMemo(() => {
    const startDate = profile?.start_date ?? today
    const containment = streakFor('no_pmo', logs, startDate).current

    // Academia: so os 7 dias. WOD nao aparece aqui — nao tem workout_sets, e
    // setsOf devolve [] em vez de estourar.
    const sets = workouts
      .filter((w) => w.workout_date >= weekFrom)
      .flatMap((w) => setsOf(w))

    // CrossFit: os 15 dias inteiros, porque WOD aqui nao e semanal. Metrica
    // propria — nao entra nas reps de academia.
    const wodReps = workouts.reduce((acc, w) => acc + wodRepsOf(wodResultOf(w)), 0)

    return computeRank(
      buildMetrics({ habitLogs: logs, runs, sets, wodReps, containmentStreak: containment }),
    )
  }, [logs, runs, workouts, profile?.start_date, today, weekFrom])

  return {
    rank,
    isPending: logsPending || runsPending || workoutsPending,
    isError,
  }
}

/** Estado neutro para renderizar a tela enquanto os dados nao chegaram. */
export const PENDING_RANK: RankState = computeRank(EMPTY_METRICS)
