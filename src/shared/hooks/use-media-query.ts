import { useSyncExternalStore } from 'react'

function subscribe(query: string) {
  return (onChange: () => void) => {
    const mql = window.matchMedia(query)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    subscribe(query),
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const useIsMobile = () => useMediaQuery('(max-width: 768px)')

/**
 * Usado para desligar autoplay do Swiper, typewriter e o boot screen.
 * O CSS ja cobre animacao pura; isto cobre o que precisa parar em JS.
 */
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
