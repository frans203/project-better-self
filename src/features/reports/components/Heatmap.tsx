import { useMemo } from 'react'
import { eachDayOfInterval, format, getDay, startOfWeek, subWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { HabitLogRow } from '@/shared/types/database.types'
import type { HabitMeta } from '@/shared/constants/habits'
import { fmtDayLong, fromDayKey, toDayKey } from '@/shared/lib/date'
import { fmtNumber } from '@/shared/lib/utils'

const WEEKS = 27
const WEEKDAY_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

type Level = '0' | '1' | '2' | '3' | '4' | 'fail'

interface HeatmapProps {
  habit: HabitMeta
  logs: HabitLogRow[]
}

/**
 * Heatmap dos ultimos ~6 meses. 27 semanas em vez de 52 porque no celular
 * uma grade de 52 colunas vira poeira: celula de 3px nao da pra tocar nem ler.
 *
 * Escala: habito com valor (minutos, paginas, km) ganha 4 niveis por quartil
 * do proprio historico — escala fixa nao serve pra quem le 2 paginas e pra
 * quem le 60. Habito so booleano usa nivel unico.
 */
export function Heatmap({ habit, logs }: HeatmapProps) {
  const { columns, byDay } = useMemo(() => {
    const map = new Map<string, HabitLogRow>()
    for (const log of logs) {
      if (log.habit_key === habit.key) map.set(log.log_date, log)
    }

    const values = [...map.values()]
      .filter((l) => l.done && l.value != null && l.value > 0)
      .map((l) => l.value as number)
      .sort((a, b) => a - b)

    const quartile = (q: number) =>
      values.length ? values[Math.min(values.length - 1, Math.floor(values.length * q))] : 0

    const q1 = quartile(0.25)
    const q2 = quartile(0.5)
    const q3 = quartile(0.75)

    const levelOf = (log: HabitLogRow | undefined): Level => {
      if (!log) return '0'
      if (!log.done) return habit.abstinence ? 'fail' : '0'
      if (log.value == null || values.length === 0) return '3'
      if (log.value <= q1) return '1'
      if (log.value <= q2) return '2'
      if (log.value <= q3) return '3'
      return '4'
    }

    const end = new Date()
    const firstWeek = startOfWeek(subWeeks(end, WEEKS - 1), { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: firstWeek, end })

    const cols: { key: string; cells: { day: string; level: Level; log?: HabitLogRow }[] }[] = []
    let current: { day: string; level: Level; log?: HabitLogRow }[] = []

    for (const date of days) {
      const key = toDayKey(date)
      const log = map.get(key)
      current.push({ day: key, level: levelOf(log), log })
      // getDay: 0 = domingo. Semana comeca na segunda, entao ela fecha no domingo.
      if (getDay(date) === 0) {
        cols.push({ key: current[0].day, cells: current })
        current = []
      }
    }
    if (current.length) cols.push({ key: current[0].day, cells: current })

    return { columns: cols, byDay: map }
  }, [logs, habit])

  const title = (day: string) => {
    const log = byDay.get(day)
    const base = fmtDayLong(day)
    if (!log) return `${base} — sem registro`
    if (!log.done) return `${base} — ${habit.missLabel}`
    if (log.value != null) return `${base} — ${fmtNumber(log.value, 1)} ${habit.unit ?? ''}`
    return `${base} — ${habit.doneLabel}`
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-[3px]">
        <div className="mr-1 flex flex-col gap-[3px] pt-[14px]">
          {WEEKDAY_LABELS.map((label, i) => (
            <span
              key={i}
              className="flex h-3 items-center text-[8px] text-text-muted"
              aria-hidden
            >
              {i % 2 === 0 ? label : ''}
            </span>
          ))}
        </div>

        <div className="flex gap-[3px]">
          {columns.map((col, ci) => (
            <div key={col.key} className="flex flex-col gap-[3px]">
              <span className="h-3 text-[8px] whitespace-nowrap text-text-muted" aria-hidden>
                {ci % 4 === 0 ? format(fromDayKey(col.key), 'MMM', { locale: ptBR }) : ''}
              </span>
              {col.cells.map((cell) => (
                <div
                  key={cell.day}
                  className="heat-cell !w-3"
                  data-level={cell.level}
                  title={title(cell.day)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[9px] text-text-muted">
        <span>menos</span>
        {(['0', '1', '2', '3', '4'] as const).map((l) => (
          <span key={l} className="heat-cell !w-3 !cursor-default" data-level={l} />
        ))}
        <span>mais</span>
        {habit.abstinence && (
          <>
            <span className="ml-3 heat-cell !w-3 !cursor-default" data-level="fail" />
            <span>recaida</span>
          </>
        )}
      </div>
    </div>
  )
}
