import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/shared/lib/query-client'

// Em dev, o cache fica acessivel no console como __qc — inspecionar estado de
// query sem devtools instalado (`__qc.getQueryCache().getAll()`).
if (import.meta.env.DEV) {
  ;(window as unknown as { __qc: typeof queryClient }).__qc = queryClient
}

export function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
