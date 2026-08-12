import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { queryKeys, queryClient } from '@/shared/lib/query-client'
import { getUserId } from '@/shared/lib/user'
import type { ProfileRow } from '@/shared/types/database.types'
import { showSnack } from '@/shared/components/ui'

export const profileQuery = () =>
  queryOptions({
    queryKey: queryKeys.profile,
    queryFn: async (): Promise<ProfileRow> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', getUserId())
        .maybeSingle()

      if (error) throw error

      // Primeira execucao sem seed rodado: cria a linha do operador local.
      if (!data) {
        const { data: created, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: getUserId(), display_name: 'AGENTE' })
          .select()
          .single()
        if (insertError) throw insertError
        return created
      }

      return data
    },
    // O perfil quase nunca muda; nao vale refetch a cada navegacao.
    staleTime: 10 * 60_000,
  })

export function useUpdateProfile() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (patch: Partial<ProfileRow>) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(patch)
        .eq('id', getUserId())
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.profile, data)
      showSnack('Perfil atualizado')
    },
    onError: (e: Error) => showSnack(e.message, 'fail'),
  })
}

/** Usado fora de componente (ex.: calculo de streak em loader). */
export const getCachedProfile = () => queryClient.getQueryData<ProfileRow>(queryKeys.profile)
