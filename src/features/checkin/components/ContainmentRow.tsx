import { useState } from 'react'
import { Check, ShieldOff, X } from 'lucide-react'
import type { HabitLogRow } from '@/shared/types/database.types'
import { HABITS } from '@/shared/constants/habits'
import { ConfirmDialog, Input } from '@/shared/components/ui'
import { useSound } from '@/shared/hooks/use-sound'
import { cn } from '@/shared/lib/utils'
import { stateOf, type HabitState } from '../lib/habit-state'

interface ContainmentRowProps {
  log: HabitLogRow | undefined
  onSet: (state: HabitState, trigger?: string | null) => void
}

/**
 * A Contencao tem tres estados, nao dois: limpo, recaida e sem registro.
 *
 * Marcar recaida abre uma confirmacao — nao para dificultar, mas porque e o
 * unico registro do app que reseta um contador, e um toque errado no celular
 * apagaria semanas. O campo de gatilho e opcional e vira dado no relatorio;
 * o texto e deliberadamente sem julgamento.
 */
export function ContainmentRow({ log, onSet }: ContainmentRowProps) {
  const habit = HABITS.no_pmo
  const state = stateOf(log)
  const [confirming, setConfirming] = useState(false)
  const [trigger, setTrigger] = useState('')
  const { playCheck, playRelapse } = useSound()

  return (
    <>
      <div
        className={cn(
          'entry-card p-4',
          state === 'done' && 'border-white/25',
          state === 'missed' && 'border-fail/30',
        )}
      >
        <div className="mb-4 flex items-center gap-3">
          <span
            className={cn(
              'flex size-11 shrink-0 items-center justify-center border',
              state === 'done' && 'border-white bg-white text-[#0a0a0a]',
              state === 'missed' && 'border-fail/50 text-fail',
              state === 'empty' && 'border-border-default text-text-muted',
            )}
          >
            <ShieldOff className="size-5" strokeWidth={state === 'done' ? 2 : 1.5} />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] tracking-wide text-text-primary">{habit.label}</p>
            <p className="text-[10px] text-text-muted">
              Sem pornografia e sem masturbacao
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              playCheck()
              onSet(state === 'done' ? 'empty' : 'done')
            }}
            aria-pressed={state === 'done'}
            className={cn(
              'flex min-h-12 cursor-pointer items-center justify-center gap-2 border text-[11px] uppercase tracking-[0.15em] transition-all',
              state === 'done'
                ? 'border-white bg-white text-[#0a0a0a] shadow-[0_0_14px_rgba(255,255,255,0.25)]'
                : 'border-border-default text-text-secondary hover:border-white hover:text-white',
            )}
          >
            <Check className="size-4" />
            Dia limpo
          </button>

          <button
            onClick={() => {
              if (state === 'missed') {
                onSet('empty')
                return
              }
              setTrigger('')
              setConfirming(true)
            }}
            aria-pressed={state === 'missed'}
            className={cn(
              'flex min-h-12 cursor-pointer items-center justify-center gap-2 border text-[11px] uppercase tracking-[0.15em] transition-all',
              state === 'missed'
                ? 'border-fail bg-fail/15 text-fail'
                : 'border-border-default text-text-secondary hover:border-fail/60 hover:text-fail',
            )}
          >
            <X className="size-4" />
            Recaida
          </button>
        </div>

        {state === 'missed' && log?.relapse_trigger && (
          <p className="mt-3 border-l border-fail/40 pl-3 text-[11px] leading-relaxed text-text-muted">
            Gatilho: {log.relapse_trigger}
          </p>
        )}
      </div>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Registrar recaida"
        description="O contador volta pra zero, o historico continua inteiro. Registrar e melhor do que deixar o dia em branco — dado incompleto nao ajuda ninguem."
        confirmLabel="Registrar"
        cancelLabel="Voltar"
        tone="danger"
        onConfirm={() => {
          playRelapse()
          onSet('missed', trigger.trim() || null)
        }}
      >
        <Input
          label="Gatilho (opcional)"
          placeholder="tedio, madrugada, briga, sozinho em casa..."
          value={trigger}
          onChange={(e) => setTrigger(e.target.value)}
          hint="Vira estatistica no relatorio. Serve pra achar padrao, nao pra se cobrar."
        />
      </ConfirmDialog>
    </>
  )
}
