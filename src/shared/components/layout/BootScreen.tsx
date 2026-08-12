import { useEffect, useState } from 'react'
import { GlitchLogo } from '@/shared/components/ui'
import { usePrefersReducedMotion } from '@/shared/hooks/use-media-query'
import { useUiStore } from '@/shared/store/ui-store'

const LINES = [
  '> initializing operation: better self',
  '> mounting local operator ......... OK',
  '> linking supabase ............... OK',
  '> loading field manual ........... OK',
  '> agent status: ACTIVE',
]

/**
 * Terminal de boot. Roda uma vez por sessao (nao por dispositivo) e sai do
 * caminho na hora com prefers-reduced-motion.
 */
export function BootScreen({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(0)
  const reducedMotion = usePrefersReducedMotion()
  const markBooted = useUiStore((s) => s.markBooted)

  useEffect(() => {
    if (reducedMotion) {
      markBooted()
      onDone()
      return
    }

    const timers = LINES.map((_, i) => setTimeout(() => setVisible(i + 1), 160 * (i + 1)))
    const finish = setTimeout(() => {
      markBooted()
      onDone()
    }, 160 * LINES.length + 420)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(finish)
    }
  }, [onDone, reducedMotion, markBooted])

  if (reducedMotion) return null

  return (
    <div className="boot-screen" role="status" aria-live="polite">
      <GlitchLogo text="OBS" className="mb-6 text-3xl text-white" />
      <div className="flex w-[min(90vw,420px)] flex-col gap-1 text-[11px] text-text-secondary">
        {LINES.slice(0, visible).map((line) => (
          <span key={line} className="boot-line">
            {line}
          </span>
        ))}
        <span className="terminal-text" />
      </div>
    </div>
  )
}
