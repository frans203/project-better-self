import type { CSSProperties, ElementType, ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { useInView } from '../use-in-view'

export type RevealVariant =
  | 'up' // sobe com fade
  | 'left' // entra vindo da esquerda
  | 'right' // entra vindo da direita
  | 'scale' // cresce de 92% com fade
  | 'flicker' // acende como tubo de CRT
  | 'type' // revela da esquerda pra direita em degraus, como texto sendo digitado
  | 'focus' // sai do desfoque

interface RevealProps {
  children: ReactNode
  variant?: RevealVariant
  /**
   * Anima os FILHOS diretos em sequencia em vez do bloco inteiro. O atraso de
   * cada filho vem do nth-child no CSS (ate 12); passe `step` para o ritmo.
   */
  stagger?: boolean
  /** Intervalo entre filhos no modo stagger, em ms. */
  step?: number
  /** Atraso antes de comecar, em ms. */
  delay?: number
  /** Quanto do elemento precisa estar na tela para disparar (0 a 1). */
  threshold?: number
  as?: ElementType
  className?: string
  style?: CSSProperties
}

/**
 * Conteudo que surge quando entra na tela, uma vez so.
 *
 * Todo o movimento e CSS (`.reveal*` no index.css): o componente so troca a
 * classe `is-in`. Com prefers-reduced-motion o CSS mostra tudo parado e
 * visivel desde o inicio, sem esperar o scroll.
 */
export function Reveal({
  children,
  variant = 'up',
  stagger = false,
  step = 90,
  delay = 0,
  threshold = 0.2,
  as: Tag = 'div',
  className,
  style,
}: RevealProps) {
  const [ref, seen] = useInView<HTMLElement>(threshold)

  return (
    <Tag
      ref={ref}
      className={cn(
        stagger ? 'reveal-stagger' : 'reveal',
        `reveal-${variant}`,
        seen && 'is-in',
        className,
      )}
      style={
        { '--reveal-delay': `${delay}ms`, '--reveal-step': `${step}ms`, ...style } as CSSProperties
      }
    >
      {children}
    </Tag>
  )
}
