import { useEffect, useState } from 'react'
import { AlertTriangle, Check, Info, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type Tone = 'ok' | 'fail' | 'info'

interface SnackMessage {
  id: number
  text: string
  tone: Tone
}

let counter = 0
let listeners: ((msg: SnackMessage) => void)[] = []

/**
 * Funcao global, nao hook: da pra chamar de dentro de uma mutation, de um
 * handler, de onde for. So exige que <Snackbar /> esteja montado (esta no
 * AppLayout).
 */
export function showSnack(text: string, tone: Tone = 'ok') {
  const msg = { id: ++counter, text, tone }
  listeners.forEach((l) => l(msg))
}

const ICON: Record<Tone, typeof Check> = { ok: Check, fail: AlertTriangle, info: Info }
const TONE_CLASS: Record<Tone, string> = {
  ok: 'text-ok border-ok/30',
  fail: 'text-fail border-fail/30',
  info: 'text-white border-white/25',
}

export function Snackbar() {
  const [msg, setMsg] = useState<SnackMessage | null>(null)

  useEffect(() => {
    const listener = (m: SnackMessage) => setMsg(m)
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  }, [])

  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 3200)
    return () => clearTimeout(t)
  }, [msg])

  const Icon = msg ? ICON[msg.tone] : Check

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-none fixed inset-x-4 z-200 flex justify-center',
        'bottom-[calc(84px+env(safe-area-inset-bottom))] md:bottom-8',
      )}
    >
      <div
        className={cn(
          'pointer-events-auto flex max-w-md items-center gap-3 border bg-bg-elevated px-4 py-3',
          'transition-all duration-300',
          msg ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
          msg ? TONE_CLASS[msg.tone] : 'border-border-default',
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="text-[11px] leading-tight text-text-primary">{msg?.text}</span>
        <button
          onClick={() => setMsg(null)}
          aria-label="Dispensar"
          className="ml-1 shrink-0 cursor-pointer text-text-muted transition-colors hover:text-white"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
