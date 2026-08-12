import { BookOpen, Brain, Dumbbell, Footprints, ShieldOff } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const HABIT_KEYS = ['no_pmo', 'meditation', 'reading', 'running', 'training'] as const
export type HabitKey = (typeof HABIT_KEYS)[number]

export interface HabitMeta {
  key: HabitKey
  label: string
  /** Rotulo curto pro heatmap e pros stat cards */
  short: string
  icon: LucideIcon
  /** Sufixo do campo numerico. null = habito so booleano. */
  unit: string | null
  unitLabel: string | null
  /**
   * Habito de abstinencia: `done: false` significa recaida registrada,
   * nao "esqueci de marcar". Muda o texto, a cor e o fluxo de confirmacao.
   */
  abstinence: boolean
  /**
   * Quando o registro detalhado vive em outra tela, o check-in so mostra o
   * toggle e manda pra ca. O trigger no banco marca o habito sozinho.
   */
  detailRoute: string | null
  /** Texto do estado positivo, na voz do app. */
  doneLabel: string
  missLabel: string
}

export const HABITS: Record<HabitKey, HabitMeta> = {
  no_pmo: {
    key: 'no_pmo',
    label: 'Contencao',
    short: 'CONT',
    icon: ShieldOff,
    unit: null,
    unitLabel: null,
    abstinence: true,
    detailRoute: null,
    doneLabel: 'Dia limpo',
    missLabel: 'Recaida',
  },
  meditation: {
    key: 'meditation',
    label: 'Meditacao',
    short: 'MED',
    icon: Brain,
    unit: 'min',
    unitLabel: 'minutos',
    abstinence: false,
    detailRoute: null,
    doneLabel: 'Meditou',
    missLabel: 'Sem registro',
  },
  reading: {
    key: 'reading',
    label: 'Leitura',
    short: 'LEIT',
    icon: BookOpen,
    unit: 'pag',
    unitLabel: 'paginas',
    abstinence: false,
    detailRoute: null,
    doneLabel: 'Leu',
    missLabel: 'Sem registro',
  },
  running: {
    key: 'running',
    label: 'Corrida',
    short: 'CORR',
    icon: Footprints,
    unit: 'km',
    unitLabel: 'quilometros',
    abstinence: false,
    detailRoute: '/running',
    doneLabel: 'Correu',
    missLabel: 'Sem registro',
  },
  training: {
    key: 'training',
    label: 'Treino',
    short: 'TREI',
    icon: Dumbbell,
    unit: 'min',
    unitLabel: 'minutos',
    abstinence: false,
    detailRoute: '/gym',
    doneLabel: 'Treinou',
    missLabel: 'Sem registro',
  },
}

export const HABIT_LIST: HabitMeta[] = HABIT_KEYS.map((k) => HABITS[k])

/**
 * Piso semanal de corrida (decisao 2 do PLAN.md). Nao e meta e nao gera
 * comemoracao — so marca a linha de corte na barra da semana.
 */
export const WEEKLY_KM_FLOOR = 5
