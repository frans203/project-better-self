import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Dado pessoal de um usuario so: nada muda em outro dispositivo enquanto
      // ele usa este. Refetch agressivo aqui so gasta rede.
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
      // No modo padrao 'online', um retry so acontece se o onlineManager achar
      // que ha conexao — e enquanto espera, a query fica em fetchStatus
      // 'paused' com status 'pending', ou seja, spinner eterno em vez de erro.
      // Aqui a falha aparece na tela. (O retry tambem pausa com a aba sem foco:
      // isso e intencional na lib e o 'always' nao muda.)
      networkMode: 'always',
    },
    mutations: {
      retry: 0,
      networkMode: 'always',
    },
  },
})

/** Chaves centralizadas — evita invalidacao errada por string solta. */
export const queryKeys = {
  profile: ['profile'] as const,

  habitLogs: ['habit-logs'] as const,
  habitLogsRange: (from: string, to: string) => ['habit-logs', 'range', from, to] as const,
  habitLogsDay: (day: string) => ['habit-logs', 'day', day] as const,

  runs: ['runs'] as const,
  runsRange: (from: string, to: string) => ['runs', 'range', from, to] as const,

  exercises: ['exercises'] as const,
  workouts: ['workouts'] as const,
  workoutsRange: (from: string, to: string) => ['workouts', 'range', from, to] as const,
  workout: (id: string) => ['workouts', id] as const,
  exerciseHistory: (id: string) => ['exercises', id, 'history'] as const,
  personalRecords: ['personal-records'] as const,
}
