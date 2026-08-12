import { useAuthStore } from '@/shared/store/auth-store'

/**
 * Ponto unico de verdade sobre "quem esta usando o app".
 *
 * Nenhuma feature toca em user_id diretamente — todas passam por aqui, e por
 * isso ligar a auth foi trocar o corpo desta funcao.
 *
 * Le do store em vez de `supabase.auth.getSession()` porque essa funcao e
 * assincrona no supabase-js v2: chamada de dentro de um `queryFn` ela
 * devolveria uma Promise, `?.user.id` daria undefined e todo insert gravaria
 * user_id nulo sem erro visivel.
 */
export function getUserId(): string {
  const id = useAuthStore.getState().session?.user.id
  if (!id) {
    // Nao deveria acontecer: RequireSession nao monta as rotas sem sessao.
    // Se acontecer, falhar alto e melhor do que escrever linha orfa.
    throw new Error('Sem sessao ativa.')
  }
  return id
}
