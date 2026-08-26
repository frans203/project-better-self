import type { ReactNode } from 'react'
import { RANK_KEYS, type RankKey } from '@/shared/lib/rank'
import { cn } from '@/shared/lib/utils'

/**
 * A insignia de cada nivel.
 *
 * Tudo em traco branco (`currentColor`), sem paleta categorica: o accent do
 * sistema e branco e cor esta reservada para estado. O que separa um nivel do
 * outro e a FORMA — colchete quebrado, gema com mais facetas, divisas
 * militares, estrela — mais o rotulo. Isso continua legivel em monocromatico,
 * o que uma escala de cores de rank nao seria.
 */

/** Gema: a mesma silhueta do bronze ao diamante, ganhando facetas. */
const GEM = 'M10 19 L15 9 H33 L38 19 L24 41 Z'

const CHEVRON = (y: number) => `M11 ${y + 11} L24 ${y} L37 ${y + 11}`

const SIGILS: Record<RankKey, ReactNode> = {
  // Colchete quebrado: ainda nao ha nada montado.
  lixo: (
    <>
      <path d="M17 11 H12 V37 H17" strokeDasharray="4 3" />
      <path d="M31 11 H36 V37 H31" strokeDasharray="4 3" />
      <path d="M18 30 L30 18" />
    </>
  ),
  bronze: (
    <>
      <path d={GEM} />
      <path d="M10 19 H38" />
    </>
  ),
  prata: (
    <>
      <path d={GEM} />
      <path d="M10 19 H38" />
      <path d="M15 9 L19 19 L24 41" />
    </>
  ),
  platina: (
    <>
      <path d={GEM} />
      <path d="M10 19 H38" />
      <path d="M15 9 L19 19 L24 41" />
      <path d="M33 9 L29 19 L24 41" />
    </>
  ),
  diamante: (
    <>
      <path d={GEM} />
      <path d="M10 19 H38" />
      <path d="M15 9 L19 19 L24 41" />
      <path d="M33 9 L29 19 L24 41" />
      <path d="M19 19 H29" />
      <path d="M24 9 V19" />
    </>
  ),
  soldado: <path d={CHEVRON(24)} />,
  sargento: (
    <>
      <path d={CHEVRON(18)} />
      <path d={CHEVRON(28)} />
    </>
  ),
  capitao: (
    <>
      <path d={CHEVRON(13)} />
      <path d={CHEVRON(23)} />
      <path d={CHEVRON(33)} />
    </>
  ),
  mestre: (
    <>
      <path d="M7 7 H41 V41 H7 Z" />
      <path d="M24 12 L28.2 20.6 L37.6 21.9 L30.8 28.5 L32.4 37.8 L24 33.4 L15.6 37.8 L17.2 28.5 L10.4 21.9 L19.8 20.6 Z" />
    </>
  ),
}

interface RankSigilProps {
  rank: RankKey
  size?: number
  className?: string
  /** Liga o brilho. Usado na tela de nivel, nao no painel compacto. */
  glow?: boolean
}

export function RankSigil({ rank, size = 48, className, glow = false }: RankSigilProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={cn('rank-sigil', glow && 'rank-sigil-glow', className)}
    >
      {SIGILS[rank]}
    </svg>
  )
}

/** Trilho de 9 entalhes: onde voce esta na escada inteira. */
export function RankLadder({ index, className }: { index: number; className?: string }) {
  return (
    <div className={cn('rank-ladder', className)} aria-hidden>
      {RANK_KEYS.map((key, i) => (
        <span
          key={key}
          className={cn('rank-notch', i <= index && 'on', i === index && 'current')}
        />
      ))}
    </div>
  )
}
