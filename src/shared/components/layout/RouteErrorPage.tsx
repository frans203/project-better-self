import { useRouteError } from 'react-router-dom'
import { RotateCw } from 'lucide-react'
import { Button } from '@/shared/components/ui'

/**
 * Ultima linha de defesa do roteador.
 *
 * Sem um errorElement, uma rota que falha ao carregar deixa a tela em branco
 * com o erro padrao do React Router — que nao diz nada a quem esta usando o
 * app. O caso mais provavel aqui e o chunk que sumiu depois de um deploy
 * (ver `lazyRoute` no router), e para esse recarregar resolve.
 */
export function RouteErrorPage() {
  const error = useRouteError()
  const message = error instanceof Error ? error.message : String(error ?? '')

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted">
        Falha ao carregar a tela
      </p>

      <h1 className="font-display text-xl tracking-wide text-white">Sinal perdido</h1>

      <p className="max-w-sm text-[11px] leading-relaxed text-text-muted [overflow-wrap:anywhere]">
        Isso costuma acontecer quando uma versão nova subiu enquanto o app estava aberto.
        Recarregar resolve.
      </p>

      <Button variant="solid" size="sm" onClick={() => window.location.reload()}>
        <RotateCw />
        Recarregar
      </Button>

      {message && (
        <details className="mt-2 max-w-sm text-left">
          <summary className="cursor-pointer text-[10px] uppercase tracking-[0.15em] text-text-muted">
            Detalhe técnico
          </summary>
          <p className="mt-2 text-[10px] text-text-muted [overflow-wrap:anywhere]">{message}</p>
        </details>
      )}
    </div>
  )
}
