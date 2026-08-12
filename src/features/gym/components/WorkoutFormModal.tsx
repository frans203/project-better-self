import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Trash2, TrendingUp } from 'lucide-react'
import { Modal, Button, Input, Textarea, Select, Badge } from '@/shared/components/ui'
import { shiftDay, todayKey, type DayKey } from '@/shared/lib/date'
import { fmtNumber } from '@/shared/lib/utils'
import { useSound } from '@/shared/hooks/use-sound'
import {
  e1rm,
  exercisesQuery,
  personalRecordsQuery,
  useCreateExercise,
  useCreateWorkout,
  workoutsQuery,
  type SetInput,
} from '../api/gym-api'

interface DraftSet {
  uid: string
  exerciseName: string
  weight: string
  reps: string
  isWarmup: boolean
}

const SPLITS = [
  { value: '', label: 'Sem split' },
  { value: 'Push', label: 'Push' },
  { value: 'Pull', label: 'Pull' },
  { value: 'Legs', label: 'Legs' },
  { value: 'Upper', label: 'Upper' },
  { value: 'Lower', label: 'Lower' },
  { value: 'Full body', label: 'Full body' },
  { value: 'Outro', label: 'Outro' },
]

let uidCounter = 0
const newSet = (exerciseName = ''): DraftSet => ({
  uid: `s${++uidCounter}`,
  exerciseName,
  weight: '',
  reps: '',
  isWarmup: false,
})

export function WorkoutFormModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Registrar treino"
      description="Exercicio novo e criado ao digitar o nome. O habito 'Treino' do dia marca sozinho."
      className="md:max-w-2xl"
      footer={null}
    >
      {/* Form montado so enquanto aberto: o estado nasce limpo a cada abertura,
          sem useEffect resetando campos (que causa render em cascata). */}
      {open && <WorkoutForm onDone={() => onOpenChange(false)} />}
    </Modal>
  )
}

