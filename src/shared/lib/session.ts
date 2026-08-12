import { supabase } from './supabase'
import { queryClient } from './query-client'
import { useAuthStore } from '@/shared/store/auth-store'

let started = false

/**
 * Liga o store de sessao ao supabase-js. Chamado uma vez no main.tsx, antes do
 * React montar.
 *
 * O guard depende disso: enquanto `ready` for false ele mostra "verificando"
 * em vez de mandar pro login.
 */
export function initSession() {
  // StrictMode monta duas vezes em dev; sem essa trava viriam dois listeners.
  if (started) return
  started = true

  void supabase.auth.getSession().then(({ data }) => {
    useAuthStore.getState().setSession(data.session)
  })

  supabase.auth.onAuthStateChange((event, session) => {
    // Nao chamar outras funcoes do supabase-js aqui dentro: o callback roda
    // segurando o lock interno do client e uma chamada aninhada trava.
    useAuthStore.getState().setSession(session)

    // O cache do TanStack guarda linhas de habit_logs, runs e workouts. Sem
    // limpar no logout, a proxima sessao veria dado da anterior antes do
    // primeiro refetch — e o export do perfil sairia com ele.
    if (event === 'SIGNED_OUT') queryClient.clear()
  })
}
