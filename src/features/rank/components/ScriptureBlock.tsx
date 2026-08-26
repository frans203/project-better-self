import { useMemo } from 'react'
import { Panel } from '@/shared/components/ui'
import { SCRIPTURES, THEME_LABEL } from '@/shared/constants/scripture'
import { BATTLE_LINES } from '@/shared/constants/battle-lines'
import { todayKey } from '@/shared/lib/date'
import { pickByDate } from '@/shared/lib/utils'

/**
 * Frase do dia e passagem do dia.
 *
 * As duas usam pickByDate com chaves diferentes: sem o sufixo, o mesmo hash
 * escolheria indices correlacionados e as duas listas andariam em sincronia
 * dia apos dia.
 */
export function BattleLine() {
  const line = useMemo(() => pickByDate(BATTLE_LINES, `${todayKey()}#battle`), [])

  return (
    <Panel className="p-5">
      <p className="mb-2 text-[9px] uppercase tracking-[0.25em] text-text-muted">
        {'> TRANSMISSÃO'}
      </p>
      <p className="text-[13px] leading-relaxed text-text-primary [overflow-wrap:anywhere]">
        {line}
      </p>
    </Panel>
  )
}

export function ScriptureBlock() {
  const passage = useMemo(() => pickByDate(SCRIPTURES, `${todayKey()}#word`), [])

  return (
    <Panel className="p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.22em] text-white">{passage.ref}</p>
        <span className="shrink-0 border border-white/15 px-1.5 py-px text-[8px] uppercase tracking-[0.14em] text-text-muted">
          {THEME_LABEL[passage.theme]}
        </span>
      </div>

      <ol className="flex flex-col gap-2 border-l border-white/25 pl-4">
        {passage.verses.map((v) => (
          <li key={v.n} className="text-[13px] leading-relaxed text-text-primary [overflow-wrap:anywhere]">
            <sup className="mr-1.5 text-[9px] text-text-muted">{v.n}</sup>
            {v.text}
          </li>
        ))}
      </ol>

      <p className="mt-3 text-right text-[9px] uppercase tracking-[0.18em] text-text-muted">
        Almeida Revista e Corrigida
      </p>
    </Panel>
  )
}
