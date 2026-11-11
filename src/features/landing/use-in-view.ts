import { useEffect, useRef, useState } from 'react'

/**
 * Vira `true` na primeira vez que o elemento entra na tela, e fica.
 * Sem IntersectionObserver (navegador velho, robo), comeca visivel.
 */
export function useInView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [seen, threshold])

  return [ref, seen] as const
}
