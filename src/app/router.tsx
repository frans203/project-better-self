import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/shared/components/layout/AppLayout'
import { HomePage } from '@/features/home/components/HomePage'
import { NotFoundPage } from '@/shared/components/layout/NotFoundPage'
import { LoginPage } from '@/features/auth/components/LoginPage'
import { RequireSession } from '@/features/auth/components/RequireSession'

/**
 * Rotas em ingles, rotulos em pt-BR (PLAN.md 5).
 *
 * Tudo abaixo de "/" fica atras do RequireSession. `/login` e a unica rota
 * fora dele — e nao e lazy: e a primeira tela de quem chega deslogado, um
 * chunk separado so adicionaria um round-trip antes do formulario aparecer.
 *
 * A home entra no bundle inicial — e a primeira tela e precisa pintar rapido.
 * O resto e lazy: Recharts sozinho passa de 400kB e so importa nas telas de
 * grafico. O data router suspende a navegacao ate o chunk chegar, entao nao ha
 * flash de layout vazio.
 */
export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireSession>
        <AppLayout />
      </RequireSession>
    ),
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'check-in',
        lazy: async () => ({
          Component: (await import('@/features/checkin/components/CheckInPage')).CheckInPage,
        }),
      },
      {
        path: 'gym',
        lazy: async () => ({
          Component: (await import('@/features/gym/components/GymPage')).GymPage,
        }),
      },
      {
        path: 'gym/exercise/:exerciseId',
        lazy: async () => ({
          Component: (await import('@/features/gym/components/ExerciseDetailPage'))
            .ExerciseDetailPage,
        }),
      },
      {
        path: 'running',
        lazy: async () => ({
          Component: (await import('@/features/running/components/RunningPage')).RunningPage,
        }),
      },
      {
        path: 'reports',
        lazy: async () => ({
          Component: (await import('@/features/reports/components/ReportsPage')).ReportsPage,
        }),
      },
      {
        path: 'profile',
        lazy: async () => ({
          Component: (await import('@/features/profile/components/ProfilePage')).ProfilePage,
        }),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
