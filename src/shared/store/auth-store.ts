import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
  /**
   * `false` ate a primeira leitura do storage terminar.
   *
   * Sem esse estado, o guard leria `session: null` no primeiro render e
   * mandaria pro login todo mundo que ja estava logado — o supabase-js le a
   * sessao de forma assincrona, entao "sem sessao" e "ainda nao sei" sao
   * situacoes diferentes.
   */
  ready: boolean
  setSession: (session: Session | null) => void
}

/**
 * Sessao fora do React de proposito: `getUserId()` e chamado dentro de
 * `queryFn` e `mutationFn`, que nao sao componentes e nao podem usar hook.
 * Store vanilla do zustand da leitura sincrona via `.getState()`.
 *
 * Nao persiste — quem guarda a sessao no localStorage e o proprio supabase-js
 * (`persistSession: true`). Duas copias so dessincronizariam.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  session: null,
  ready: false,
  setSession: (session) => set({ session, ready: true }),
}))
