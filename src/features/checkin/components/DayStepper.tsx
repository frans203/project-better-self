import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { fmtDayLong, fmtDayRelative, isFuture, shiftDay, todayKey, type DayKey } from '@/shared/lib/date'
import { useSound } from '@/shared/hooks/use-sound'
import { cn } from '@/shared/lib/utils'

interface DayStepperProps {
  value: DayKey
  onChange: (day: DayKey) => void
}

/**
 * Navegacao de dia com backfill: da pra registrar qualquer dia passado.
 * Futuro fica bloqueado — registrar amanha nao significa nada e so sujaria
 * o heatmap.
 */
export function DayStepper({ value, onChange }: DayStepperProps) {
  const { playNav } = useSound()
  const nextDay = shiftDay(value, 1)
  const canGoForward = !isFuture(nextDay)

  const go = (day: DayKey) => {
    playNav()
    onChange(day)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => go(shiftDay(value, -1))}
        aria-label="Dia anterior"
        className="cursor-pointer border border-border-default p-2.5 text-text-secondary transition-colors hover:border-white hover:text-white"
      >
        <ChevronLeft className="size-4" />
      </button>

      <div className="flex-1 text-center">
        <p className="font-display text-sm tracking-wide text-white">{fmtDayRelative(value)}</p>
        <p className="text-[10px] text-text-muted">{fmtDayLong(value)}</p>
      </div>

      <button
        onClick={() => canGoForward && go(nextDay)}
        disabled={!canGoForward}
        aria-label="Proximo dia"
        className={cn(
          'border border-border-default p-2.5 transition-colors',
          canGoForward
            ? 'cursor-pointer text-text-secondary hover:border-white hover:text-white'
            : 'cursor-not-allowed text-text-muted opacity-40',
        )}
      >
        <ChevronRight className="size-4" />
      </button>

      <label
        className="relative cursor-pointer border border-border-default p-2.5 text-text-secondary transition-colors hover:border-white hover:text-white"
        aria-label="Escolher data"
      >
        <CalendarDays className="size-4" />
        <input
          type="date"
          value={value}
          max={todayKey()}
          onChange={(e) => e.target.value && go(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
    </div>
  )
}
