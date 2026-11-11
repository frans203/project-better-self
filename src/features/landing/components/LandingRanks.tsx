import { useState } from 'react'
import { Panel, PanelHeader } from '@/shared/components/ui'
import { RankSigil } from '@/features/rank/components/RankSigil'
import {
  EMPTY_METRICS,
  RANK_KEYS,
  RANK_LABEL,
  requirementsFor,
  type RankKey,
} from '@/shared/lib/rank'
import { cn } from '@/shared/lib/utils'
import { Reveal } from './Reveal'

/**
 * A escada, com as metas REAIS de cada nivel (a mesma tabela do motor).
 * Nada de descricao inventada por degrau: o que aparece e o que o app cobra.
 */
export function LandingRanks() {
  const [selected, setSelected] = useState<RankKey>('prata')
  const targets = requirementsFor(selected, EMPTY_METRICS)

  return (
    <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* As nove insignias acendem uma a uma, de LIXO a MESTRE. */}
      <Reveal
        stagger
        variant="scale"
        step={95}
        threshold={0.25}
        className="grid grid-cols-3 gap-px border border-border-default bg-border-default"
      >
        {RANK_KEYS.map((key, i) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelected(key)}
            aria-pressed={selected === key}
            className={cn(
              'flex flex-col items-center gap-2 bg-bg-surface px-2 py-4 transition-colors',
              'cursor-pointer hover:bg-bg-elevated',
              selected === key && 'bg-bg-elevated',
            )}
          >
            <RankSigil
              rank={key}
              size={40}
              glow={selected === key}
              className={selected === key ? 'text-white' : undefined}
            />
            <span
              className={cn(
                'text-[10px] uppercase tracking-[0.18em]',
                selected === key ? 'text-white' : 'text-text-secondary',
              )}
            >
              {RANK_LABEL[key]}
            </span>
            <span className="text-[9px] text-text-muted">{String(i).padStart(2, '0')}</span>
          </button>
        ))}
      </Reveal>

      <Reveal variant="right" delay={500} threshold={0.25} className="min-w-0">
        <Panel className="h-full min-w-0" scan>
          <PanelHeader
            title={`Nível ${RANK_LABEL[selected]}`}
            hint={selected === 'lixo' ? 'Ponto de partida' : 'Todos os requisitos ao mesmo tempo'}
          />
          {selected === 'lixo' ? (
            <p className="p-4 text-[13px] leading-relaxed text-text-secondary">
              Nenhum requisito. Registro zerado. Todo mundo começa aqui, inclusive quem já treina há
              anos: o sistema só reconhece o que foi registrado.
            </p>
          ) : (
            <ul className="divide-y divide-border-default">
              {targets.map((r) => (
                <li key={r.key} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                  <span className="min-w-0 text-[12px] text-text-primary">
                    {r.label}
                    <span className="ml-2 text-[9px] uppercase tracking-[0.12em] text-text-muted">
                      {r.window}
                    </span>
                  </span>
                  <span className="shrink-0 text-[12px] text-white">
                    {r.lowerIsBetter ? '≤ ' : '≥ '}
                    {r.targetText}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </Reveal>
    </div>
  )
}
