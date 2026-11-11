import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/shared/components/layout/AppLayout'
import { HomePage } from '@/features/home/components/HomePage'
import { NotFoundPage } from '@/shared/components/layout/NotFoundPage'
import { LoginPage } from '@/features/auth/components/LoginPage'
import { RequireSession } from '@/features/auth/components/RequireSession'
import { RouteErrorPage } from '@/shared/components/layout/RouteErrorPage'
import { LandingRoute } from '@/features/landing/components/LandingRoute'
import { LegacyRedirect } from './LegacyRedirect'

/**
 * Chunk que sumiu depois de um deploy novo.
 *
 * O nome do arquivo carrega um hash (`GymPage-D4B4XCAB.js`). Quando sai um
 * deploy, os hashes mudam e os arquivos antigos deixam de existir — mas a aba
 * que ficou aberta no celular ainda tem o index.html velho na memoria e vai
 * pedir o chunk que nao existe mais. O import rejeita e a rota morre.
 *
 * Isso acontece exatamente no cenario de "deixei em segundo plano e voltei",
 * e por isso ele anda junto com o problema do SPA fallback.
 *
 * Recarregar resolve, porque traz o index.html novo com os hashes certos. O
 * sessionStorage evita o loop: se recarregar tambem falhar, o erro sobe para
 * o errorElement em vez de recarregar para sempre.
 */
function lazyRoute(load: () => Promise<Record<string, unknown>>, name: string) {
  return async () => {
    try {
      const mod = await load()
      sessionStorage.removeItem('chunk-reload')
      return { Component: mod[name] as React.ComponentType }
    } catch (error) {
      if (sessionStorage.getItem('chunk-reload') !== '1') {
        sessionStorage.setItem('chunk-reload', '1')
        window.location.reload()
        // Promise que nunca resolve: segura a navegacao ate o reload assumir,
        // em vez de piscar a tela de erro no meio do caminho.
        return new Promise<never>(() => {})
      }
      throw error
    }
  }
}

/**
 * Rotas em ingles, rotulos em pt-BR (PLAN.md 5).
 *
 * `/` e a landing publica. Quem tem sessao e mandado para `/app` (o
 * LandingRoute decide). O app inteiro vive em `/app/*`, atras do
 * RequireSession. `/login` fica fora dos dois.
 *
 * O login nao e lazy: e a primeira tela de quem entra numa rota interna sem
 * sessao, e um chunk separado so adicionaria um round-trip antes do formulario.
 *
 * A home entra no bundle inicial — e a primeira tela e precisa pintar rapido.
 * O resto e lazy: Recharts sozinho passa de 400kB e so importa nas telas de
 * grafico. O data router suspende a navegacao ate o chunk chegar, entao nao ha
 * flash de layout vazio.
 */
export const router = createBrowserRouter([
  { path: '/', element: <LandingRoute />, errorElement: <RouteErrorPage /> },
  { path: '/login', element: <LoginPage />, errorElement: <RouteErrorPage /> },
  // Endereco antigo da landing, de antes dela virar a home.
  { path: '/landing', element: <Navigate to="/" replace /> },
  // Enderecos de antes do /app (favorito, atalho na tela inicial do celular).
  ...['check-in', 'gym/*', 'running', 'rank', 'reports', 'profile'].map((path) => ({
    path,
    element: <LegacyRedirect />,
  })),
  {
    path: '/app',
    element: (
      <RequireSession>
        <AppLayout />
      </RequireSession>
    ),
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'check-in',
        lazy: lazyRoute(() => import('@/features/checkin/components/CheckInPage'), 'CheckInPage'),
      },
      {
        path: 'gym',
        lazy: lazyRoute(() => import('@/features/gym/components/GymPage'), 'GymPage'),
      },
      {
        path: 'gym/exercise/:exerciseId',
        lazy: lazyRoute(
          () => import('@/features/gym/components/ExerciseDetailPage'),
          'ExerciseDetailPage',
        ),
      },
      {
        path: 'running',
        lazy: lazyRoute(() => import('@/features/running/components/RunningPage'), 'RunningPage'),
      },
      {
        path: 'rank',
        lazy: lazyRoute(() => import('@/features/rank/components/RankPage'), 'RankPage'),
      },
      {
        path: 'reports',
        lazy: lazyRoute(() => import('@/features/reports/components/ReportsPage'), 'ReportsPage'),
      },
      {
        path: 'profile',
        lazy: lazyRoute(() => import('@/features/profile/components/ProfilePage'), 'ProfilePage'),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
