import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/shared/hooks/use-media-query'
import type { ArchetypeMedia } from '@/shared/constants/archetypes'

interface LoopVideoProps {
  media: ArchetypeMedia
  className?: string
  /** `metadata` para o que ja nasce na tela (hero); `none` para o resto. */
  preload?: 'none' | 'metadata' | 'auto'
  /** Fundo decorativo: some do leitor de tela em vez de ganhar rotulo. */
  decorative?: boolean
}

/**
 * Loop mudo que so toca enquanto esta na tela. Varios videos tocando fora da
 * viewport e bateria e dado movel jogados fora. Com prefers-reduced-motion
 * fica so o poster.
 *
 * Gerar os arquivos com ffmpeg (ver public/landing/README.md): webm VP9 e o
 * principal, a versao 720px entra no celular via `<source media>`, o mp4
 * H.264 e o fallback de Safari antigo.
 */
export function LoopVideo({
  media,
  className,
  preload = 'none',
  decorative = false,
}: LoopVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const video = ref.current
    if (!video || reducedMotion) return
    if (typeof IntersectionObserver === 'undefined') {
      void video.play().catch(() => {})
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        // play() rejeita quando o navegador bloqueia autoplay (economia de
        // dados, por exemplo). Nesse caso o poster fica, e esta tudo bem.
        if (entry.isIntersecting) void video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.2 },
    )
    io.observe(video)
    return () => io.disconnect()
  }, [reducedMotion])

  const a11y = decorative ? { 'aria-hidden': true } : { 'aria-label': media.alt }

  if (!media.video || reducedMotion) {
    return (
      <img
        src={media.poster}
        alt={decorative ? '' : media.alt}
        decoding="async"
        loading={preload === 'none' ? 'lazy' : 'eager'}
        className={className}
      />
    )
  }

  return (
    <video
      ref={ref}
      poster={media.poster}
      muted
      loop
      playsInline
      preload={preload}
      className={className}
      {...a11y}
    >
      {media.videoMobile && (
        <source src={media.videoMobile} type="video/webm" media="(max-width: 768px)" />
      )}
      <source src={media.video} type="video/webm" />
      {media.videoMp4 && <source src={media.videoMp4} type="video/mp4" />}
    </video>
  )
}
