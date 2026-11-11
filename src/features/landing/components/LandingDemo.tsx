import { useMemo, type CSSProperties } from 'react'
import { cn, fmtInt, fmtNumber } from '@/shared/lib/utils'
import { Panel, PanelHeader, StatCard } from '@/shared/components/ui'
import { RankLadder, RankSigil } from '@/features/rank/components/RankSigil'
import { RequirementList } from '@/features/rank/components/RequirementList'
import { computeRank, RANK_LABEL, type MetricKey, type RankMetrics } from '@/shared/lib/rank'
import { useCountUp } from '../use-count-up'
import { useInView } from '../use-in-view'
import { Reveal } from './Reveal'

/**
 * Painel de demonstracao. Os NUMEROS sao ficticios, mas o calculo e o motor
 * real (`computeRank`): o rank, os requisitos riscados e o que falta sao
 * exatamente o que o app mostraria com esses registros.
 *
 * Perfil escolhido: PRATA fechado, a caminho de PLATINA, faltando contencao,
 * WOD e leitura. Mostra que o rank cobra o pacote inteiro, nao so o treino.
 */
const DEMO_METRICS: RankMetrics = {
  containment: 12,
  volume: 4_820,
  reps: 74,
  wod: 210,
  km: 16.2,
  pace: 415,
  meditation: 120,
  reading: 160,
  relapses15d: 0,
  lastRelapse: null,
}

/** Progressao de e1RM no supino, uma sessao por ponto. O ultimo e o recorde. */
const E1RM = [86, 86.5, 88, 87.5, 89, 90.5, 90, 92, 93.5, 96.5]

const WEEKS = 18

/** Nivel 0-4 deterministico por celula: o heatmap nao muda a cada render. */
function heatLevel(i: number): '0' | '1' | '2' | '3' | '4' | 'fail' {
  if (i === 53) return 'fail'
  const n = (Math.imul(i + 7, 2654435761) >>> 0) % 100
  // Mais denso no fim: quem esta em PRATA ganhou consistencia com o tempo.
  const bias = i / (WEEKS * 7)
  const v = n / 100 + bias * 0.45
  if (v < 0.35) return '0'
  if (v < 0.6) return '1'
  if (v < 0.8) return '2'
  if (v < 1.0) return '3'
  return '4'
}

export function LandingDemo() {
  const rank = useMemo(() => computeRank(DEMO_METRICS), [])
  const [ref, seen] = useInView<HTMLDivElement>(0.1)
  // Contadores dos cartoes: correm de 0 ate o valor quando o painel aparece.
  const containment = useCountUp(DEMO_METRICS.containment, seen, 1100)
  const volume = useCountUp(DEMO_METRICS.volume, seen, 1500)
  const km = useCountUp(DEMO_METRICS.km, seen, 1300)
  const reading = useCountUp(DEMO_METRICS.reading, seen, 1400)

  // Os riscos so animam quando o painel entra na tela; antes disso aparecem
  // sem risco, para a animacao acontecer na frente de quem esta olhando.
  const striking = useMemo(
    () => new Set<MetricKey>(rank.requirements.filter((r) => r.met).map((r) => r.key)),
    [rank],
  )
  // Antes de aparecer: nada cumprido e barra vazia. Depois, as barras enchem
  // (transicao do Meter) e os cumpridos ganham o risco animado.
  const requirements = seen
    ? rank.requirements
    : rank.requirements.map((r) => ({ ...r, met: false, pct: 0 }))

  return (
    <div ref={ref} className={cn('grid min-w-0 gap-3 lg:grid-cols-[1.1fr_1fr]', seen && 'is-live')}>
      <Reveal stagger step={120} threshold={0.1} className="grid min-w-0 gap-3">
        <Panel className="flex items-center gap-4 p-4">
          <RankSigil rank={rank.current} size={56} glow className="demo-sigil" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Nível atual</p>
            <p className="font-display text-3xl leading-none text-white">
              {RANK_LABEL[rank.current]}
            </p>
            {/* -1 ate aparecer: os entalhes acendem um a um (delay no CSS). */}
            <RankLadder index={seen ? rank.currentIndex : -1} className="mt-2" />
          </div>
        </Panel>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Contenção" value={fmtInt(containment)} unit="dias" />
          <StatCard label="Volume 7 dias" value={fmtInt(volume)} unit="kg" />
          <StatCard label="Corrida 7 dias" value={fmtNumber(km, 1)} unit="km" />
          <StatCard label="Leitura 15 dias" value={fmtInt(reading)} unit="pág" />
        </div>

        <Panel>
          <PanelHeader title="Supino reto" hint="1RM estimado por sessão" />
          <E1rmChart />
        </Panel>

        <Panel>
          <PanelHeader title="Consistência" hint={`Últimas ${WEEKS} semanas`} />
          <div className="p-4">
            <div
              className="grid grid-flow-col gap-[3px]"
              style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}
              aria-hidden
            >
              {Array.from({ length: WEEKS * 7 }, (_, i) => (
                <span
                  key={i}
                  className="heat-cell demo-heat cursor-default"
                  data-level={heatLevel(i)}
                  // Onda por semana (coluna), com um respiro por dia dentro dela.
                  style={
                    {
                      '--heat-delay': `${Math.floor(i / 7) * 45 + (i % 7) * 12}ms`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
            <p className="mt-3 text-[10px] text-text-muted">
              Cada célula é um dia. Vermelho é recaída registrada.
            </p>
          </div>
        </Panel>
      </Reveal>

      <Reveal variant="right" delay={250} threshold={0.1} className="min-w-0">
        <Panel className="h-full min-w-0">
          <PanelHeader
            title={`Requisitos para ${RANK_LABEL[rank.next ?? 'mestre']}`}
            hint="Os oito, ao mesmo tempo"
          />
          <div className="p-4">
            <RequirementList requirements={requirements} striking={striking} />
            <p className="mt-5 border-t border-border-default pt-4 text-[11px] leading-relaxed text-text-secondary">
              Faltam {rank.requirements.filter((r) => !r.met).length}. Treino sozinho não sobe
              nível: contenção, condicionamento e leitura contam igual.
            </p>
          </div>
        </Panel>
      </Reveal>
    </div>
  )
}

function E1rmChart() {
  const w = 320
  const h = 120
  const pad = 12
  const min = Math.min(...E1RM) - 2
  const max = Math.max(...E1RM) + 2
  const x = (i: number) => pad + (i / (E1RM.length - 1)) * (w - pad * 2)
  const y = (v: number) => h - pad - ((v - min) / (max - min)) * (h - pad * 2)
  const points = E1RM.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  const last = E1RM.length - 1

  return (
    <div className="p-4">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full"
        role="img"
        aria-label="Linha de 1RM estimado subindo de 86 para 96,5 kg em dez sessões"
      >
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={pad}
            x2={w - pad}
            y1={pad + f * (h - pad * 2)}
            y2={pad + f * (h - pad * 2)}
            stroke="rgba(255,255,255,0.06)"
          />
        ))}
        <polyline
          points={points}
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          pathLength={1}
          className="demo-line"
        />
        <circle
          cx={x(last)}
          cy={y(E1RM[last])}
          r={4}
          fill="#fff"
          stroke="#111"
          strokeWidth={2}
          className="demo-dot"
        />
      </svg>
      <div className="mt-2 flex items-baseline justify-between text-[10px] uppercase tracking-[0.15em]">
        <span className="text-text-muted">10 sessões</span>
        <span className="demo-pr text-white">Novo recorde · 96,5 kg</span>
      </div>
    </div>
  )
}
