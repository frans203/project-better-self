import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Flame, Trophy } from 'lucide-react'
import { Wallpaper } from '@/shared/components/layout/Wallpaper'
import { ErrorState, Loading, Panel, StatCard, StreakBar, Badge } from '@/shared/components/ui'
import { HABITS, WEEKLY_KM_FLOOR, type HabitKey } from '@/shared/constants/habits'
import { streakFor, sumValue } from '@/shared/lib/streaks'
import { daysSince, fmtDayShort, todayKey, weekRange } from '@/shared/lib/date'
import { fmtInt, fmtNumber } from '@/shared/lib/utils'
import { profileQuery } from '@/features/profile/api/profile-api'
import { useHabitWindow } from '@/features/checkin/hooks/use-habit-window'
import { useUpsertHabitLog, useDeleteHabitLog } from '@/features/checkin/api/habit-api'
import type { HabitLogRow } from '@/shared/types/database.types'
import { LeonLine } from './LeonLine'
import { QuoteSlider } from './QuoteSlider'
import { QuickCheckIn } from './QuickCheckIn'

export function HomePage() {
  const { data: profile } = useQuery(profileQuery())
  const { logs, isPending, isError, error, rangeKey } = useHabitWindow()

  const upsert = useUpsertHabitLog(rangeKey)
  const remove = useDeleteHabitLog(rangeKey)

  const today = todayKey()
  const week = weekRange()

  const todayLogs = useMemo(() => {
    const map = new Map<HabitKey, HabitLogRow>()
    for (const log of logs) {
      if (log.log_date === today) map.set(log.habit_key as HabitKey, log)
    }
    return map
  }, [logs, today])

  const startDate = profile?.start_date ?? today
  const containment = useMemo(
    () => streakFor('no_pmo', logs, startDate),
    [logs, startDate],
  )

  const weekLogs = useMemo(
    () => logs.filter((l) => l.log_date >= week.startKey && l.log_date <= week.endKey),
    [logs, week.startKey, week.endKey],
  )

  const last30 = useMemo(() => logs.filter((l) => daysSince(l.log_date) < 30), [logs])

  const meditationDays = last30.filter((l) => l.habit_key === 'meditation' && l.done).length
  const readingPages = sumValue(last30.filter((l) => l.habit_key === 'reading' && l.done))
  const readingDays = last30.filter((l) => l.habit_key === 'reading' && l.done).length
  const weekKm = sumValue(weekLogs.filter((l) => l.habit_key === 'running' && l.done))
  const weekTraining = weekLogs.filter((l) => l.habit_key === 'training' && l.done).length

  const daysInOperation = Math.max(0, daysSince(startDate))
  const agent = profile?.display_name?.trim() || 'AGENTE'

  const toggleHabit = (habitKey: HabitKey, done: boolean) => {
    if (!done) {
      remove.mutate({ habitKey, date: today })
      return
    }
    const existing = todayLogs.get(habitKey)
    upsert.mutate({
      habitKey,
      date: today,
      done: true,
      value: existing?.value ?? null,
      note: existing?.note ?? null,
    })
  }

  return (
    <>
      <Wallpaper />

      <div className="page-section mx-auto w-full max-w-5xl">
        {/* Cabecalho do agente */}
        <header className="pt-8 pb-6 md:pt-14">
          <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted">
            Operation: Better Self
          </p>
          <h1 className="mt-2 font-display text-2xl tracking-wide text-white md:text-3xl">
            {agent}
          </h1>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-text-secondary">
            {fmtInt(daysInOperation)} dias em operacao
          </p>
        </header>

        {isError ? (
          <ErrorState error={error} />
        ) : isPending ? (
          <Loading label="Sincronizando status" />
        ) : (
          <div className="flex flex-col gap-5 boot-up">
            {/* Streak principal */}
            <Panel className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary">
                    Contencao
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-6xl leading-none text-white accent-text">
                      {containment.current}
                    </span>
                    <span className="text-[11px] uppercase text-text-muted">dias limpos</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge tone="accent">
                    <Trophy className="size-3" />
                    Recorde {containment.best}
                  </Badge>
                  {containment.current > 0 && containment.current >= containment.best && (
                    <Badge tone="ok">
                      <Flame className="size-3" />
                      Melhor marca
                    </Badge>
                  )}
                </div>
              </div>

              {/* O trilho acompanha a sequencia atual em vez do recorde: com
                  recorde de 288 e streak de 12, uma barra de 288 casas nao
                  comunicaria nada alem de "quase vazia". */}
              <StreakBar
                className="mt-5"
                slots={Math.min(30, Math.max(14, containment.current + 2))}
                filled={containment.current}
              />

              <p className="mt-2 text-[10px] text-text-muted">
                {containment.lastBreak
                  ? `Ultima recaida registrada em ${fmtDayShort(containment.lastBreak)}.`
                  : 'Nenhuma recaida registrada ate agora.'}
              </p>
            </Panel>

            {/* Transmissao + frases */}
            {/* min-w-0 nos dois: item de grid tem min-width:auto por padrao e
                nao encolhe abaixo do conteudo — o Swiper depende disso pra
                medir a largura certa. */}
            <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,22rem)]">
              <Panel className="flex min-w-0 items-center p-5">
                <LeonLine />
              </Panel>
              <Panel className="min-w-0 p-5">
                <p className="mb-3 text-[9px] uppercase tracking-[0.25em] text-text-muted">
                  Manual de campo
                </p>
                <QuoteSlider />
              </Panel>
            </div>

            {/* Resumo */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard
                label="Meditacao 30d"
                value={meditationDays}
                unit="dias"
                icon={HABITS.meditation.icon}
                tone={meditationDays > 0 ? 'accent' : 'muted'}
              />
              <StatCard
                label="Leitura 30d"
                value={fmtInt(readingPages)}
                unit="paginas"
                icon={HABITS.reading.icon}
                hint={`${readingDays} dias com leitura`}
                tone={readingPages > 0 ? 'accent' : 'muted'}
              />
              <StatCard
                label="Corrida na semana"
                value={fmtNumber(weekKm, 1)}
                unit="km"
                icon={HABITS.running.icon}
                hint={
                  weekKm < WEEKLY_KM_FLOOR
                    ? `Abaixo do minimo de ${WEEKLY_KM_FLOOR} km`
                    : 'Minimo cumprido'
                }
                tone={weekKm === 0 ? 'muted' : weekKm < WEEKLY_KM_FLOOR ? 'warn' : 'accent'}
              />
              <StatCard
                label="Treinos na semana"
                value={weekTraining}
                unit="sessoes"
                icon={HABITS.training.icon}
                tone={weekTraining > 0 ? 'accent' : 'muted'}
              />
            </div>

            {/* Check-in rapido — zona do polegar no mobile */}
            <Panel className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary">
                  Check-in de hoje
                </p>
                <Link
                  to="/check-in"
                  className="text-[10px] uppercase tracking-[0.15em] text-text-muted transition-colors hover:text-white"
                >
                  Detalhar
                </Link>
              </div>
              <QuickCheckIn todayLogs={todayLogs} onToggle={toggleHabit} />
            </Panel>
          </div>
        )}
      </div>
    </>
  )
}
