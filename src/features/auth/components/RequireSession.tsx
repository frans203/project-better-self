import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loading } from '@/shared/components/ui'
import { useAuthStore } from '@/shared/store/auth-store'

/**
 * Guard de todas as rotas do app.
 *
 * Alem do redirect, ele e o que garante a invariante do `getUserId()`: nenhuma
 * tela que dispara query monta sem sessao, entao a funcao nunca precisa
 * devolver um id falso pra "esperar".
 */
export function RequireSession({ children }: { children: ReactNode }) {
  const ready = useAuthStore((s) => s.ready)
  const session = useAuthStore((s) => s.session)
  const location = useLocation()

  // Ainda lendo o storage. Mandar pro login aqui faria quem ja esta logado
  // ver um flash da tela de login em toda carga de pagina.
  if (!ready) return <Loading label="Verificando credenciais" />

  if (!session) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
    )
  }

  return <>{children}</>
}
