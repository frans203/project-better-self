import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { NavRail } from './NavRail'
import { BottomNav } from './BottomNav'
import { Snackbar } from '@/shared/components/ui'
import { useCrtClass } from '@/shared/hooks/use-crt'
import { usePrefersReducedMotion } from '@/shared/hooks/use-media-query'

export function AppLayout() {
  useCrtClass()
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  // Glitch curto na troca de rota. Puramente decorativo, entao some com
  // prefers-reduced-motion.
  useEffect(() => {
    const el = mainRef.current
    if (!el || reducedMotion) return
    el.classList.remove('page-glitch')
    // Reflow forcado: sem isso o browser agrupa remove+add e a animacao nao reinicia.
    void el.offsetWidth
    el.classList.add('page-glitch')
  }, [location.pathname, reducedMotion])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <>
      {/* rail e main PRECISAM ser irmaos — o CSS usa o combinador ~ pra empurrar
          o conteudo quando o rail abre. Envolver um dos dois quebra isso. */}
      <NavRail />
      <main id="main" ref={mainRef}>
        <Outlet />
      </main>
      <BottomNav />
      <Snackbar />
    </>
  )
}
