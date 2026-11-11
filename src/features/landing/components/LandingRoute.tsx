import { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'
import { Loading } from '@/shared/components/ui'
import { useAuthStore } from '@/shared/store/auth-store'

/*
  Landing em chunk proprio: quem esta logado nunca a ve, entao ela nao pesa no
  bundle do app.
*/
const LandingPage = lazy(() => import('./LandingPage').then((m) => ({ default: m.LandingPage })))

/**
 * A home (`/`). Visitante ve a landing; quem ja tem sessao vai direto para o
 * app. Enquanto o auth-store ainda le o storage, segura no Loading: mostrar a
 * landing e trocar pelo app meio segundo depois seria um flash pior.
 */
export function LandingRoute() {
  const ready = useAuthStore((s) => s.ready)
  const session = useAuthStore((s) => s.session)

  if (!ready) return <Loading label="Carregando" />
  if (session) return <Navigate to="/app" replace />

  return (
    <Suspense fallback={<Loading label="Carregando" />}>
      <LandingPage />
    </Suspense>
  )
}
