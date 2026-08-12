import { cn } from '@/shared/lib/utils'

interface GlitchLogoProps {
  text: string
  className?: string
  style?: React.CSSProperties
}

export function GlitchLogo({ text, className, style }: GlitchLogoProps) {
  return (
    <span
      className={cn('logo-glitch font-display', className)}
      data-text={text}
      style={style}
      aria-label={text}
    >
      {text}
    </span>
  )
}
