import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/types/database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !publishableKey) {
  throw new Error(
    'Faltam VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY. Copie .env.example para .env.',
  )
}

/**
 * Client do browser. So conhece a publishable key — a secret key vive em
 * supabase/.env e nunca entra no bundle. Ver PLAN.md secao 6.2
 */
export const supabase = createClient<Database>(url, publishableKey, {
  auth: {
    // Sessao no localStorage: no celular voce loga uma vez e nao ve mais a
    // tela de login. O refresh automatico renova o access token (1h) enquanto
    // o refresh token (30d) estiver valido.
    persistSession: true,
    autoRefreshToken: true,
    // So existe login por email/senha — nada volta como fragmento na URL, e
    // deixar ligado faria o client varrer a query string a cada carga.
    detectSessionInUrl: false,
  },
})
