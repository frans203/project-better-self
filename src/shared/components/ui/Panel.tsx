import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface PanelProps {
  children: ReactNode
  className?: string
  /** Liga a linha de scan branca no hover. */
  scan?: boolean
  as?: 'div' | 'section' | 'article'
}

export function Panel({ children, className, scan = false, as: Tag = 'div' }: PanelProps) {
  return (
    <Tag
      className={cn(
        // Opaco o bastante para o texto nao competir com o wallpaper atras.
        'border border-border-default bg-bg-surface/93 backdrop-blur-sm',
        scan && 'scan-hover',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

interface PanelHeaderProps {
  title: string
  hint?: string
  action?: ReactNode
  className?: string
}

export function PanelHeader({ title, hint, action, className }: PanelHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-b border-border-default px-4 py-3',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="truncate text-[11px] uppercase tracking-[0.2em] text-text-secondary">
          {title}
        </h2>
        {hint && <p className="mt-0.5 truncate text-[10px] text-text-muted">{hint}</p>}
      </div>
      {action}
    </div>
  )
}

/** Rotulo de secao, estilo cabecalho de relatorio de campo. */
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="text-[10px] uppercase tracking-[0.25em] text-text-muted">{children}</span>
      <span className="h-px flex-1 bg-border-default" />
    </div>
  )
}
