import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface StatCardProps {
  label: string
  value: ReactNode
  unit?: string
  hint?: ReactNode
  icon?: LucideIcon
  /** Cor do valor. 'muted' quando o numero e zero e nao vale destacar. */
  tone?: 'accent' | 'ok' | 'warn' | 'fail' | 'muted'
  className?: string
}

const TONE: Record<NonNullable<StatCardProps['tone']>, string> = {
  accent: 'text-white',
  ok: 'text-ok',
  warn: 'text-warn',
  fail: 'text-fail',
  muted: 'text-text-muted',
}

export function StatCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  tone = 'accent',
  className,
}: StatCardProps) {
  return (
    <div className={cn('stat-card', className)}>
      <div className="mb-2 flex items-start justify-between gap-2">
        {/* Sem truncate: em 2 colunas no mobile, "CORRIDA NA SEMANA" nao cabe
            numa linha e virava "CORRIDA NA SEMA...". Quebrar e melhor que cortar. */}
        <span className="text-[10px] leading-tight uppercase tracking-[0.18em] text-text-secondary">
          {label}
        </span>
        {Icon && <Icon className="mt-0.5 size-3.5 shrink-0 text-text-muted" strokeWidth={1.5} />}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className={cn('font-display text-3xl leading-none', TONE[tone])}>{value}</span>
        {unit && <span className="text-[10px] uppercase text-text-muted">{unit}</span>}
      </div>

      {hint && <div className="mt-2 text-[10px] leading-tight text-text-muted">{hint}</div>}
    </div>
  )
}
