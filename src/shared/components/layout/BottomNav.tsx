import { NavLink } from 'react-router-dom'
import { BOTTOM_NAV_ITEMS } from './nav-items'
import { useSound } from '@/shared/hooks/use-sound'
import { cn } from '@/shared/lib/utils'

export function BottomNav() {
  const { playNav } = useSound()

  return (
    <nav id="bottom-nav" aria-label="Navegacao">
      {BOTTOM_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => playNav()}
          className={({ isActive }) => cn('bottom-nav-item', isActive && 'active')}
        >
          <Icon strokeWidth={1.5} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
