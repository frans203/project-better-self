import { useMemo } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { A11y, Autoplay, EffectFade, Keyboard, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

import { FIELD_QUOTES } from '@/shared/constants/quotes'
import { usePrefersReducedMotion } from '@/shared/hooks/use-media-query'
import { cn } from '@/shared/lib/utils'

/** Fisher-Yates. */
function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function QuoteSlider({ className }: { className?: string }) {
  const reducedMotion = usePrefersReducedMotion()
  // Uma ordem nova a cada abertura do app, nao a cada dia: com a ordem travada
  // por 24h, quem abre tres vezes no mesmo dia le sempre as mesmas primeiras
  // frases. O useMemo com deps vazias e o que segura o Math.random() — sem ele
  // a lista se reordenaria a cada render e o slide trocaria de conteudo no
  // meio da transicao.
  const quotes = useMemo(() => shuffle(FIELD_QUOTES), [])

  return (
    <div className={cn('quote-swiper', className)}>
      <Swiper
        modules={[Autoplay, EffectFade, Pagination, A11y, Keyboard]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop
        speed={reducedMotion ? 0 : 700}
        // Sem autoplay em reduced-motion: o usuario navega pelos bullets.
        autoplay={
          reducedMotion
            ? false
            : { delay: 9000, disableOnInteraction: false, pauseOnMouseEnter: true }
        }
        // dynamicBullets: com ~30 frases, a paginacao completa vira uma regua
        // de tracinhos mais larga que o proprio texto.
        pagination={{ clickable: true, dynamicBullets: true, dynamicMainBullets: 3 }}
        keyboard={{ enabled: true, onlyInViewport: true }}
        a11y={{
          prevSlideMessage: 'Frase anterior',
          nextSlideMessage: 'Proxima frase',
          paginationBulletMessage: 'Ir para a frase {{index}}',
        }}
        className="!pb-7"
      >
        {quotes.map((quote) => (
          <SwiperSlide key={quote.text}>
            <blockquote className="border-l border-white/25 pl-4">
              <p className="text-[13px] leading-relaxed text-text-primary">{quote.text}</p>
              {quote.author && (
                <footer className="mt-2 text-[10px] uppercase tracking-[0.18em] text-text-muted">
                  {quote.author}
                  {quote.note && <span className="normal-case tracking-normal"> — {quote.note}</span>}
                </footer>
              )}
            </blockquote>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
