import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
  /**
   * Chamado antes de qualquer fechamento (X, ESC, clique no backdrop).
   * Devolver false cancela o fechamento — use para avisar que ha rascunho
   * nao salvo. Como `open` e controlado pelo pai, basta nao propagar o
   * onOpenChange para o modal continuar aberto.
   */
  interceptClose?: () => boolean
  /**
   * Trava a interacao e mostra o aviso de salvamento. O X continua clicavel
   * de proposito: quem clica nele durante o save precisa ver o alerta do
   * interceptClose, nao um botao morto.
   */
  busy?: boolean
  busyLabel?: string
}

/**
 * Comportamento (foco preso, ESC, scroll lock, aria) vem do Base UI.
 * O visual e todo nosso: sem cantos, sem sombra macia.
 *
 * Mobile-first: no celular sobe do rodape como sheet; no desktop centraliza.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  interceptClose,
  busy = false,
  busyLabel = 'Salvando',
}: ModalProps) {
  const handleOpenChange = (next: boolean) => {
    if (!next && interceptClose && !interceptClose()) return
    onOpenChange(next)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            'fixed inset-0 z-100 bg-black/85 backdrop-blur-[3px]',
            'transition-opacity duration-200',
            'data-starting-style:opacity-0 data-ending-style:opacity-0',
          )}
        />
        <Dialog.Popup
          className={cn(
            'fixed z-101 flex flex-col border border-border-default bg-bg-surface outline-none',
            'shadow-[0_20px_60px_rgba(0,0,0,0.7)]',
            // Mobile: sheet colado no rodape
            'inset-x-0 bottom-0 max-h-[88dvh] pb-[env(safe-area-inset-bottom)]',
            'transition-transform duration-250 data-starting-style:translate-y-full data-ending-style:translate-y-full',
            // Desktop: centralizado
            'md:inset-x-auto md:bottom-auto md:top-1/2 md:left-1/2 md:max-h-[80vh] md:w-full md:max-w-lg',
            'md:-translate-x-1/2 md:-translate-y-1/2 md:pb-0',
            'md:transition-opacity md:data-starting-style:translate-y-[-50%] md:data-ending-style:translate-y-[-50%]',
            'md:data-starting-style:opacity-0 md:data-ending-style:opacity-0',
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border-default px-5 py-4">
            <div className="min-w-0">
              <Dialog.Title className="font-display text-sm tracking-wide text-white">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-[11px] leading-relaxed text-text-muted">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Fechar"
              className="shrink-0 cursor-pointer p-1 text-text-muted transition-colors hover:text-white"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-border-default px-5 py-4">
              {footer}
            </div>
          )}

          {busy && (
            /*
              Cobre o corpo mas nao o cabecalho: o X precisa continuar
              alcancavel para o interceptClose poder avisar.
            */
            <div
              className="absolute inset-x-0 top-[57px] bottom-0 z-10 flex items-center justify-center bg-bg-surface/88 backdrop-blur-[2px]"
              role="status"
              aria-live="polite"
            >
              <span className="loading-pulse text-[11px] uppercase tracking-[0.2em] text-text-secondary">
                {busyLabel}
              </span>
              <span className="terminal-text" />
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
