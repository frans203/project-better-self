import { useEffect } from 'react'
import { useUiStore } from '@/shared/store/ui-store'

/**
 * O efeito CRT vive em body::before/::after no CSS, entao o toggle e uma
 * classe no <body> — nao da pra fazer isso com estado de componente.
 */
export function useCrtClass() {
  const crt = useUiStore((s) => s.crt)

  useEffect(() => {
    document.body.classList.toggle('crt-off', !crt)
  }, [crt])
}
