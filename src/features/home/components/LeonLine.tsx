import { useMemo } from 'react'
import { LEON_LINES } from '@/shared/constants/quotes'
import { todayKey } from '@/shared/lib/date'
import { pickByDate } from '@/shared/lib/utils'
import { usePrefersReducedMotion } from '@/shared/hooks/use-media-query'
import { cn } from '@/shared/lib/utils'

/**
 * A fala do Leon, como transmissao de radio.
 *
 * A escolha e deterministica pela data — a mesma frase o dia inteiro. Sortear
 * a cada render faria a frase trocar sozinha enquanto a pessoa le.
 */
export function LeonLine({ className }: { className?: string }) {
  const reducedMotion = usePrefersReducedMotion()
  const line = useMemo(() => pickByDate(LEON_LINES, todayKey()), [])

  return (
    <div className={cn('radio-line', className)}>
      <p className="mb-1 text-[9px] uppercase tracking-[0.25em] text-text-muted">
        {'> D.S.O. // LEON'}
        {line.canon && line.source && (
          <span className="ml-2 border border-white/15 px-1 py-px text-[8px] text-text-muted">
            {line.source}
          </span>
        )}
      </p>
      <p className={cn('text-[13px] text-text-primary', !reducedMotion && 'radio-typing')}>
        {line.text}
      </p>
    </div>
  )
}
