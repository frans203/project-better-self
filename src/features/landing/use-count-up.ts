import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/shared/hooks/use-media-query'

/**
 * Numero que corre de 0 ate `target` quando `active` vira true. Ease-out
 * cubico: dispara rapido e assenta devagar, como um contador de painel.
 * Com prefers-reduced-motion devolve o alvo direto.
 */
export function useCountUp(target: number, active: boolean, duration = 1200) {
  const reducedMotion = usePrefersReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active || reducedMotion) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setValue(target * (1 - (1 - t) ** 3))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, target, duration, reducedMotion])

  if (reducedMotion) return target
  return active ? value : 0
}
