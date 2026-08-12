import { useMemo, useState } from 'react'
import { HABIT_LIST, type HabitKey } from '@/shared/constants/habits'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { ErrorState, Loading, Panel, SectionLabel, Textarea } from '@/shared/components/ui'
import { todayKey, type DayKey } from '@/shared/lib/date'
import { useHabitWindow } from '../hooks/use-habit-window'
import { useDeleteHabitLog, useUpsertHabitLog } from '../api/habit-api'
import { DayStepper } from './DayStepper'
import { ContainmentRow } from './ContainmentRow'
import { HabitRow } from './HabitRow'
import type { HabitState } from '../lib/habit-state'

export function CheckInPage() {
  const [day, setDay] = useState<DayKey>(todayKey())
  const { logs, isPending, isError, error, rangeKey } = useHabitWindow()

  const upsert = useUpsertHabitLog(rangeKey)
  const remove = useDeleteHabitLog(rangeKey)

  const dayLogs = useMemo(() => {
    const map = new Map<HabitKey, (typeof logs)[number]>()
    for (const log of logs) {
      if (log.log_date === day) map.set(log.habit_key as HabitKey, log)
    }
    return map
  }, [logs, day])

  const setHabit = (habitKey: HabitKey, state: HabitState, trigger?: string | null) => {
    if (state === 'empty') {
      remove.mutate({ habitKey, date: day })
      return
    }
    const existing = dayLogs.get(habitKey)
    upsert.mutate({
      habitKey,
      date: day,
      done: state === 'done',
      value: existing?.value ?? null,
      note: existing?.note ?? null,
      relapseTrigger: trigger ?? null,
    })
  }

  const setValue = (habitKey: HabitKey, value: number | null) => {
    const existing = dayLogs.get(habitKey)
    // Digitar um numero implica que o habito aconteceu — nao faz sentido
    // ter 30 minutos de meditacao num dia marcado como nao feito.
    upsert.mutate({
      habitKey,
      date: day,
      done: value !== null ? true : (existing?.done ?? true),
      value,
      note: existing?.note ?? null,
      relapseTrigger: existing?.relapse_trigger ?? null,
    })
  }

  const noteLog = dayLogs.get('no_pmo')
  const doneCount = HABIT_LIST.filter((h) => dayLogs.get(h.key)?.done).length

  return (
    <div className="page-section mx-auto w-full max-w-2xl">
      <PageHeader
        title="Check-in"
        subtitle={`${doneCount} de ${HABIT_LIST.length} registrados`}
      />

      <Panel className="mb-6 p-4">
        <DayStepper value={day} onChange={setDay} />
      </Panel>

      {isError ? (
        <ErrorState error={error} />
      ) : isPending ? (
        <Loading label="Lendo registros" />
      ) : (
        <div className="flex flex-col gap-6 boot-up">
          <div>
            <SectionLabel className="mb-3">Linha de frente</SectionLabel>
            <ContainmentRow
              log={dayLogs.get('no_pmo')}
              onSet={(state, trigger) => setHabit('no_pmo', state, trigger)}
            />
          </div>

          <div>
            <SectionLabel className="mb-3">Rotina</SectionLabel>
            <div className="flex flex-col gap-3">
              {HABIT_LIST.filter((h) => h.key !== 'no_pmo').map((habit) => (
                <HabitRow
                  // key com o dia: trocar de dia remonta a linha e o campo
                  // numerico volta ao valor daquele dia sem efeito de sincronia.
                  key={`${day}-${habit.key}`}
                  habit={habit}
                  log={dayLogs.get(habit.key)}
                  // Corrida e treino sao gravados pelo trigger do banco quando
                  // voce registra a sessao na tela propria. Editar aqui criaria
                  // dois numeros para a mesma coisa.
                  locked={Boolean(habit.detailRoute)}
                  onToggle={(state) => setHabit(habit.key, state)}
                  onValueChange={(value) => setValue(habit.key, value)}
                />
              ))}
            </div>
          </div>

          <div>
            <SectionLabel className="mb-3">Nota do dia</SectionLabel>
            <Textarea
              placeholder="Como foi. O que atrapalhou. O que funcionou."
              defaultValue={noteLog?.note ?? ''}
              key={`${day}-note`}
              onBlur={(e) => {
                const value = e.target.value.trim() || null
                if (value === (noteLog?.note ?? null)) return
                upsert.mutate({
                  habitKey: 'no_pmo',
                  date: day,
                  done: noteLog?.done ?? true,
                  value: noteLog?.value ?? null,
                  note: value,
                  relapseTrigger: noteLog?.relapse_trigger ?? null,
                })
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
