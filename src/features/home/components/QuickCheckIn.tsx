import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { HABIT_LIST, type HabitKey } from '@/shared/constants/habits'
import type { HabitLogRow } from '@/shared/types/database.types'
import { useSound } from '@/shared/hooks/use-sound'
import { cn } from '@/shared/lib/utils'

interface QuickCheckInProps {
  todayLogs: Map<HabitKey, HabitLogRow>
  onToggle: (habitKey: HabitKey, done: boolean) => void
}

/**
 * Fica na parte de baixo da home de proposito: no celular e a faixa que o
 * polegar alcanca sem reposicionar a mao. Um toque marca o dia.
 *
 * Corrida e treino nao sao toggles aqui — eles precisam de distancia/series,
 * entao abrem a tela propria.
 */
export function QuickCheckIn({ todayLogs, onToggle }: QuickCheckInProps) {
  const { playCheck, playUncheck } = useSound()

  return (
    <div className="grid grid-cols-5 gap-2">
      {HABIT_LIST.map((habit) => {
        const log = todayLogs.get(habit.key)
        const done = Boolean(log?.done)
        const missed = log && !log.done
        const Icon = habit.icon

        const shell = cn(
          'flex min-h-16 flex-col items-center justify-center gap-1.5 border px-1 py-2 transition-all',
          done && 'border-white bg-white/10 text-white shadow-[0_0_14px_rgba(255,255,255,0.15)]',
          missed && 'border-fail/50 text-fail',
          !done && !missed && 'border-border-default text-text-muted hover:border-white/40 hover:text-text-secondary',
        )

        const content = (
          <>
            {done ? (
              <Check className="size-4" strokeWidth={2.5} />
            ) : (
              <Icon className="size-4" strokeWidth={1.5} />
            )}
            <span className="text-[8px] uppercase tracking-[0.1em]">{habit.short}</span>
          </>
        )

        if (habit.detailRoute) {
          return (
            <Link
              key={habit.key}
              to={habit.detailRoute}
              className={cn(shell, 'cursor-pointer')}
              aria-label={`${habit.label}: abrir registro`}
            >
              {content}
            </Link>
          )
        }

        return (
          <button
            key={habit.key}
            onClick={() => {
              if (done) playUncheck()
              else playCheck()
              onToggle(habit.key, !done)
            }}
            aria-pressed={done}
            aria-label={`${habit.label}: ${done ? habit.doneLabel : 'sem registro'}`}
            className={cn(shell, 'cursor-pointer')}
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}
