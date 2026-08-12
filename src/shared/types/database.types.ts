/**
 * Espelho tipado de supabase/migrations/0001_init.sql.
 * Ao mexer no SQL, mexer aqui tambem - nao existe geracao automatica no projeto.
 *
 * Row/Database sao `type`, nunca `interface`: interface nao ganha index
 * signature implicita, entao `Database['public']` falharia o constraint
 * GenericSchema do supabase-js, Schema viraria `never` e todo .insert()
 * do app passaria a aceitar so `never[]`.
 *
 * Insert/Update sao escritos por extenso (e nao derivados de Row com helpers
 * genericos) porque o postgrest-js resolve `Relation['Insert']` por inferencia
 * estrutural: tipo derivado via intersecao faz o lookup cair para `never` e
 * todo .insert()/.update() do app deixa de tipar.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type HabitKeyDb = 'no_pmo' | 'meditation' | 'reading' | 'running' | 'training'

export type ProfileRow = {
  id: string
  display_name: string | null
  avatar_url: string | null
  start_date: string
  settings: Json
  created_at: string
  updated_at: string
}

export type HabitLogRow = {
  id: string
  user_id: string
  habit_key: HabitKeyDb
  log_date: string
  done: boolean
  value: number | null
  note: string | null
  relapse_trigger: string | null
  created_at: string
  updated_at: string
}

export type RunRow = {
  id: string
  user_id: string
  run_date: string
  distance_km: number
  duration_min: number | null
  route: string | null
  feeling: number | null
  note: string | null
  created_at: string
  updated_at: string
}

export type ExerciseRow = {
  id: string
  user_id: string
  name: string
  muscle_group: string | null
  created_at: string
}

export type WorkoutRow = {
  id: string
  user_id: string
  workout_date: string
  split: string | null
  duration_min: number | null
  rpe: number | null
  note: string | null
  created_at: string
  updated_at: string
}

export type WorkoutSetRow = {
  id: string
  user_id: string
  workout_id: string
  exercise_id: string
  set_index: number
  weight_kg: number
  reps: number
  rpe: number | null
  is_warmup: boolean
  /** Coluna gerada no banco (Epley). Somente leitura - nunca vai em Insert. */
  e1rm: number
  created_at: string
}

export type PersonalRecordRow = {
  id: string
  user_id: string
  exercise_id: string
  workout_set_id: string | null
  achieved_on: string
  weight_kg: number
  reps: number
  e1rm: number
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          start_date?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          start_date?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      habit_logs: {
        Row: HabitLogRow
        Insert: {
          id?: string
          user_id?: string
          habit_key: HabitKeyDb
          log_date: string
          done?: boolean
          value?: number | null
          note?: string | null
          relapse_trigger?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          habit_key?: HabitKeyDb
          log_date?: string
          done?: boolean
          value?: number | null
          note?: string | null
          relapse_trigger?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      runs: {
        Row: RunRow
        Insert: {
          id?: string
          user_id?: string
          run_date: string
          distance_km: number
          duration_min?: number | null
          route?: string | null
          feeling?: number | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          run_date?: string
          distance_km?: number
          duration_min?: number | null
          route?: string | null
          feeling?: number | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      exercises: {
        Row: ExerciseRow
        Insert: {
          id?: string
          user_id?: string
          name: string
          muscle_group?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          muscle_group?: string | null
          created_at?: string
        }
        Relationships: []
      }
      workouts: {
        Row: WorkoutRow
        Insert: {
          id?: string
          user_id?: string
          workout_date: string
          split?: string | null
          duration_min?: number | null
          rpe?: number | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_date?: string
          split?: string | null
          duration_min?: number | null
          rpe?: number | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      workout_sets: {
        Row: WorkoutSetRow
        Insert: {
          id?: string
          user_id?: string
          workout_id: string
          exercise_id: string
          set_index: number
          weight_kg: number
          reps: number
          rpe?: number | null
          is_warmup?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_id?: string
          exercise_id?: string
          set_index?: number
          weight_kg?: number
          reps?: number
          rpe?: number | null
          is_warmup?: boolean
          created_at?: string
        }
        Relationships: []
      }
      personal_records: {
        Row: PersonalRecordRow
        Insert: {
          id?: string
          user_id?: string
          exercise_id: string
          workout_set_id?: string | null
          achieved_on: string
          weight_kg: number
          reps: number
          e1rm: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_id?: string
          workout_set_id?: string | null
          achieved_on?: string
          weight_kg?: number
          reps?: number
          e1rm?: number
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
