import { useEffect, useMemo, useState } from 'react'
import { LEON_LINES } from '@/shared/constants/quotes'
import { todayKey } from '@/shared/lib/date'
import { pickByDate } from '@/shared/lib/utils'
import { usePrefersReducedMotion } from '@/shared/hooks/use-media-query'
import { cn } from '@/shared/lib/utils'

/** Milissegundos por caractere revelado. */
const CHAR_MS = 18

/**
 * A fala do Leon, como transmissao de radio.
 *
 * A escolha e deterministica pela data — a mesma frase o dia inteiro. Sortear
 * a cada render faria a frase trocar sozinha enquanto a pessoa le.
 *
 * O efeito de digitacao e feito aqui, em JS, e nao com a animacao CSS de
 * `width: 0 -> 100%`: aquela versao exigia `white-space: nowrap`, entao
 * qualquer frase que precisasse quebrar linha era cortada ou vazava do Panel.
 * Revelando por caractere o texto flui normalmente e quebra sozinho.
 */
export function LeonLine({ className }: { className?: string }) {
  const reducedMotion = usePrefersReducedMotion()
  const line = useMemo(() => pickByDate(LEON_LINES, todayKey()), [])

  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (reducedMotion) return

    const total = line.text.length
    const id = setInterval(() => {
      setShown((n) => {
        if (n >= total) {
          clearInterval(id)
          return total
        }
        return n + 1
      })
    }, CHAR_MS)

    return () => clearInterval(id)
  }, [line.text, reducedMotion])

  // Derivado, e nao um setState dentro do efeito: em reduced-motion a frase
  // aparece inteira sem precisar de um render extra so pra corrigir o estado.
  const visible = reducedMotion ? line.text.length : shown
  const typing = !reducedMotion && shown < line.text.length

  return (
    <div className={cn('radio-line', className)}>
      <p className="mb-1 text-[9px] uppercase tracking-[0.25em] text-text-muted">
        {'> D.S.O. // LEON'}
        {line.canon && line.source && (
          <span className="ml-2 border border-white/15 px-1 py-px text-[8px] text-text-muted">
            {line.source}
          </span>
        )}
      </p>
      {/*
        aria-label com a frase inteira e aria-hidden no texto animado: sem isso
        o leitor de tela anuncia de novo a cada caractere revelado.
      */}
      <p className="text-[13px] text-text-primary" aria-label={line.text}>
        <span aria-hidden className={cn(typing && 'radio-caret')}>
          {line.text.slice(0, visible)}
        </span>
      </p>
    </div>
  )
}
