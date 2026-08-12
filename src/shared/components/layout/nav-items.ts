import { BarChart3, Dumbbell, Footprints, LayoutGrid, SquareCheck, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  /** Bottom nav cabe 5. O que sobra fica so no rail e no header mobile. */
  inBottomNav: boolean
}

/** Rotas em ingles, rotulos em pt-BR. Ver PLAN.md secao 5. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Base', icon: LayoutGrid, end: true, inBottomNav: true },
  { to: '/check-in', label: 'Check-in', icon: SquareCheck, inBottomNav: true },
  { to: '/gym', label: 'Academia', icon: Dumbbell, inBottomNav: true },
  { to: '/running', label: 'Corrida', icon: Footprints, inBottomNav: true },
  { to: '/reports', label: 'Relatorio', icon: BarChart3, inBottomNav: true },
  { to: '/profile', label: 'Perfil', icon: User, inBottomNav: false },
]

export const BOTTOM_NAV_ITEMS = NAV_ITEMS.filter((i) => i.inBottomNav)
