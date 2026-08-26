import { Check } from 'lucide-react'
import { Meter } from '@/shared/components/ui'
import { cn } from '@/shared/lib/utils'
import type { MetricKey, RequirementStatus } from '@/shared/lib/rank'

interface RequirementListProps {
  requirements: RequirementStatus[]
  /** Cumpridos agora e ainda nao comemorados — sao os que ganham o risco animado. */
  striking?: Set<MetricKey>
  className?: string
}

export function RequirementList({ requirements, striking, className }: RequirementListProps) {
  return (
    <ul className={cn('flex flex-col gap-3.5', className)}>
      {requirements.map((r) => {
        const isStriking = Boolean(striking?.has(r.key))
        return (
          <li key={r.key}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="flex min-w-0 items-baseline gap-2">
                <span
                  aria-hidden
                  className={cn(
                    'flex size-3.5 shrink-0 translate-y-0.5 items-center justify-center border',
                    r.met ? 'border-white text-white' : 'border-border-default text-transparent',
                  )}
                >
                  {r.met && <Check className="size-2.5" strokeWidth={3} />}
                </span>

                {/*
                  O risco e um <span> com scaleX, nao um line-through nem uma
                  animacao de largura: largura sobre texto exigiria nowrap, e
                  ai o rotulo longo estouraria a linha no mobile.
                */}
                <span
                  className={cn(
                    'req-label min-w-0 text-[12px]',
                    r.met ? 'text-text-muted' : 'text-text-primary',
                    r.met && (isStriking ? 'striking' : 'struck'),
                  )}
                >
                  {r.label}
                  {r.met && <span aria-hidden className="req-strike" />}
                </span>

                <span className="shrink-0 text-[9px] uppercase tracking-[0.12em] text-text-muted">
                  {r.window}
                </span>
              </span>

              <span className="shrink-0 text-[10px] text-text-muted">
                <span className={r.met ? 'text-ok' : 'text-text-primary'}>{r.text}</span>
                {' / '}
                {r.targetText}
              </span>
            </div>

            {!r.met && <Meter value={r.pct} max={100} />}
          </li>
        )
      })}
    </ul>
  )
}
