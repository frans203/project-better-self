import { NavLink } from 'react-router-dom'
import { Monitor, Volume2, VolumeX } from 'lucide-react'
import { NAV_ITEMS } from './nav-items'
import { GlitchLogo } from '@/shared/components/ui'
import { useSound } from '@/shared/hooks/use-sound'
import { useUiStore } from '@/shared/store/ui-store'
import { cn } from '@/shared/lib/utils'

/**
 * Rail de 60px que abre para 208px.
 *
 * A expansao e CSS puro (#rail:hover ~ #main / #rail:focus-within ~ #main),
 * entao rail e main precisam ser IRMAOS no DOM — ver AppLayout. Fazer isso
 * em JS custaria re-render a cada mouseenter sem ganho nenhum.
 *
 * O focus-within e o que torna o rail utilizavel por teclado; so hover
 * deixaria a navegacao por Tab presa num rail fechado.
 */
export function NavRail() {
  const { playNav, playClick } = useSound()
  const { crt, sound, toggleCrt, toggleSound } = useUiStore()

  return (
    <aside id="rail" aria-label="Navegacao principal">
      <div className="mb-8 flex h-10 w-full items-center gap-3 pl-[15px]">
        <GlitchLogo text="OBS" className="shrink-0 text-lg text-white" />
        <span className="logo-text text-[9px] leading-tight tracking-[0.18em] text-text-secondary">
          OPERATION
          <br />
          BETTER SELF
        </span>
      </div>

      <nav className="flex w-full flex-1 flex-col">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => playNav()}
            className={({ isActive }) => cn('nav-item', isActive && 'active')}
          >
            <Icon strokeWidth={1.5} />
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        className="nav-item mt-auto"
        onClick={() => {
          playClick()
          toggleCrt()
        }}
        aria-pressed={crt}
        style={{ color: crt ? 'var(--accent-dim)' : 'var(--text-muted)' }}
      >
        <Monitor strokeWidth={1.5} />
        <span className="nav-label">CRT</span>
      </button>

      <button
        className="nav-item"
        onClick={() => {
          toggleSound()
          playClick()
        }}
        aria-pressed={sound}
        style={{ color: sound ? 'var(--accent-dim)' : 'var(--text-muted)' }}
      >
        {sound ? <Volume2 strokeWidth={1.5} /> : <VolumeX strokeWidth={1.5} />}
        <span className="nav-label">Som</span>
      </button>
    </aside>
  )
}
