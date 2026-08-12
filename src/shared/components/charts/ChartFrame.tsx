import type { ReactNode } from 'react'
import { ResponsiveContainer } from 'recharts'
import { cn } from '@/shared/lib/utils'

interface ChartFrameProps {
  title: string
  /** Uma linha explicando como ler. Aparece sempre que a leitura nao e obvia. */
  hint?: string
  action?: ReactNode
  height?: number
  children: ReactNode
  className?: string
  /** Estado vazio proprio — grafico sem dado nao e grafico com zero. */
  empty?: boolean
  emptyLabel?: string
}

export function ChartFrame({
  title,
  hint,
  action,
  height = 220,
  children,
  className,
  empty = false,
  emptyLabel = 'Sem dados no periodo',
}: ChartFrameProps) {
  return (
    <section className={cn('border border-border-default bg-bg-surface/70 p-4', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-text-secondary">{title}</h3>
          {hint && <p className="mt-1 text-[10px] leading-tight text-text-muted">{hint}</p>}
        </div>
        {action}
      </div>

      {empty ? (
        <div
          className="flex items-center justify-center border border-dashed border-white/8 text-[10px] uppercase tracking-[0.2em] text-text-muted"
          style={{ height }}
        >
          {emptyLabel}
        </div>
      ) : (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {children as never}
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}

interface TooltipRow {
  label: string
  value: string
}

interface ChartTooltipProps {
  active?: boolean
  title?: string
  rows?: TooltipRow[]
}

export function ChartTooltipBox({ active, title, rows = [] }: ChartTooltipProps) {
  if (!active) return null
  return (
    <div className="border border-white/20 bg-bg-elevated px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
      {title && (
        <p className="mb-1 text-[10px] uppercase tracking-[0.15em] text-text-muted">{title}</p>
      )}
      {rows.map((r) => (
        <p key={r.label} className="text-[11px] text-text-primary">
          <span className="text-text-muted">{r.label}: </span>
          <span className="text-white">{r.value}</span>
        </p>
      ))}
    </div>
  )
}
