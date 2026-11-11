import { ARCHETYPES, SHOW_SHOWCASE_NAMES, type Archetype } from '@/shared/constants/archetypes'
import { cn } from '@/shared/lib/utils'
import { LoopVideo } from './LoopVideo'
import { Reveal } from './Reveal'

/**
 * Arquetipos empilhados: impar com a arte a esquerda, par com a arte a
 * direita. No celular a arte vai sempre em cima (alternar numa coluna so nao
 * faz sentido).
 */
export function LandingArchetypes() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {ARCHETYPES.map((a, i) => (
        <ArchetypeRow key={a.codename} archetype={a} index={i} />
      ))}
    </div>
  )
}

function ArchetypeRow({ archetype: a, index }: { archetype: Archetype; index: number }) {
  const flipped = index % 2 === 1

  return (
    // A linha entra do lado onde esta a arte, e a arte "abre" do mesmo lado.
    <Reveal
      as="article"
      variant={flipped ? 'right' : 'left'}
      threshold={0.25}
      className="scan-hover grid border border-border-default bg-bg-surface md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
    >
      <div className={cn('landing-art-wipe min-w-0', flipped && 'md:order-2')}>
        <ArchetypeArt archetype={a} index={index} />
      </div>

      <div
        className={cn(
          'flex min-w-0 flex-col justify-center gap-4 p-5 md:p-8',
          flipped && 'md:order-1',
        )}
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-text-muted">
          Classe {String(index + 1).padStart(2, '0')}
        </p>
        {/* Vitrine ligada: so o personagem. Desligada: volta o codinome. */}
        <h3 className="font-display text-4xl leading-none text-white uppercase md:text-5xl">
          {SHOW_SHOWCASE_NAMES ? a.showcaseName : a.label}
        </h3>
        <p className="text-[15px] text-text-primary">{a.tagline}</p>
        <p className="text-[13px] leading-relaxed text-text-secondary">{a.protocol}</p>
        <ul className="flex flex-wrap gap-2 border-t border-border-default pt-4">
          {a.focus.map((f) => (
            <li
              key={f}
              className="border border-border-default px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-text-secondary"
            >
              {f}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  )
}

function ArchetypeArt({ archetype: a, index }: { archetype: Archetype; index: number }) {
  if (!a.media) {
    return (
      <div className="landing-art h-full" aria-hidden>
        <span className="font-display text-7xl text-white/10">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
    )
  }
  return <LoopVideo media={a.media} className="landing-art-media" />
}
