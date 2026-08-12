import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Footprints, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Loading,
  Meter,
  Panel,
  SectionLabel,
  StatCard,
} from '@/shared/components/ui'
import { WEEKLY_KM_FLOOR } from '@/shared/constants/habits'
import { fmtDayShort, shiftDay, todayKey, weekRange } from '@/shared/lib/date'
import { fmtNumber, fmtPace } from '@/shared/lib/utils'
import type { RunRow } from '@/shared/types/database.types'
import { paceOf, runsQuery, useDeleteRun } from '../api/running-api'
import { RunFormModal } from './RunFormModal'
import { PaceChart, WeeklyKmChart } from './RunningCharts'

export function RunningPage() {
  const to = todayKey()
  const from = useMemo(() => shiftDay(to, -364), [to])
  const { data: runs = [], isPending, isError, error } = useQuery(runsQuery(from, to))

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RunRow | null>(null)
  const [deleting, setDeleting] = useState<RunRow | null>(null)
  const remove = useDeleteRun()

  const week = weekRange()
  const weekRuns = runs.filter((r) => r.run_date >= week.startKey && r.run_date <= week.endKey)
  const weekKm = weekRuns.reduce((acc, r) => acc + r.distance_km, 0)
  const totalKm = runs.reduce((acc, r) => acc + r.distance_km, 0)
  const daysRun = new Set(runs.map((r) => r.run_date)).size

  const paced = runs.map(paceOf).filter((p): p is number => p !== null)
  const avgPace = paced.length ? paced.reduce((a, b) => a + b, 0) / paced.length : 0

  const belowFloor = weekKm < WEEKLY_KM_FLOOR

  return (
    <div className="page-section mx-auto w-full max-w-4xl">
      <PageHeader
        title="Corrida"
        subtitle={`${daysRun} dias corridos`}
        action={
          <Button
            variant="solid"
            size="sm"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus />
            Registrar
          </Button>
        }
      />

      {isError ? (
        <ErrorState error={error} />
      ) : isPending ? (
        <Loading label="Lendo corridas" />
      ) : (
        <div className="flex flex-col gap-6 boot-up">
          <Panel className="p-4">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary">
                  Semana atual
                </p>
                <p className="mt-1 font-display text-3xl text-white">
                  {fmtNumber(weekKm, 2)}
                  <span className="ml-1.5 text-[11px] text-text-muted">km</span>
                </p>
              </div>
              <Badge tone={belowFloor ? 'warn' : 'accent'}>
                {belowFloor ? 'Abaixo do minimo' : 'Minimo cumprido'}
              </Badge>
            </div>
            <Meter value={weekKm} max={Math.max(WEEKLY_KM_FLOOR * 2, weekKm)} floor={WEEKLY_KM_FLOOR} />
            <p className="mt-2 text-[10px] text-text-muted">
              Piso de {WEEKLY_KM_FLOOR} km por semana. Nao e meta — e a linha abaixo da qual a
              semana nao conta.
            </p>
          </Panel>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Total 12m" value={fmtNumber(totalKm, 1)} unit="km" />
            <StatCard label="Dias corridos" value={daysRun} unit="dias" />
            <StatCard label="Corridas" value={runs.length} unit="sessoes" />
            <StatCard
              label="Pace medio"
              value={avgPace ? fmtPace(avgPace) : '--:--'}
              unit="/km"
              tone={avgPace ? 'accent' : 'muted'}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <WeeklyKmChart runs={runs} />
            <PaceChart runs={runs} />
          </div>

          <div>
            <SectionLabel className="mb-3">Historico</SectionLabel>
            {runs.length === 0 ? (
              <EmptyState
                icon={Footprints}
                title="Nenhuma corrida"
                description="Registre a primeira e o habito do dia marca sozinho."
                action={
                  <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
                    <Plus />
                    Registrar corrida
                  </Button>
                }
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {runs.map((run) => {
                  const pace = paceOf(run)
                  return (
                    <li key={run.id} className="entry-card flex items-center gap-4 p-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-display text-lg text-white">
                            {fmtNumber(run.distance_km, 2)}
                          </span>
                          <span className="text-[10px] text-text-muted">km</span>
                          {pace && (
                            <span className="text-[11px] text-text-secondary">
                              · {fmtPace(pace)} /km
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.15em] text-text-muted">
                          {fmtDayShort(run.run_date)}
                          {run.route && ` · ${run.route}`}
                          {run.duration_min && ` · ${run.duration_min}min`}
                        </p>
                        {run.note && (
                          <p className="mt-1.5 line-clamp-2 text-[11px] text-text-secondary">
                            {run.note}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-1">
                        <button
                          onClick={() => {
                            setEditing(run)
                            setFormOpen(true)
                          }}
                          aria-label="Editar corrida"
                          className="cursor-pointer p-2 text-text-muted transition-colors hover:text-white"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(run)}
                          aria-label="Remover corrida"
                          className="cursor-pointer p-2 text-text-muted transition-colors hover:text-fail"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      <RunFormModal open={formOpen} onOpenChange={setFormOpen} run={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Remover corrida"
        description={
          deleting
            ? `${fmtNumber(deleting.distance_km, 2)} km em ${fmtDayShort(deleting.run_date)}. Se for a unica corrida do dia, o habito tambem sai do registro.`
            : undefined
        }
        confirmLabel="Remover"
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  )
}
