import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { ErrorState, Loading, Panel, SectionLabel, Badge } from '@/shared/components/ui'
import { celebrationKey, RANK_LABEL, type MetricKey } from '@/shared/lib/rank'
import { fmtDayShort } from '@/shared/lib/date'
import { useUiStore } from '@/shared/store/ui-store'
import { usePrefersReducedMotion } from '@/shared/hooks/use-media-query'
import { useRank } from '../api/rank-api'
import { fireConfetti } from '../lib/celebrate'
import { RankLadder, RankSigil } from './RankSigil'
import { RequirementList } from './RequirementList'
import { BattleLine, ScriptureBlock } from './ScriptureBlock'

export function RankPage() {
  const { rank, isPending, isError } = useRank()
  const reducedMotion = usePrefersReducedMotion()

  const celebrated = useUiStore((s) => s.celebrated)
  const markCelebrated = useUiStore((s) => s.markCelebrated)

  /*
    Snapshot do que ja tinha confete quando a tela abriu, num useState com
    inicializador preguicoso — e nao num ref, que nao pode ser lido durante o
    render. Congelar e necessario: sem isso o proprio markCelebrated esvaziaria
    a lista de "novos" no render seguinte e o risco animado nunca apareceria.
  */
  const [seenAtMount] = useState(() => celebrated)
  const fired = useRef(false)
  const [struck, setStruck] = useState<Set<MetricKey>>(() => new Set())

  const target = rank.next ?? 'mestre'

  const fresh = useMemo(() => {
    if (isPending) return [] as MetricKey[]
    return rank.requirements
      .filter((r) => r.met && !seenAtMount[celebrationKey(target, r.key)])
      .map((r) => r.key)
  }, [rank.requirements, target, isPending, seenAtMount])

  useEffect(() => {
    if (fired.current || fresh.length === 0) return
    fired.current = true

    setStruck(new Set(fresh))
    markCelebrated(fresh.map((k) => celebrationKey(target, k)))
    if (!reducedMotion) void fireConfetti()
  }, [fresh, target, markCelebrated, reducedMotion])

  const metCount = rank.requirements.filter((r) => r.met).length

  return (
    <div className="page-section mx-auto w-full max-w-2xl">
      <PageHeader title="Nível" subtitle="Escada de completude" />

      {isError ? (
        <ErrorState error={new Error('Não foi possível ler os registros.')} />
      ) : isPending ? (
        <Loading label="Calculando nível" />
      ) : (
        <div className="flex flex-col gap-5 boot-up">
          <Panel className="flex flex-col items-center px-5 py-8">
            <RankSigil rank={rank.current} size={120} glow className="text-white" />

            <h2 className="mt-5 font-display text-2xl tracking-[0.3em] text-white accent-text">
              {RANK_LABEL[rank.current]}
            </h2>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-text-muted">
              nível {rank.currentIndex + 1} de 9
            </p>

            <RankLadder index={rank.currentIndex} className="mt-5" />

            {rank.demotion > 0 && (
              <div className="mt-5 flex flex-col items-center gap-1.5">
                <Badge tone="fail">
                  <AlertTriangle className="size-3" />
                  {rank.demotion === 2 ? 'Rebaixado 2 níveis' : 'Rebaixado 1 nível'}
                </Badge>
                <p className="text-center text-[10px] text-text-muted [overflow-wrap:anywhere]">
                  Você tinha alcançado {RANK_LABEL[rank.base]}.{' '}
                  {rank.metrics.relapses15d >= 2
                    ? `${rank.metrics.relapses15d} recaídas nos últimos 15 dias derrubam dois níveis.`
                    : 'Uma recaída nos últimos 15 dias derruba um nível.'}
                  {rank.metrics.lastRelapse &&
                    ` Última em ${fmtDayShort(rank.metrics.lastRelapse)}.`}
                </p>
              </div>
            )}
          </Panel>

          <div>
            <SectionLabel className="mb-3">
              {rank.next ? `Para ${RANK_LABEL[rank.next]}` : 'Requisitos de MESTRE'}
            </SectionLabel>
            <Panel className="p-5">
              <p className="mb-4 text-[10px] leading-relaxed text-text-muted">
                {metCount} de {rank.requirements.length} cumpridos. Toda medida sobe a cada
                nível — pace é a única que desce, porque exigir mais é exigir menos tempo por km.
                Repetições somam academia e WOD; volume conta só a carga levantada.
              </p>
              <RequirementList requirements={rank.requirements} striking={struck} />
            </Panel>
          </div>

          <BattleLine />
          <ScriptureBlock />
        </div>
      )}
    </div>
  )
}
