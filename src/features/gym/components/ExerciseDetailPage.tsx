import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { EmptyState, Loading, SectionLabel, StatCard } from '@/shared/components/ui'
import { ChartFrame, ChartTooltipBox } from '@/shared/components/charts/ChartFrame'
import {
  CHART,
  activeDotProps,
  axisProps,
  dotProps,
  gridProps,
} from '@/shared/components/charts/chart-theme'
import { fromDayKey } from '@/shared/lib/date'
import { fmtInt, fmtNumber } from '@/shared/lib/utils'
import { exerciseHistoryQuery, exercisesQuery } from '../api/gym-api'

export function ExerciseDetailPage() {
  const { exerciseId = '' } = useParams()
  const { data: exercises = [] } = useQuery(exercisesQuery())
  const { data: history = [], isPending } = useQuery(exerciseHistoryQuery(exerciseId))

  const exercise = exercises.find((e) => e.id === exerciseId)

  /**
   * Uma sessao = um ponto. Dentro da sessao o que importa e a melhor serie
   * (maior e1RM) e o volume somado; plotar cada serie separada viraria
   * serrilhado sem informacao.
   */
  const sessions = useMemo(() => {
    const map = new Map<string, { best: number; volume: number; weight: number; reps: number }>()
    for (const set of history) {
      const day = set.workouts?.workout_date
      if (!day) continue
      const current = map.get(day) ?? { best: 0, volume: 0, weight: 0, reps: 0 }
      const next = {
        best: Math.max(current.best, set.e1rm),
        volume: current.volume + set.weight_kg * set.reps,
        weight: set.e1rm >= current.best ? set.weight_kg : current.weight,
        reps: set.e1rm >= current.best ? set.reps : current.reps,
      }
      map.set(day, next)
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, v]) => ({
        day,
        label: format(fromDayKey(day), 'dd/MM', { locale: ptBR }),
        e1rm: Math.round(v.best * 10) / 10,
        volume: Math.round(v.volume),
        weight: v.weight,
        reps: v.reps,
      }))
  }, [history])

  const best = sessions.reduce((acc, s) => Math.max(acc, s.e1rm), 0)
  const first = sessions[0]?.e1rm ?? 0
  const last = sessions[sessions.length - 1]?.e1rm ?? 0
  const delta = first > 0 ? ((last - first) / first) * 100 : 0

  return (
    <div className="page-section mx-auto w-full max-w-4xl">
      <PageHeader
        title={exercise?.name ?? 'Exercicio'}
        subtitle={`${sessions.length} sessoes registradas`}
        action={
          <Link
            to="/gym"
            aria-label="Voltar para academia"
            className="border border-border-default p-2 text-text-muted transition-colors hover:border-white hover:text-white"
          >
            <ArrowLeft className="size-4" />
          </Link>
        }
      />

      {isPending ? (
        <Loading label="Lendo historico" />
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="Sem series validas"
          description="Series marcadas como aquecimento nao entram na progressao."
        />
      ) : (
        <div className="flex flex-col gap-6 boot-up">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Melhor e1RM" value={fmtNumber(best, 1)} unit="kg" />
            <StatCard label="Ultima sessao" value={fmtNumber(last, 1)} unit="kg e1RM" />
            <StatCard
              label="Evolucao"
              value={`${delta >= 0 ? '+' : ''}${fmtNumber(delta, 1)}`}
              unit="%"
              tone={delta > 0 ? 'ok' : delta < 0 ? 'fail' : 'muted'}
              hint="Da primeira a ultima sessao"
            />
            <StatCard label="Sessoes" value={sessions.length} unit="registros" />
          </div>

          <SectionLabel>Progressao de carga</SectionLabel>

          <ChartFrame
            title="1RM estimado por sessao"
            hint="Formula de Epley: carga x (1 + reps/30). Compara series de reps diferentes na mesma escala."
            height={240}
          >
            <LineChart data={sessions} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" />
              <YAxis {...axisProps} width={44} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip
                cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }}
                content={({ active, payload, label }) => (
                  <ChartTooltipBox
                    active={Boolean(active && payload?.length)}
                    title={String(label)}
                    rows={[
                      { label: 'e1RM', value: `${fmtNumber(Number(payload?.[0]?.value ?? 0), 1)} kg` },
                      {
                        label: 'Melhor serie',
                        value: `${fmtNumber(Number(payload?.[0]?.payload?.weight ?? 0), 1)}kg x ${payload?.[0]?.payload?.reps ?? 0}`,
                      },
                    ]}
                  />
                )}
              />
              <Line
                type="monotone"
                dataKey="e1rm"
                stroke={CHART.mark}
                strokeWidth={2}
                dot={dotProps}
                activeDot={activeDotProps}
              />
            </LineChart>
          </ChartFrame>

          <ChartFrame
            title="Volume por sessao"
            hint="Soma de carga x repeticoes das series validas."
            height={200}
          >
            <BarChart data={sessions} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" />
              <YAxis {...axisProps} width={52} tickFormatter={(v: number) => fmtInt(v)} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                content={({ active, payload, label }) => (
                  <ChartTooltipBox
                    active={Boolean(active && payload?.length)}
                    title={String(label)}
                    rows={[{ label: 'Volume', value: `${fmtInt(Number(payload?.[0]?.value ?? 0))} kg` }]}
                  />
                )}
              />
              <Bar dataKey="volume" fill={CHART.markDim} radius={[4, 4, 0, 0]} maxBarSize={26} />
            </BarChart>
          </ChartFrame>
        </div>
      )}
    </div>
  )
}
