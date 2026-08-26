import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Panel, Badge } from '@/shared/components/ui'
import { RANK_LABEL } from '@/shared/lib/rank'
import { useRank } from '../api/rank-api'
import { RankSigil } from './RankSigil'
import { RequirementList } from './RequirementList'

/**
 * O detalhamento dentro do relatorio.
 *
 * Sem confete e sem risco animado: a comemoracao pertence a /rank, que e onde
 * a pessoa vai de proposito ver o nivel. Aqui e leitura de relatorio.
 */
export function RankBreakdown() {
  const { rank, isPending } = useRank()

  if (isPending) return null

  return (
    <Panel className="p-5">
      <div className="mb-4 flex items-center gap-4">
        <RankSigil rank={rank.current} size={40} className="shrink-0 text-white" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-base tracking-[0.2em] text-white">
            {RANK_LABEL[rank.current]}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-text-muted">
            nível {rank.currentIndex + 1} de 9
            {rank.next ? ` · próximo ${RANK_LABEL[rank.next]}` : ' · topo da escada'}
          </p>
        </div>
        {rank.demotion > 0 && (
          <Badge tone="fail">−{rank.demotion} por recaída</Badge>
        )}
        <Link
          to="/rank"
          aria-label="Abrir tela de nível"
          className="shrink-0 p-1 text-text-muted transition-colors hover:text-white"
        >
          <ChevronRight className="size-4" />
        </Link>
      </div>

      <RequirementList requirements={rank.requirements} />
    </Panel>
  )
}
