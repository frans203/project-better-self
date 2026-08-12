import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { User } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 -mx-4 mb-5 flex items-center justify-between gap-3 border-b border-border-default bg-bg-base/90 px-4 py-4 backdrop-blur-sm',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="truncate font-display text-base tracking-wide text-white">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.18em] text-text-muted">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {action}
        {/* Perfil nao cabe no bottom nav (5 slots), entao vive aqui no mobile. */}
        <Link
          to="/profile"
          aria-label="Perfil"
          className="p-2 text-text-muted transition-colors hover:text-white md:hidden"
        >
          <User className="size-4" strokeWidth={1.5} />
        </Link>
      </div>
    </header>
  )
}
