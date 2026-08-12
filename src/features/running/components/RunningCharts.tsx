import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { format, startOfWeek, subWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { RunRow } from '@/shared/types/database.types'
import { ChartFrame, ChartTooltipBox } from '@/shared/components/charts/ChartFrame'
import { CHART, activeDotProps, axisProps, dotProps, gridProps } from '@/shared/components/charts/chart-theme'
import { WEEKLY_KM_FLOOR } from '@/shared/constants/habits'
import { fromDayKey, toDayKey } from '@/shared/lib/date'
import { fmtNumber, fmtPace } from '@/shared/lib/utils'
import { paceOf } from '../api/running-api'

const WEEKS = 12

export function WeeklyKmChart({ runs }: { runs: RunRow[] }) {
  const data = useMemo(() => {
    const buckets = new Map<string, number>()
    for (let i = WEEKS - 1; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 })
      buckets.set(toDayKey(weekStart), 0)
    }

    for (const run of runs) {
      const key = toDayKey(startOfWeek(fromDayKey(run.run_date), { weekStartsOn: 1 }))
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + run.distance_km)
    }

    return [...buckets.entries()].map(([key, km]) => ({
      key,
      label: format(fromDayKey(key), 'dd/MM', { locale: ptBR }),
      km: Math.round(km * 100) / 100,
      belowFloor: km < WEEKLY_KM_FLOOR,
    }))
  }, [runs])

  const hasData = data.some((d) => d.km > 0)

  return (
    <ChartFrame
      title="Km por semana"
      hint={`A linha marca o piso de ${WEEKLY_KM_FLOOR} km. Semana abaixo dela fica ambar — nao e meta, e o minimo.`}
      empty={!hasData}
    >
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" />
        <YAxis {...axisProps} width={44} />
        <ReferenceLine
          y={WEEKLY_KM_FLOOR}
          stroke={CHART.warn}
          strokeDasharray="3 3"
          strokeWidth={1}
          label={{
            value: 'MINIMO',
            position: 'insideTopLeft',
            fill: CHART.warn,
            fontSize: 9,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          content={({ active, payload, label }) => (
            <ChartTooltipBox
              active={Boolean(active && payload?.length)}
              title={`Semana de ${label}`}
              rows={[
                { label: 'Distancia', value: `${fmtNumber(Number(payload?.[0]?.value ?? 0), 2)} km` },
                {
                  label: 'Piso',
                  value: Number(payload?.[0]?.value ?? 0) >= WEEKLY_KM_FLOOR ? 'cumprido' : 'abaixo',
                },
              ]}
            />
          )}
        />
        <Bar dataKey="km" radius={[4, 4, 0, 0]} maxBarSize={26}>
          {data.map((d) => (
            <Cell key={d.key} fill={d.belowFloor ? CHART.warn : CHART.mark} />
          ))}
        </Bar>
      </BarChart>
    </ChartFrame>
  )
}

export function PaceChart({ runs }: { runs: RunRow[] }) {
  const data = useMemo(
    () =>
      [...runs]
        .filter((r) => r.duration_min)
        .sort((a, b) => a.run_date.localeCompare(b.run_date))
        .slice(-30)
        .map((r) => ({
          label: format(fromDayKey(r.run_date), 'dd/MM', { locale: ptBR }),
          pace: Math.round(paceOf(r) ?? 0),
          km: r.distance_km,
        })),
    [runs],
  )

  return (
    <ChartFrame
      title="Pace"
      // Eixo invertido e contraintuitivo se nao avisar: aqui menor e melhor,
      // entao o eixo cresce pra baixo e a linha sobe quando voce melhora.
      hint="Minutos por km. O eixo esta invertido: linha subindo significa pace melhor."
      empty={data.length < 2}
      emptyLabel="Registre ao menos duas corridas com duracao"
    >
      <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" />
        <YAxis
          {...axisProps}
          reversed
          width={44}
          domain={['dataMin - 20', 'dataMax + 20']}
          tickFormatter={(v: number) => fmtPace(v)}
        />
        <Tooltip
          cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }}
          content={({ active, payload, label }) => (
            <ChartTooltipBox
              active={Boolean(active && payload?.length)}
              title={String(label)}
              rows={[
                { label: 'Pace', value: `${fmtPace(Number(payload?.[0]?.value ?? 0))} /km` },
                { label: 'Distancia', value: `${fmtNumber(Number(payload?.[0]?.payload?.km ?? 0), 2)} km` },
              ]}
            />
          )}
        />
        <Line
          type="monotone"
          dataKey="pace"
          stroke={CHART.mark}
          strokeWidth={2}
          dot={dotProps}
          activeDot={activeDotProps}
        />
      </LineChart>
    </ChartFrame>
  )
}
