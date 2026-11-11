import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Panel, Meter } from '@/shared/components/ui'
import { RANK_LABEL } from '@/shared/lib/rank'
import { useRank } from '../api/rank-api'
import { RankLadder, RankSigil } from './RankSigil'

/**
 * Versao compacta para a home.
 *
 * Nao dispara confete: quem comemora e a tela /rank. Se a home tambem
 * disparasse, o confete apareceria toda manha na primeira tela do app e
 * perderia o sentido em uma semana.
 */
export function RankPanel() {
  const { rank, isPending } = useRank()

  const metCount = rank.requirements.filter((r) => r.met).length
  const total = rank.requirements.length

  return (
    <Panel scan className="p-0">
      <Link
        to="/app/rank"
        className="flex items-center gap-4 p-5 transition-colors hover:bg-white/3"
      >
        <RankSigil rank={rank.current} size={44} className="shrink-0 text-white" />

        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary">Nível</p>
          <p className="font-display text-lg tracking-[0.2em] text-white">
            {isPending ? '—' : RANK_LABEL[rank.current]}
          </p>
          <RankLadder index={rank.currentIndex} className="mt-2" />

          {!isPending && rank.next && (
            <div className="mt-2.5 flex items-center gap-2">
              <Meter value={metCount} max={total} className="flex-1" />
              <span className="shrink-0 text-[10px] text-text-muted">
                {metCount}/{total} para {RANK_LABEL[rank.next]}
              </span>
            </div>
          )}
        </div>

        <ChevronRight className="size-4 shrink-0 text-text-muted" />
      </Link>
    </Panel>
  )
}
