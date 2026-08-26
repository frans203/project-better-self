import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ExternalLink, Minus, X } from 'lucide-react'
import { Input } from '@/shared/components/ui'
import type { HabitMeta } from '@/shared/constants/habits'
import type { HabitLogRow } from '@/shared/types/database.types'
import { cn } from '@/shared/lib/utils'
import { useSound } from '@/shared/hooks/use-sound'
import { stateOf, type HabitState } from '../lib/habit-state'

interface HabitRowProps {
  habit: HabitMeta
  log: HabitLogRow | undefined
  /** Corrida e treino sao preenchidos pelo trigger do banco; nao da pra editar aqui. */
  locked?: boolean
  onToggle: (next: HabitState) => void
  onValueChange: (value: number | null) => void
}

export function HabitRow({ habit, log, locked = false, onToggle, onValueChange }: HabitRowProps) {
  const state = stateOf(log)
  const { playCheck, playUncheck } = useSound()
  const Icon = habit.icon

  // Campo numerico local: escrever direto na mutation dispararia um upsert
  // por tecla digitada.
  //
  // Sem useEffect de sincronia: o pai monta este componente com key por dia,
  // entao trocar de dia ja reinicializa o estado. Sincronizar por efeito
  // apagaria o que estivesse sendo digitado toda vez que a mutation otimista
  // atualizasse o cache.
  const [draft, setDraft] = useState(() => (log?.value != null ? String(log.value) : ''))

  const commitValue = () => {
    const parsed = draft.trim() === '' ? null : Number(draft.replace(',', '.'))
    if (parsed !== null && (Number.isNaN(parsed) || parsed < 0)) {
      setDraft(log?.value != null ? String(log.value) : '')
      return
    }
    if (parsed !== (log?.value ?? null)) onValueChange(parsed)
  }

  const handleToggle = () => {
    if (locked) return
    const next: HabitState = state === 'done' ? 'empty' : 'done'
    if (next === 'done') playCheck()
    else playUncheck()
    onToggle(next)
  }

  return (
    <div
      className={cn(
        'entry-card flex flex-col gap-3 p-4 transition-colors sm:flex-row sm:items-center',
        state === 'done' && 'border-white/25',
        state === 'missed' && 'border-fail/30',
      )}
    >
      <button
        onClick={handleToggle}
        disabled={locked}
        aria-pressed={state === 'done'}
        aria-label={`${habit.label}: ${state === 'done' ? habit.doneLabel : habit.missLabel}`}
        className={cn(
          'flex min-h-12 flex-1 items-center gap-3 text-left transition-colors',
          locked ? 'cursor-default' : 'cursor-pointer',
        )}
      >
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center border transition-all',
            state === 'done' && 'border-white bg-white text-[#0a0a0a] shadow-[0_0_14px_rgba(255,255,255,0.25)]',
            state === 'missed' && 'border-fail/50 text-fail',
            state === 'empty' && 'border-border-default text-text-muted',
          )}
        >
          {state === 'done' ? (
            <Check className="size-5" strokeWidth={2.5} />
          ) : state === 'missed' ? (
            <X className="size-5" strokeWidth={2.5} />
          ) : (
            <Icon className="size-5" strokeWidth={1.5} />
          )}
        </span>

        <span className="min-w-0">
          <span className="block text-[13px] tracking-wide text-text-primary">{habit.label}</span>
          <span
            className={cn(
              'block text-[10px] uppercase tracking-[0.15em]',
              state === 'done' && 'text-white',
              state === 'missed' && 'text-fail',
              state === 'empty' && 'text-text-muted',
            )}
          >
            {state === 'done' ? habit.doneLabel : state === 'missed' ? habit.missLabel : 'Sem registro'}
          </span>
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-2">
        {habit.unit && (
          /*
            O rotulo e a unidade por extenso ("minutos", "paginas"), que sobe
            ao focar. Antes era so um placeholder "0" com aria-label: quem
            digitava perdia a unica pista de que aquele numero era minuto ou
            pagina. O sufixo curto sai — com o rotulo dentro do campo ele
            passaria a ser a mesma informacao duas vezes.
          */
          <Input
            /* w-32 e nao w-28: "quilometros" em repouso pede 86px e o campo
               menor so oferecia 84, entao o rotulo mais longo vinha cortado. */
            wrapperClassName="w-32 shrink-0"
            label={habit.unitLabel ?? habit.unit}
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={draft}
            disabled={locked}
            placeholder="0"
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitValue}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className="text-right text-sm [appearance:textfield] disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        )}

        {habit.detailRoute && (
          <Link
            to={habit.detailRoute}
            aria-label={`Abrir ${habit.label}`}
            className="border border-border-default p-2.5 text-text-muted transition-colors hover:border-white hover:text-white"
          >
            <ExternalLink className="size-4" />
          </Link>
        )}

        {!habit.unit && !habit.detailRoute && state !== 'empty' && !locked && (
          <button
            onClick={() => onToggle('empty')}
            aria-label="Limpar registro"
            className="cursor-pointer border border-border-default p-2.5 text-text-muted transition-colors hover:border-white hover:text-white"
          >
            <Minus className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}
