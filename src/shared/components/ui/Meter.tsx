import { cn } from '@/shared/lib/utils'
import { clamp } from '@/shared/lib/utils'

interface MeterProps {
  value: number
  max: number
  /**
   * Marca fixa no trilho (ex.: o piso de 5 km/semana). Nao e meta: e linha
   * de corte. Abaixo dela o preenchimento fica ambar.
   */
  floor?: number
  className?: string
  tone?: 'accent' | 'ok' | 'warn'
}

const TONE_BG: Record<NonNullable<MeterProps['tone']>, string> = {
  accent: 'bg-white',
  ok: 'bg-ok',
  warn: 'bg-warn',
}

export function Meter({ value, max, floor, className, tone }: MeterProps) {
  const pct = max > 0 ? clamp((value / max) * 100, 0, 100) : 0
  const belowFloor = floor !== undefined && value < floor
  const resolved = tone ?? (belowFloor ? 'warn' : 'accent')

  return (
    <div className={cn('progress-bar relative', className)}>
      <div
        className={cn('h-full transition-[width] duration-500', TONE_BG[resolved])}
        style={{
          width: `${pct}%`,
          boxShadow: resolved === 'accent' ? '0 0 10px rgba(255,255,255,0.25)' : undefined,
        }}
      />
      {floor !== undefined && max > 0 && (
        <span
          aria-hidden
          className="absolute top-0 bottom-0 w-px bg-white/60"
          style={{ left: `${clamp((floor / max) * 100, 0, 100)}%` }}
        />
      )}
    </div>
  )
}

interface StreakBarProps {
  /** Quantos dias mostrar no trilho. */
  slots: number
  /** Quantos deles estao cumpridos, contados do fim para tras. */
  filled: number
  broke?: boolean
  className?: string
}

export function StreakBar({ slots, filled, broke = false, className }: StreakBarProps) {
  const count = Math.max(1, Math.min(slots, 60))
  return (
    <div className={cn('streak-bar', className)} aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const isOn = i >= count - filled
        const isLast = i === count - 1
        return (
          <span
            key={i}
            className={cn(
              'streak-seg',
              isOn && 'on',
              isOn && isLast && !broke && 'today',
              isLast && broke && 'broke',
            )}
          />
        )
      })}
    </div>
  )
}
