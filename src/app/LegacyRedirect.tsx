import { Navigate, useLocation } from 'react-router-dom'

/**
 * As telas do app sairam da raiz e foram para `/app/*` quando a landing virou
 * a home. Isto leva o endereco velho (`/gym/exercise/12?x=1`) para o novo
 * (`/app/gym/exercise/12?x=1`), sem quebrar favorito nem atalho do celular.
 */
export function LegacyRedirect() {
  const { pathname, search, hash } = useLocation()
  return <Navigate to={`/app${pathname}${search}${hash}`} replace />
}
