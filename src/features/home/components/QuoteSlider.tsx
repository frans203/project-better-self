import { useMemo } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { A11y, Autoplay, EffectFade, Keyboard, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

import { FIELD_QUOTES } from '@/shared/constants/quotes'
import { usePrefersReducedMotion } from '@/shared/hooks/use-media-query'
import { hashString } from '@/shared/lib/utils'
import { todayKey } from '@/shared/lib/date'
import { cn } from '@/shared/lib/utils'

/**
 * Embaralha uma vez por dia, de forma deterministica.
 * Math.random() aqui reordenaria as frases a cada re-render — o slide trocaria
 * de conteudo no meio da transicao.
 */
function shuffleByDay<T>(items: readonly T[], seed: string): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = hashString(`${seed}-${i}`) % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function QuoteSlider({ className }: { className?: string }) {
  const reducedMotion = usePrefersReducedMotion()
  const quotes = useMemo(() => shuffleByDay(FIELD_QUOTES, todayKey()), [])

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
