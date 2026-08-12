import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ChevronRight, Dumbbell, Plus, Trash2, Trophy } from 'lucide-react'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Loading,
  SectionLabel,
  StatCard,
  Tabs,
} from '@/shared/components/ui'
import { fmtDayShort, shiftDay, todayKey, weekRange } from '@/shared/lib/date'
import { fmtNumber, fmtInt } from '@/shared/lib/utils'
import {
  exercisesQuery,
  personalRecordsQuery,
  useDeleteWorkout,
  volumeOf,
  workoutsQuery,
  type WorkoutWithSets,
} from '../api/gym-api'
import { WorkoutFormModal } from './WorkoutFormModal'

type Tab = 'sessions' | 'exercises' | 'records'

export function GymPage() {
  const to = todayKey()
  const from = useMemo(() => shiftDay(to, -364), [to])

  const { data: workouts = [], isPending, isError, error } = useQuery(workoutsQuery(from, to))
  const { data: exercises = [] } = useQuery(exercisesQuery())
  const { data: prs = [] } = useQuery(personalRecordsQuery())

  const [tab, setTab] = useState<Tab>('sessions')
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<WorkoutWithSets | null>(null)
  const remove = useDeleteWorkout()

  const week = weekRange()
  const weekCount = workouts.filter(
    (w) => w.workout_date >= week.startKey && w.workout_date <= week.endKey,
  ).length

  const totalVolume = workouts.reduce((acc, w) => acc + volumeOf(w.workout_sets ?? []), 0)
  const totalSets = workouts.reduce(
    (acc, w) => acc + (w.workout_sets ?? []).filter((s) => !s.is_warmup).length,
    0,
  )

  /** Melhor PR por exercicio — a lista de recordes mostra o topo, nao o historico. */
  const bestPrs = useMemo(() => {
    const map = new Map<string, (typeof prs)[number]>()
    for (const pr of prs) {
      const current = map.get(pr.exercise_id)
      if (!current || pr.e1rm > current.e1rm) map.set(pr.exercise_id, pr)
    }
    return [...map.values()].sort((a, b) => b.e1rm - a.e1rm)
  }, [prs])

  const exerciseName = (id: string) => exercises.find((e) => e.id === id)?.name ?? 'Exercicio'

  return (
    <div className="page-section mx-auto w-full max-w-4xl">
      <PageHeader
        title="Academia"
        subtitle={`${weekCount} treinos nesta semana`}
        action={
          <Button variant="solid" size="sm" onClick={() => setFormOpen(true)}>
            <Plus />
            Treino
          </Button>
        }
      />

      {isError ? (
        <ErrorState error={error} />
      ) : isPending ? (
        <Loading label="Lendo treinos" />
      ) : (
        <div className="flex flex-col gap-6 boot-up">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Treinos 12m" value={workouts.length} unit="sessoes" />
            <StatCard label="Semana" value={weekCount} unit="treinos" />
            <StatCard label="Series validas" value={fmtInt(totalSets)} unit="series" />
            <StatCard label="Volume total" value={fmtInt(totalVolume)} unit="kg" />
          </div>

          <Tabs
            label="Secoes da academia"
            value={tab}
            onChange={setTab}
            items={[
              { value: 'sessions', label: 'Sessoes' },
              { value: 'exercises', label: 'Exercicios' },
              { value: 'records', label: 'Recordes' },
            ]}
          />

          {tab === 'sessions' &&
            (workouts.length === 0 ? (
              <EmptyState
                icon={Dumbbell}
                title="Nenhum treino"
                description="Registre o primeiro. Carga e reps de cada serie viram o grafico de progressao."
                action={
                  <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
                    <Plus />
                    Registrar treino
                  </Button>
                }
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {workouts.map((w) => {
                  const sets = (w.workout_sets ?? []).filter((s) => !s.is_warmup)
                  return (
                    <li key={w.id} className="entry-card flex items-center gap-4 p-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display text-sm text-white">
                            {w.split || 'Treino'}
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.15em] text-text-muted">
                            {fmtDayShort(w.workout_date)}
                          </span>
                          {w.rpe && <Badge>RPE {w.rpe}</Badge>}
                        </div>
                        <p className="mt-1 text-[11px] text-text-secondary">
                          {sets.length} series · {fmtInt(volumeOf(w.workout_sets ?? []))} kg de volume
                          {w.duration_min ? ` · ${w.duration_min}min` : ''}
                        </p>
                        {w.note && (
                          <p className="mt-1.5 line-clamp-2 text-[11px] text-text-muted">{w.note}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setDeleting(w)}
                        aria-label="Remover treino"
                        className="shrink-0 cursor-pointer p-2 text-text-muted transition-colors hover:text-fail"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            ))}

          {tab === 'exercises' &&
            (exercises.length === 0 ? (
              <EmptyState
                icon={Dumbbell}
                title="Nenhum exercicio"
                description="Exercicios sao criados sozinhos quando voce digita o nome ao registrar um treino."
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {exercises.map((ex) => {
                  const best = bestPrs.find((p) => p.exercise_id === ex.id)
                  return (
                    <li key={ex.id}>
                      <Link
                        to={`/gym/exercise/${ex.id}`}
                        className="entry-card flex items-center gap-4 p-4 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] text-text-primary">{ex.name}</p>
                          <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-text-muted">
                            {best
                              ? `Melhor ${fmtNumber(best.e1rm, 1)} kg e1RM · ${fmtNumber(best.weight_kg, 1)}kg x ${best.reps}`
                              : 'Sem recorde ainda'}
                          </p>
                        </div>
                        <ChevronRight className="size-4 shrink-0 text-text-muted" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            ))}

          {tab === 'records' &&
            (bestPrs.length === 0 ? (
              <EmptyState
                icon={Trophy}
                title="Nenhum recorde"
                description="Todo treino em que voce supera o melhor 1RM estimado de um exercicio vira um recorde aqui."
              />
            ) : (
              <>
                <SectionLabel className="mb-1">
                  1RM estimado (Epley) — melhor de cada exercicio
                </SectionLabel>
                <ul className="flex flex-col gap-2">
                  {bestPrs.map((pr) => (
                    <li key={pr.id} className="entry-card flex items-center gap-4 p-4">
                      <Trophy className="size-4 shrink-0 text-warn" strokeWidth={1.5} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] text-text-primary">
                          {exerciseName(pr.exercise_id)}
                        </p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-text-muted">
                          {fmtNumber(pr.weight_kg, 1)} kg x {pr.reps} · {fmtDayShort(pr.achieved_on)}
                        </p>
                      </div>
                      <span className="shrink-0 font-display text-lg text-white">
                        {fmtNumber(pr.e1rm, 1)}
                        <span className="ml-1 text-[10px] text-text-muted">kg</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ))}
        </div>
      )}

      <WorkoutFormModal open={formOpen} onOpenChange={setFormOpen} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Remover treino"
        description="As series vao junto. Recordes conquistados nesse treino tambem saem."
        confirmLabel="Remover"
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  )
}
