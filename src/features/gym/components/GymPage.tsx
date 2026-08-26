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
import { SCORING_SHORT } from '@/shared/constants/wods'
import {
  exercisesQuery,
  isGymWorkout,
  personalRecordsQuery,
  setsOf,
  useDeleteWorkout,
  volumeOf,
  wodResultOf,
  workoutsQuery,
  type WorkoutWithSets,
} from '../api/gym-api'
import { formatWodScore } from '../api/wod-api'
import { WorkoutFormModal } from './WorkoutFormModal'
import { WodFormModal } from './WodFormModal'

type Tab = 'sessions' | 'exercises' | 'records'

export function GymPage() {
  const to = todayKey()
  const from = useMemo(() => shiftDay(to, -364), [to])

  const { data: workouts = [], isPending, isError, error } = useQuery(workoutsQuery(from, to))
  const { data: exercises = [] } = useQuery(exercisesQuery())
  const { data: prs = [] } = useQuery(personalRecordsQuery())

  const [tab, setTab] = useState<Tab>('sessions')
  const [formOpen, setFormOpen] = useState(false)
  const [wodOpen, setWodOpen] = useState(false)
  const [deleting, setDeleting] = useState<WorkoutWithSets | null>(null)
  const remove = useDeleteWorkout()

  const week = weekRange()
  const weekCount = workouts.filter(
    (w) => w.workout_date >= week.startKey && w.workout_date <= week.endKey,
  ).length

  // Volume e series so existem em treino de academia; WOD nao tem workout_sets.
  // setsOf/volumeOf ja devolvem vazio nesse caso, entao a conta segue correta
  // sem precisar filtrar por kind aqui.
  const totalVolume = workouts.reduce((acc, w) => acc + volumeOf(setsOf(w)), 0)
  const totalSets = workouts.reduce(
    (acc, w) => acc + setsOf(w).filter((s) => !s.is_warmup).length,
    0,
  )
  const wodCount = workouts.filter((w) => !isGymWorkout(w)).length

  /** Melhor PR por exercicio — a lista de recordes mostra o topo, nao o historico. */
  const bestPrs = useMemo(() => {
    const map = new Map<string, (typeof prs)[number]>()
    for (const pr of prs) {
      const current = map.get(pr.exercise_id)
      if (!current || pr.e1rm > current.e1rm) map.set(pr.exercise_id, pr)
    }
    return [...map.values()].sort((a, b) => b.e1rm - a.e1rm)
  }, [prs])

  const exerciseName = (id: string) => exercises.find((e) => e.id === id)?.name ?? 'Exercício'

  return (
    <div className="page-section mx-auto w-full max-w-4xl">
      <PageHeader
        title="Academia"
        subtitle={`${weekCount} treinos nesta semana`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setWodOpen(true)}>
              <Plus />
              WOD
            </Button>
            <Button variant="solid" size="sm" onClick={() => setFormOpen(true)}>
              <Plus />
              Treino
            </Button>
          </div>
        }
      />

      {isError ? (
        <ErrorState error={error} />
      ) : isPending ? (
        <Loading label="Lendo treinos" />
      ) : (
        <div className="flex flex-col gap-6 boot-up">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard
              label="Treinos 12m"
              value={workouts.length}
              unit="sessões"
              hint={wodCount > 0 ? `${wodCount} são WOD` : undefined}
            />
            <StatCard label="Semana" value={weekCount} unit="treinos" />
            <StatCard label="Séries válidas" value={fmtInt(totalSets)} unit="séries" />
            <StatCard label="Volume total" value={fmtInt(totalVolume)} unit="kg" />
          </div>

          <Tabs
            label="Seções da academia"
            value={tab}
            onChange={setTab}
            items={[
              { value: 'sessions', label: 'Sessões' },
              { value: 'exercises', label: 'Exercícios' },
              { value: 'records', label: 'Recordes' },
            ]}
          />

          {tab === 'sessions' &&
            (workouts.length === 0 ? (
              <EmptyState
                icon={Dumbbell}
                title="Nenhum treino"
                description="Registre o primeiro. Carga e reps de cada série viram o gráfico de progressão."
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
                  const sets = setsOf(w).filter((s) => !s.is_warmup)
                  const wod = wodResultOf(w)
                  const isGym = isGymWorkout(w)
                  return (
                    <li key={w.id} className="entry-card flex items-center gap-4 p-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display text-sm text-white">
                            {w.split || (isGym ? 'Treino' : 'WOD')}
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.15em] text-text-muted">
                            {fmtDayShort(w.workout_date)}
                          </span>
                          {!isGym && (
                            <Badge>{wod?.wods ? SCORING_SHORT[wod.wods.scoring] : 'WOD'}</Badge>
                          )}
                          {wod?.scaled && <Badge tone="warn">Adaptado</Badge>}
                          {w.rpe && <Badge>RPE {w.rpe}</Badge>}
                        </div>
                        {/*
                          Resumo por tipo: um WOD nao tem serie nem volume, e
                          mostrar "0 séries · 0 kg" seria pior do que nao
                          mostrar nada. Se o kind disser 'wod' mas o resultado
                          nao tiver vindo, cai no resumo de academia — que com
                          zero series ainda renderiza sem quebrar.
                        */}
                        {!isGym && wod ? (
                          <p className="mt-1 text-[11px] text-text-secondary">
                            {formatWodScore(wod)}
                            {wod.total_reps > 0 ? ` · ${fmtInt(wod.total_reps)} reps` : ''}
                            {w.duration_min ? ` · ${w.duration_min}min` : ''}
                          </p>
                        ) : (
                          <p className="mt-1 text-[11px] text-text-secondary">
                            {sets.length} séries · {fmtInt(volumeOf(setsOf(w)))} kg de volume
                            {w.duration_min ? ` · ${w.duration_min}min` : ''}
                          </p>
                        )}
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
                title="Nenhum exercício"
                description="Exercícios são criados sozinhos quando você digita o nome ao registrar um treino."
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
                description="Todo treino em que você supera o melhor 1RM estimado de um exercício vira um recorde aqui."
              />
            ) : (
              <>
                <SectionLabel className="mb-1">
                  1RM estimado (Epley) — melhor de cada exercício
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
      <WodFormModal open={wodOpen} onOpenChange={setWodOpen} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Remover treino"
        description="As séries vão junto. Recordes conquistados nesse treino também saem."
        confirmLabel="Remover"
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  )
}
