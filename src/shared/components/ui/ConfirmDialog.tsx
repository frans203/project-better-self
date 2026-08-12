import { AlertDialog } from '@base-ui/react/alert-dialog'
import type { ReactNode } from 'react'
import { Button } from './Button'
import { cn } from '@/shared/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'neutral'
  onConfirm: () => void
  /** Conteudo extra entre a descricao e os botoes (ex.: campo de gatilho). */
  children?: ReactNode
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  onConfirm,
  children,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop
          className={cn(
            'fixed inset-0 z-150 bg-black/88 backdrop-blur-[3px]',
            'transition-opacity duration-200',
            'data-starting-style:opacity-0 data-ending-style:opacity-0',
          )}
        />
        <AlertDialog.Popup
          className={cn(
            'fixed top-1/2 left-1/2 z-151 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2',
            'border border-border-default bg-bg-surface p-5 outline-none',
            'shadow-[0_20px_60px_rgba(0,0,0,0.7)]',
            'transition-all duration-200',
            'data-starting-style:opacity-0 data-starting-style:scale-97',
            'data-ending-style:opacity-0 data-ending-style:scale-97',
          )}
        >
          <AlertDialog.Title className="font-display text-sm tracking-wide text-white">
            {title}
          </AlertDialog.Title>

          {description && (
            <AlertDialog.Description className="mt-2 text-[12px] leading-relaxed text-text-secondary">
              {description}
            </AlertDialog.Description>
          )}

          {children && <div className="mt-4">{children}</div>}

          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Close render={<Button variant="ghost" size="sm" />}>
              {cancelLabel}
            </AlertDialog.Close>
            <Button
              variant={tone === 'danger' ? 'danger' : 'solid'}
              size="sm"
              onClick={() => {
                onConfirm()
                onOpenChange(false)
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