function WorkoutForm({ onDone }: { onDone: () => void }) {
  const { data: exercises = [] } = useQuery(exercisesQuery())
  const { data: prs = [] } = useQuery(personalRecordsQuery())
  const create = useCreateWorkout()
  const createExercise = useCreateExercise()
  const { playRecord } = useSound()

  // Ultimas sessoes: alimentam o "voce fez X na ultima vez" de cada exercicio.
  const to = todayKey()
  const from = useMemo(() => shiftDay(to, -180), [to])
  const { data: recentWorkouts = [] } = useQuery(workoutsQuery(from, to))

  const [date, setDate] = useState<DayKey>(todayKey())
  const [split, setSplit] = useState('')
  const [duration, setDuration] = useState('')
  const [rpe, setRpe] = useState('')
  const [note, setNote] = useState('')
  const [sets, setSets] = useState<DraftSet[]>(() => [newSet()])
  const [error, setError] = useState<string | null>(null)

  const exerciseByName = useMemo(() => {
    const map = new Map<string, string>()
    for (const ex of exercises) map.set(ex.name.trim().toLowerCase(), ex.id)
    return map
  }, [exercises])

  /** Melhor e1RM ja registrado por exercicio — o numero a bater. */
  const bestByExercise = useMemo(() => {
    const map = new Map<string, number>()
    for (const pr of prs) {
      const current = map.get(pr.exercise_id) ?? 0
      if (pr.e1rm > current) map.set(pr.exercise_id, pr.e1rm)
    }
    return map
  }, [prs])

  /** Ultima serie valida de cada exercicio, pra pre-preencher. */
  const lastSetByExercise = useMemo(() => {
    const map = new Map<string, { weight: number; reps: number }>()
    const sorted = [...recentWorkouts].sort((a, b) => b.workout_date.localeCompare(a.workout_date))
    for (const workout of sorted) {
      for (const s of workout.workout_sets ?? []) {
        if (s.is_warmup) continue
        if (!map.has(s.exercise_id)) map.set(s.exercise_id, { weight: s.weight_kg, reps: s.reps })
      }
    }
    return map
  }, [recentWorkouts])

  const updateSet = (uid: string, patch: Partial<DraftSet>) =>
    setSets((prev) => prev.map((s) => (s.uid === uid ? { ...s, ...patch } : s)))

  const onExercisePicked = (uid: string, name: string) => {
    const exId = exerciseByName.get(name.trim().toLowerCase())
    const last = exId ? lastSetByExercise.get(exId) : undefined
    updateSet(uid, {
      exerciseName: name,
      // Pre-preenche com a ultima sessao: o alvo aparece antes de levantar.
      ...(last ? { weight: String(last.weight), reps: String(last.reps) } : {}),
    })
  }

  const submit = async () => {
    const valid = sets.filter((s) => s.exerciseName.trim() && s.weight !== '' && s.reps !== '')
    if (valid.length === 0) {
      setError('Adicione ao menos uma serie com exercicio, carga e repeticoes.')
      return
    }

    // Exercicio novo e criado na hora — digitar o nome basta.
    const resolved = new Map(exerciseByName)
    for (const s of valid) {
      const key = s.exerciseName.trim().toLowerCase()
      if (!resolved.has(key)) {
        const created = await createExercise.mutateAsync({ name: s.exerciseName.trim() })
        resolved.set(key, created.id)
      }
    }

    const payload: SetInput[] = valid.map((s, i) => ({
      exercise_id: resolved.get(s.exerciseName.trim().toLowerCase())!,
      set_index: i + 1,
      weight_kg: Number(s.weight.replace(',', '.')),
      reps: Number(s.reps),
      is_warmup: s.isWarmup,
    }))

    const beatsRecord = payload.some((s) => {
      if (s.is_warmup) return false
      const best = bestByExercise.get(s.exercise_id) ?? 0
      return e1rm(s.weight_kg, s.reps) > best
    })

    await create.mutateAsync({
      workout_date: date,
      split: split || null,
      duration_min: duration ? Number(duration) : null,
      rpe: rpe ? Number(rpe) : null,
      note: note.trim() || null,
      sets: payload,
    })

    if (beatsRecord) playRecord()
    onDone()
  }

  return (
    <>
      <datalist id="exercise-options">
        {exercises.map((ex) => (
          <option key={ex.id} value={ex.name} />
        ))}
      </datalist>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Data"
            type="date"
            value={date}
            max={todayKey()}
            onChange={(e) => setDate(e.target.value)}
          />
          <Select
            label="Split"
            options={SPLITS}
            value={split}
            onChange={(e) => setSplit(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Duracao"
            type="number"
            inputMode="numeric"
            min={0}
            suffix="min"
            placeholder="60"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          <Input
            label="RPE geral"
            type="number"
            inputMode="numeric"
            min={1}
            max={10}
            placeholder="7"
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            hint="1 a 10"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">
              Series
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSets((p) => [...p, newSet(p[p.length - 1]?.exerciseName ?? '')])}
            >
              <Plus />
              Serie
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {sets.map((s, i) => {
              const exId = exerciseByName.get(s.exerciseName.trim().toLowerCase())
              const best = exId ? bestByExercise.get(exId) : undefined
              const current =
                s.weight && s.reps ? e1rm(Number(s.weight.replace(',', '.')), Number(s.reps)) : null
              const isPr = Boolean(current && best !== undefined && current > best && !s.isWarmup)

              return (
                <div key={s.uid} className="border border-border-default bg-bg-base/60 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="w-6 shrink-0 text-[10px] text-text-muted">#{i + 1}</span>
                    <input
                      list="exercise-options"
                      value={s.exerciseName}
                      onChange={(e) => onExercisePicked(s.uid, e.target.value)}
                      placeholder="Supino reto"
                      aria-label={`Exercicio da serie ${i + 1}`}
                      className="field-input py-2 text-sm"
                    />
                    {sets.length > 1 && (
                      <button
                        onClick={() => setSets((p) => p.filter((x) => x.uid !== s.uid))}
                        aria-label={`Remover serie ${i + 1}`}
                        className="shrink-0 cursor-pointer p-2 text-text-muted transition-colors hover:text-fail"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pl-8">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        min={0}
                        value={s.weight}
                        onChange={(e) => updateSet(s.uid, { weight: e.target.value })}
                        placeholder="0"
                        aria-label={`Carga da serie ${i + 1}`}
                        className="field-input py-2 pr-9 text-right text-sm"
                      />
                      <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[10px] text-text-muted">
                        kg
                      </span>
                    </div>
                    <span className="text-text-muted">x</span>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        value={s.reps}
                        onChange={(e) => updateSet(s.uid, { reps: e.target.value })}
                        placeholder="0"
                        aria-label={`Repeticoes da serie ${i + 1}`}
                        className="field-input py-2 pr-11 text-right text-sm"
                      />
                      <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[10px] text-text-muted">
                        reps
                      </span>
                    </div>

                    <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[10px] text-text-muted">
                      <input
                        type="checkbox"
                        checked={s.isWarmup}
                        onChange={(e) => updateSet(s.uid, { isWarmup: e.target.checked })}
                        className="size-3.5 accent-white"
                      />
                      Aq.
                    </label>
                  </div>

                  {(best !== undefined || isPr) && (
                    <div className="mt-2 flex items-center gap-2 pl-8">
                      {best !== undefined && (
                        <span className="text-[10px] text-text-muted">
                          Melhor: {fmtNumber(best, 1)} kg e1RM
                        </span>
                      )}
                      {isPr && (
                        <Badge tone="ok">
                          <TrendingUp className="size-3" />
                          Novo recorde
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {error && (
            <p role="alert" className="mt-2 text-[10px] text-fail">
              {error}
            </p>
          )}
        </div>

        <Textarea
          label="Nota"
          placeholder="Como foi o treino."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onDone}>
            Cancelar
          </Button>
          <Button variant="solid" size="sm" onClick={submit} disabled={create.isPending}>
            {create.isPending ? 'Salvando' : 'Salvar treino'}
          </Button>
        </div>
      </div>
    </>
  )
}
