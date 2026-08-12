import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { getDay } from 'date-fns'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { ErrorState, Loading, Meter, Panel, SectionLabel, StatCard, Tabs } from '@/shared/components/ui'
import { ChartFrame, ChartTooltipBox } from '@/shared/components/charts/ChartFrame'
import { CHART, axisProps, gridProps } from '@/shared/components/charts/chart-theme'
import { HABIT_LIST, HABITS, type HabitKey } from '@/shared/constants/habits'
import { consistency, streakFor, sumValue } from '@/shared/lib/streaks'
import { daysSince, fromDayKey } from '@/shared/lib/date'
import { fmtInt, fmtNumber } from '@/shared/lib/utils'
import { useHabitWindow } from '@/features/checkin/hooks/use-habit-window'
import { profileQuery } from '@/features/profile/api/profile-api'
import { useQuery } from '@tanstack/react-query'
import { Heatmap } from './Heatmap'

const PERIODS = [
  { value: '30', label: '30 dias' },
  { value: '90', label: '90 dias' },
  { value: '365', label: '12 meses' },
] as const

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

export function ReportsPage() {
  const { logs, isPending, isError, error } = useHabitWindow()
  const { data: profile } = useQuery(profileQuery())
  const [period, setPeriod] = useState<(typeof PERIODS)[number]['value']>('90')
  const [heatHabit, setHeatHabit] = useState<HabitKey>('no_pmo')

  const windowDays = Number(period)
  const scoped = useMemo(
    () => logs.filter((l) => daysSince(l.log_date) < windowDays),
    [logs, windowDays],
  )

  const startDate = profile?.start_date ?? ''

  /**
   * Consistencia dos 5 habitos como small multiples, nao como 5 series
   * coloridas: o sistema visual tem um accent so, e identidade por rotulo
   * e mais legivel do que identidade por cor.
   */
  const rows = useMemo(
    () =>
      HABIT_LIST.map((habit) => {
        const habitLogs = scoped.filter((l) => l.habit_key === habit.key)
        const streak = streakFor(habit.key, logs, startDate || logs.at(-1)?.log_date || '')
        return {
          habit,
          pct: consistency(habitLogs, windowDays),
          days: habitLogs.filter((l) => l.done).length,
          total: sumValue(habitLogs.filter((l) => l.done)),
          streak,
        }
      }),
    [scoped, logs, windowDays, startDate],
  )

  /** Recaidas por dia da semana — contagem descritiva, sem inferencia causal. */
  const relapseByWeekday = useMemo(() => {
    const counts = Array.from({ length: 7 }, () => 0)
    for (const log of scoped) {
      if (log.habit_key === 'no_pmo' && !log.done) counts[getDay(fromDayKey(log.log_date))]++
    }
    // Segunda primeiro, pra bater com o resto do app.
    const order = [1, 2, 3, 4, 5, 6, 0]
    return order.map((i) => ({ label: WEEKDAYS[i], count: counts[i] }))
  }, [scoped])

  const totalRelapses = relapseByWeekday.reduce((a, b) => a + b.count, 0)
  const containment = rows.find((r) => r.habit.key === 'no_pmo')!

  return (
    <div className="page-section mx-auto w-full max-w-4xl">
      <PageHeader title="Relatorio" subtitle={`Ultimos ${windowDays} dias`} />

      {isError ? (
        <ErrorState error={error} />
      ) : isPending ? (
        <Loading label="Compilando relatorio" />
      ) : (
        <div className="flex flex-col gap-6 boot-up">
          <Tabs
            label="Periodo"
            value={period}
            onChange={setPeriod}
            items={PERIODS.map((p) => ({ value: p.value, label: p.label }))}
          />

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard
              label="Contencao atual"
              value={containment.streak.current}
              unit="dias"
              hint={`Recorde ${containment.streak.best}`}
            />
            <StatCard
              label="Recaidas"
              value={totalRelapses}
              unit="no periodo"
              tone={totalRelapses === 0 ? 'ok' : 'muted'}
            />
            <StatCard
              label="Dias registrados"
              value={new Set(scoped.map((l) => l.log_date)).size}
              unit={`de ${windowDays}`}
            />
            <StatCard
              label="Registros"
              value={fmtInt(scoped.length)}
              unit="entradas"
            />
          </div>

          <div>
            <SectionLabel className="mb-3">Consistencia por habito</SectionLabel>
            <Panel className="flex flex-col gap-4 p-5">
              {rows.map(({ habit, pct, days, total, streak }) => {
                const Icon = habit.icon
                return (
                  <div key={habit.key}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <span className="flex items-center gap-2 text-[11px] text-text-primary">
                        <Icon className="size-3.5 text-text-muted" strokeWidth={1.5} />
                        {habit.label}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {days} dias
                        {habit.unit && total > 0 && ` · ${fmtNumber(total, 1)} ${habit.unit}`}
                        {` · streak ${streak.current}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Meter value={pct} max={100} className="flex-1" />
                      <span className="w-9 shrink-0 text-right font-display text-sm text-white">
                        {pct}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </Panel>
          </div>

          <div>
            <SectionLabel className="mb-3">Mapa de calor</SectionLabel>
            <Panel className="p-5">
              <Tabs
                label="Habito do mapa"
                className="mb-4"
                value={heatHabit}
                onChange={setHeatHabit}
                items={HABIT_LIST.map((h) => ({ value: h.key, label: h.short }))}
              />
              <p className="mb-4 text-[10px] text-text-muted">
                {HABITS[heatHabit].label} — ultimas 27 semanas. A intensidade acompanha os
                quartis do seu proprio historico, nao uma escala fixa.
              </p>
              <Heatmap habit={HABITS[heatHabit]} logs={logs} />
            </Panel>
          </div>

          <ChartFrame
            title="Recaidas por dia da semana"
            hint="Contagem simples do periodo. Serve pra achar padrao de rotina — nao e diagnostico de causa."
            empty={totalRelapses === 0}
            emptyLabel="Nenhuma recaida registrada no periodo"
            height={200}
          >
            <BarChart data={relapseByWeekday} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} width={40} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                content={({ active, payload, label }) => (
                  <ChartTooltipBox
                    active={Boolean(active && payload?.length)}
                    title={String(label)}
                    rows={[{ label: 'Recaidas', value: String(payload?.[0]?.value ?? 0) }]}
                  />
                )}
              />
              <Bar dataKey="count" fill={CHART.markDim} radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ChartFrame>
        </div>
      )}
    </div>
  )
}
