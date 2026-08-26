import type { WodMovement, WodScoring } from '@/shared/types/database.types'

/**
 * Catalogo de benchmarks.
 *
 * Vive em codigo, e nao como seed no SQL, porque `wods.user_id` vem de
 * auth.uid(): um insert global no migration nao teria dono. A linha no banco
 * nasce na primeira vez que voce registra o WOD — igual ao que ja acontece
 * com `exercises`.
 */
export interface WodPreset {
  name: string
  scoring: WodScoring
  timeCapMin: number | null
  /** Soma das reps de um round completo. null quando o WOD nao e por rounds. */
  repsPerRound: number | null
  movements: WodMovement[]
  description: string
}

export const WOD_PRESETS: readonly WodPreset[] = [
  {
    name: 'Cindy',
    scoring: 'amrap',
    timeCapMin: 20,
    repsPerRound: 30,
    movements: [
      { name: 'Barra fixa', reps: 5 },
      { name: 'Flexão de braço', reps: 10 },
      { name: 'Agachamento livre', reps: 15 },
    ],
    description: 'AMRAP em 20 min: 5 barras, 10 flexões, 15 agachamentos.',
  },
  {
    name: 'Chelsea',
    scoring: 'emom',
    timeCapMin: 30,
    repsPerRound: 30,
    movements: [
      { name: 'Barra fixa', reps: 5 },
      { name: 'Flexão de braço', reps: 10 },
      { name: 'Agachamento livre', reps: 15 },
    ],
    description: 'A cada minuto, por 30 min: 5 barras, 10 flexões, 15 agachamentos.',
  },
  {
    name: 'Barbara',
    scoring: 'rounds',
    timeCapMin: null,
    repsPerRound: 140,
    movements: [
      { name: 'Barra fixa', reps: 20 },
      { name: 'Flexão de braço', reps: 30 },
      { name: 'Abdominal', reps: 40 },
      { name: 'Agachamento livre', reps: 50 },
    ],
    description: '5 rounds, 3 min de descanso entre eles: 20-30-40-50.',
  },
  {
    name: 'Angie',
    scoring: 'for_time',
    timeCapMin: null,
    repsPerRound: null,
    movements: [
      { name: 'Barra fixa', reps: 100 },
      { name: 'Flexão de braço', reps: 100 },
      { name: 'Abdominal', reps: 100 },
      { name: 'Agachamento livre', reps: 100 },
    ],
    description: 'For time: 100 de cada, um movimento por vez.',
  },
  {
    name: 'Helen',
    scoring: 'for_time',
    timeCapMin: null,
    repsPerRound: null,
    movements: [
      { name: 'Corrida 400 m', reps: 1 },
      { name: 'Kettlebell swing', reps: 21 },
      { name: 'Barra fixa', reps: 12 },
    ],
    description: '3 rounds for time: 400 m, 21 swings, 12 barras.',
  },
  {
    name: 'Fran',
    scoring: 'for_time',
    timeCapMin: null,
    repsPerRound: null,
    movements: [
      { name: 'Thruster', reps: 45 },
      { name: 'Barra fixa', reps: 45 },
    ],
    description: 'For time, 21-15-9: thruster e barra fixa.',
  },
  {
    name: 'Murph',
    scoring: 'for_time',
    timeCapMin: null,
    repsPerRound: null,
    movements: [
      { name: 'Corrida 1,6 km', reps: 1 },
      { name: 'Barra fixa', reps: 100 },
      { name: 'Flexão de braço', reps: 200 },
      { name: 'Agachamento livre', reps: 300 },
      { name: 'Corrida 1,6 km', reps: 1 },
    ],
    description: 'For time: corrida, 100-200-300, corrida.',
  },
] as const

export const SCORING_LABEL: Record<WodScoring, string> = {
  amrap: 'AMRAP — máximo de rounds no tempo',
  for_time: 'For time — menor tempo',
  emom: 'EMOM — a cada minuto',
  rounds: 'Rounds fixos',
  other: 'Outro',
}

/** Rótulo curto, para badge e lista. */
export const SCORING_SHORT: Record<WodScoring, string> = {
  amrap: 'AMRAP',
  for_time: 'FOR TIME',
  emom: 'EMOM',
  rounds: 'ROUNDS',
  other: 'WOD',
}

/** AMRAP e EMOM pontuam por rounds; o resto pontua por tempo. */
export function scoresByRounds(scoring: WodScoring): boolean {
  return scoring === 'amrap' || scoring === 'emom' || scoring === 'rounds'
}

export function repsPerRoundOf(movements: WodMovement[]): number {
  return movements.reduce((acc, m) => acc + (m.reps || 0), 0)
}
