import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui'

export function NotFoundPage() {
  return (
    <div className="page-section flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
      <p className="font-display text-5xl text-white">404</p>
      <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted terminal-text">
        Setor nao mapeado
      </p>
      <Link to="/">
        <Button variant="outline" size="sm">
          Voltar para a base
        </Button>
      </Link>
    </div>
  )
}
