import { AlertTriangle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4 w-full', className)} aria-hidden />
}

export function Loading({ label = 'Carregando' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-12 text-text-muted" role="status" aria-live="polite">
      <span className="loading-pulse text-[11px] uppercase tracking-[0.2em]">{label}</span>
      <span className="terminal-text" />
    </div>
  )
}

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 px-6 py-14 text-center',
        className,
      )}
    >
      {Icon && <Icon className="size-7 text-text-muted" strokeWidth={1.25} />}
      <p className="text-[11px] uppercase tracking-[0.2em] text-text-secondary terminal-text">
        {title}
      </p>
      {description && <p className="max-w-xs text-[11px] leading-relaxed text-text-muted">{description}</p>}
      {action}
    </div>
  )
}

/**
 * Erro de leitura precisa aparecer. Sem isso, uma query que falha se parece
 * exatamente com um historico vazio — e o app mentiria dizendo "0 dias".
 */
export function ErrorState({ error, hint }: { error: unknown; hint?: string }) {
  const message = error instanceof Error ? error.message : 'Erro desconhecido'
  const missingTable = /does not exist|relation|schema cache/i.test(message)

  return (
    <div className="flex flex-col gap-2 border border-fail/30 bg-fail/5 px-5 py-4" role="alert">
      <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-fail">
        <AlertTriangle className="size-4" />
        Falha ao ler o banco
      </p>
      <p className="text-[11px] leading-relaxed text-text-secondary">{message}</p>
      {(hint || missingTable) && (
        <p className="text-[10px] leading-relaxed text-text-muted">
          {hint ??
            'As tabelas ainda nao existem. Rode supabase/migrations/0001_init.sql no SQL Editor do Supabase — passo 1 do SUPABASE_SETUP.md.'}
        </p>
      )}
    </div>
  )
}

interface BadgeProps {
  children: ReactNode
  tone?: 'default' | 'ok' | 'warn' | 'fail' | 'info' | 'accent'
  className?: string
}

const BADGE_TONE: Record<NonNullable<BadgeProps['tone']>, string> = {
  default: 'border-border-default text-text-secondary',
  ok: 'border-ok/40 text-ok',
  warn: 'border-warn/40 text-warn',
  fail: 'border-fail/40 text-fail',
  info: 'border-info/40 text-info',
  accent: 'border-white/50 text-white',
}

export function Badge({ children, tone = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-2 py-0.5 text-[9px] uppercase tracking-[0.15em]',
        BADGE_TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function StatusDot({ tone }: { tone: 'idle' | 'ok' | 'fail' | 'warn' | 'live' }) {
  return <span className={cn('status-dot', `dot-${tone}`)} aria-hidden />
}
