import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, Plus, Trash2, TrendingUp } from 'lucide-react'
import {
  Modal,
  Button,
  ConfirmDialog,
  Input,
  Textarea,
  Select,
  Badge,
} from '@/shared/components/ui'
import { shiftDay, todayKey, type DayKey } from '@/shared/lib/date'
import { fmtNumber } from '@/shared/lib/utils'
import { useSound } from '@/shared/hooks/use-sound'
import {
  e1rm,
  exercisesQuery,
  groupSets,
  personalRecordsQuery,
  setsOf,
  useCreateWorkout,
  useResolveExercises,
  workoutsQuery,
  type SetInput,
} from '../api/gym-api'
import { ExerciseCombobox, type ExerciseOption } from './ExerciseCombobox'

/** Uma serie individual, no modo detalhado. */
interface DraftSet {
  uid: string
  weight: string
  reps: string
}

/**
 * Um exercicio do treino.
 *
 * O modo padrao e o bloco: "4 series x 10 reps x 60 kg" num campo so. E como o
 * treino e realmente pensado — a versao antiga pedia uma linha por serie, entao
 * quatro series iguais custavam quatro linhas identicas.
 *
 * `detailed` abre as series individuais, para piramide e drop set. O banco nao
 * muda: os dois modos gravam uma linha por serie em workout_sets, que ja era o
 * modelo. Muda so a autoria.
 */
interface DraftEntry {
  uid: string
  exerciseName: string
  setCount: string
  reps: string
  weight: string
  isWarmup: boolean
  detailed: boolean
  sets: DraftSet[]
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
const uid = () => `d${++uidCounter}`

const newEntry = (): DraftEntry => ({
  uid: uid(),
  exerciseName: '',
  setCount: '3',
  reps: '',
  weight: '',
  isWarmup: false,
  detailed: false,
  sets: [],
})

const num = (v: string) => Number(v.replace(',', '.'))

/** As series que o bloco gera, resolvidas nos dois modos. */
function resolveSets(entry: DraftEntry): { weight: number; reps: number }[] {
  if (entry.detailed) {
    return entry.sets
      .filter((s) => s.weight !== '' && s.reps !== '')
      .map((s) => ({ weight: num(s.weight), reps: Number(s.reps) }))
  }
  const count = Math.max(0, Math.floor(Number(entry.setCount) || 0))
  if (!count || entry.weight === '' || entry.reps === '') return []
  return Array.from({ length: count }, () => ({
    weight: num(entry.weight),
    reps: Number(entry.reps),
  }))
}

export function WorkoutFormModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmExit, setConfirmExit] = useState(false)

  const blocked = dirty || saving

  /**
   * Avisa em vez de fechar quando ha rascunho ou save em andamento.
   * Cobre X, ESC e clique no backdrop — os tres passam por aqui.
   */
  const interceptClose = () => {
    if (!blocked) return true
    setConfirmExit(true)
    return false
  }

  const close = () => {
    setDirty(false)
    setSaving(false)
    onOpenChange(false)
  }

  /*
    "Cancelar" tambem passa pelo aviso. Ele fica encostado em "Salvar treino":
    errar o alvo por 40px nao pode custar o treino inteiro — que e justamente
    o acidente que o guard existe para evitar.
  */
  const requestClose = () => {
    if (interceptClose()) close()
  }

  return (
    <>
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        interceptClose={interceptClose}
        busy={saving}
        busyLabel="Salvando treino"
        title="Registrar treino"
        description="Séries, repetições e carga por exercício. O hábito 'Treino' do dia marca sozinho."
        className="md:max-w-2xl"
        footer={null}
      >
        {/* Form montado so enquanto aberto: o estado nasce limpo a cada abertura,
            sem useEffect resetando campos (que causa render em cascata). */}
        {open && (
          <WorkoutForm
            onDone={close}
            onCancel={requestClose}
            onDirtyChange={setDirty}
            onSavingChange={setSaving}
            saving={saving}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={confirmExit}
        onOpenChange={setConfirmExit}
        title={saving ? 'Sair durante o salvamento?' : 'Sair sem salvar?'}
        description={
          saving
            ? 'O treino ainda está sendo gravado. Se sair agora, ele pode não ser salvo por inteiro.'
            : 'O treino que você montou será perdido. Nada foi gravado ainda.'
        }
        confirmLabel="Sair mesmo assim"
        cancelLabel="Continuar aqui"
        onConfirm={close}
      />
    </>
  )
}

interface WorkoutFormProps {
  onDone: () => void
  /** Cancelar passa pelo aviso; onDone fecha direto (usado no sucesso). */
  onCancel: () => void
  onDirtyChange: (dirty: boolean) => void
  onSavingChange: (saving: boolean) => void
  saving: boolean
}

function WorkoutForm({ onDone, onCancel, onDirtyChange, onSavingChange, saving }: WorkoutFormProps) {
  const { data: exercises = [] } = useQuery(exercisesQuery())
  const { data: prs = [] } = useQuery(personalRecordsQuery())
  const create = useCreateWorkout()
  const resolveExercises = useResolveExercises()
  const { playRecord } = useSound()

  // Ultimas sessoes: alimentam o "voce fez X na ultima vez" e a ordem das
  // sugestoes do combobox.
  const to = todayKey()
  const from = useMemo(() => shiftDay(to, -180), [to])
  const { data: recentWorkouts = [] } = useQuery(workoutsQuery(from, to))

  const [date, setDate] = useState<DayKey>(todayKey())
  const [split, setSplit] = useState('')
  const [duration, setDuration] = useState('')
  const [rpe, setRpe] = useState('')
  const [note, setNote] = useState('')
  const [entries, setEntries] = useState<DraftEntry[]>(() => [newEntry()])
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

  /** Ultimo bloco valido de cada exercicio, pra pre-preencher. */
  const lastBlockByExercise = useMemo(() => {
    const map = new Map<string, { weight: number; reps: number; count: number }>()
    const sorted = [...recentWorkouts].sort((a, b) => b.workout_date.localeCompare(a.workout_date))
    for (const workout of sorted) {
      for (const g of groupSets(setsOf(workout))) {
        if (g.is_warmup) continue
        if (!map.has(g.exercise_id)) {
          map.set(g.exercise_id, { weight: g.weight_kg, reps: g.reps, count: g.count })
        }
      }
    }
    return map
  }, [recentWorkouts])

  /** Exercicio usado mais recentemente primeiro; o resto em ordem alfabetica. */
  const options = useMemo<ExerciseOption[]>(() => {
    const lastUsed = new Map<string, string>()
    for (const w of recentWorkouts) {
      for (const s of setsOf(w)) {
        const prev = lastUsed.get(s.exercise_id)
        if (!prev || w.workout_date > prev) lastUsed.set(s.exercise_id, w.workout_date)
      }
    }
    return [...exercises]
      .map((ex) => ({ id: ex.id, name: ex.name, used: lastUsed.get(ex.id) ?? '' }))
      .sort((a, b) =>
        b.used === a.used ? a.name.localeCompare(b.name, 'pt') : b.used.localeCompare(a.used),
      )
      .map(({ id, name }) => ({ id, name }))
  }, [exercises, recentWorkouts])

  const patch = (entryUid: string, next: Partial<DraftEntry>) =>
    setEntries((prev) => prev.map((e) => (e.uid === entryUid ? { ...e, ...next } : e)))

  const markDirty = () => onDirtyChange(true)

  const onExercisePicked = (entryUid: string, name: string) => {
    markDirty()
    const exId = exerciseByName.get(name.trim().toLowerCase())
    const last = exId ? lastBlockByExercise.get(exId) : undefined
    patch(entryUid, {
      exerciseName: name,
      // Pre-preenche com a ultima sessao: o alvo aparece antes de levantar.
      ...(last
        ? { weight: String(last.weight), reps: String(last.reps), setCount: String(last.count) }
        : {}),
    })
  }

  /** Bloco <-> series individuais, sem perder o que ja foi digitado. */
  const toggleDetailed = (entry: DraftEntry) => {
    markDirty()
    if (entry.detailed) {
      const first = entry.sets[0]
      patch(entry.uid, {
        detailed: false,
        setCount: String(Math.max(1, entry.sets.length)),
        weight: first?.weight ?? entry.weight,
        reps: first?.reps ?? entry.reps,
      })
      return
    }
    const count = Math.max(1, Math.floor(Number(entry.setCount) || 1))
    patch(entry.uid, {
      detailed: true,
      sets: Array.from({ length: count }, () => ({
        uid: uid(),
        weight: entry.weight,
        reps: entry.reps,
      })),
    })
  }

  const patchSet = (entryUid: string, setUid: string, next: Partial<DraftSet>) => {
    markDirty()
    setEntries((prev) =>
      prev.map((e) =>
        e.uid === entryUid
          ? { ...e, sets: e.sets.map((s) => (s.uid === setUid ? { ...s, ...next } : s)) }
          : e,
      ),
    )
  }

  /*
    Aviso do navegador enquanto ha rascunho ou save em voo. O interceptClose
    cobre fechar o modal; isto cobre fechar a aba, que o React nao ve.
  */
  const hasDraft =
    saving ||
    entries.some((e) => e.exerciseName.trim() || e.weight || e.reps) ||
    Boolean(note.trim() || duration || rpe)

  useEffect(() => {
    if (!hasDraft) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [hasDraft])

  const submit = async () => {
    const valid = entries
      .map((e) => ({ entry: e, sets: resolveSets(e) }))
      .filter((x) => x.entry.exerciseName.trim() && x.sets.length > 0)

    if (valid.length === 0) {
      setError('Adicione ao menos um exercício com séries, repetições e carga.')
      return
    }

    setError(null)
    onSavingChange(true)
    try {
      // Exercicio novo e criado na hora — digitar o nome basta. Os que faltam
      // vao em paralelo, nao um await por vez.
      const resolved = await resolveExercises(
        valid.map((x) => x.entry.exerciseName),
        exerciseByName,
      )

      const payload: SetInput[] = []
      for (const { entry, sets } of valid) {
        const exerciseId = resolved.get(entry.exerciseName.trim().toLowerCase())
        if (!exerciseId) continue
        for (const s of sets) {
          payload.push({
            exercise_id: exerciseId,
            set_index: payload.length + 1,
            weight_kg: s.weight,
            reps: s.reps,
            is_warmup: entry.isWarmup,
          })
        }
      }

      const beatsRecord = payload.some((s) => {
        if (s.is_warmup) return false
        const best = bestByExercise.get(s.exercise_id) ?? 0
        return e1rm(s.weight_kg, s.reps) > best
      })

      await create.mutateAsync({
        workout_date: date,
        kind: 'gym',
        split: split || null,
        duration_min: duration ? Number(duration) : null,
        rpe: rpe ? Number(rpe) : null,
        note: note.trim() || null,
        sets: payload,
      })

      if (beatsRecord) playRecord()
      onDone()
    } catch {
      // O erro ja virou snackbar no onError da mutation. Aqui so devolvemos o
      // form ao estado editavel, para o overlay nao ficar travado na tela.
      onSavingChange(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Data"
          type="date"
          value={date}
          max={todayKey()}
          onChange={(e) => {
            markDirty()
            setDate(e.target.value)
          }}
        />
        <Select
          label="Split"
          options={SPLITS}
          value={split}
          onChange={(e) => {
            markDirty()
            setSplit(e.target.value)
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Duração"
          floating
          type="number"
          inputMode="numeric"
          min={0}
          suffix="min"
          placeholder="60"
          value={duration}
          onChange={(e) => {
            markDirty()
            setDuration(e.target.value)
          }}
        />
        <Input
          label="RPE geral"
          floating
          type="number"
          inputMode="numeric"
          min={1}
          max={10}
          placeholder="7"
          value={rpe}
          onChange={(e) => {
            markDirty()
            setRpe(e.target.value)
          }}
          hint="1 a 10"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">
            Exercícios
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              markDirty()
              setEntries((p) => [...p, newEntry()])
            }}
          >
            <Plus />
            Exercício
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {entries.map((entry, i) => {
            const exId = exerciseByName.get(entry.exerciseName.trim().toLowerCase())
            const best = exId ? bestByExercise.get(exId) : undefined
            const sets = resolveSets(entry)
            const topSet = sets.reduce(
              (acc, s) => (e1rm(s.weight, s.reps) > e1rm(acc.weight, acc.reps) ? s : acc),
              sets[0] ?? { weight: 0, reps: 0 },
            )
            const current = sets.length > 0 ? e1rm(topSet.weight, topSet.reps) : null
            const isPr = Boolean(current && best !== undefined && current > best && !entry.isWarmup)

            return (
              <div key={entry.uid} className="border border-border-default bg-bg-base/60 p-3">
                <div className="mb-2 flex items-start gap-2">
                  <span className="mt-3 w-5 shrink-0 text-[10px] text-text-muted">#{i + 1}</span>
                  <ExerciseCombobox
                    className="min-w-0 flex-1"
                    value={entry.exerciseName}
                    onChange={(name) => onExercisePicked(entry.uid, name)}
                    options={options}
                  />
                  {entries.length > 1 && (
                    <button
                      onClick={() => {
                        markDirty()
                        setEntries((p) => p.filter((x) => x.uid !== entry.uid))
                      }}
                      aria-label={`Remover exercício ${i + 1}`}
                      className="mt-2 shrink-0 cursor-pointer p-2 text-text-muted transition-colors hover:text-fail"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>

                {entry.detailed ? (
                  <div className="flex flex-col gap-2 pl-7">
                    {entry.sets.map((s, si) => (
                      <div key={s.uid} className="flex items-center gap-2">
                        <span className="w-6 shrink-0 text-[10px] text-text-muted">#{si + 1}</span>
                        <Input
                          wrapperClassName="flex-1"
                          label="Carga"
                          floating
                          suffix="kg"
                          type="number"
                          inputMode="decimal"
                          step="0.5"
                          min={0}
                          placeholder="0"
                          value={s.weight}
                          onChange={(e) => patchSet(entry.uid, s.uid, { weight: e.target.value })}
                          className="text-sm"
                        />
                        <span className="text-text-muted">x</span>
                        <Input
                          wrapperClassName="flex-1"
                          label="Reps"
                          floating
                          type="number"
                          inputMode="numeric"
                          min={1}
                          placeholder="0"
                          value={s.reps}
                          onChange={(e) => patchSet(entry.uid, s.uid, { reps: e.target.value })}
                          className="text-sm"
                        />
                        {entry.sets.length > 1 && (
                          <button
                            onClick={() => {
                              markDirty()
                              patch(entry.uid, {
                                sets: entry.sets.filter((x) => x.uid !== s.uid),
                              })
                            }}
                            aria-label={`Remover série ${si + 1}`}
                            className="shrink-0 cursor-pointer p-1.5 text-text-muted transition-colors hover:text-fail"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="self-start"
                      onClick={() => {
                        markDirty()
                        const last = entry.sets[entry.sets.length - 1]
                        patch(entry.uid, {
                          sets: [
                            ...entry.sets,
                            { uid: uid(), weight: last?.weight ?? '', reps: last?.reps ?? '' },
                          ],
                        })
                      }}
                    >
                      <Plus />
                      Série
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 pl-7">
                    <Input
                      label="Séries"
                      floating
                      type="number"
                      inputMode="numeric"
                      min={1}
                      placeholder="4"
                      value={entry.setCount}
                      onChange={(e) => {
                        markDirty()
                        patch(entry.uid, { setCount: e.target.value })
                      }}
                      className="text-sm"
                    />
                    <Input
                      label="Reps"
                      floating
                      type="number"
                      inputMode="numeric"
                      min={1}
                      placeholder="10"
                      value={entry.reps}
                      onChange={(e) => {
                        markDirty()
                        patch(entry.uid, { reps: e.target.value })
                      }}
                      className="text-sm"
                    />
                    <Input
                      label="Carga"
                      floating
                      suffix="kg"
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      min={0}
                      placeholder="60"
                      value={entry.weight}
                      onChange={(e) => {
                        markDirty()
                        patch(entry.uid, { weight: e.target.value })
                      }}
                      className="text-sm"
                    />
                  </div>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 pl-7">
                  <button
                    onClick={() => toggleDetailed(entry)}
                    className="flex cursor-pointer items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-text-muted transition-colors hover:text-white"
                  >
                    {entry.detailed ? (
                      <ChevronDown className="size-3" />
                    ) : (
                      <ChevronRight className="size-3" />
                    )}
                    {entry.detailed ? 'Bloco único' : 'Detalhar'}
                  </button>

                  <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[10px] text-text-muted">
                    <input
                      type="checkbox"
                      checked={entry.isWarmup}
                      onChange={(e) => {
                        markDirty()
                        patch(entry.uid, { isWarmup: e.target.checked })
                      }}
                      className="size-3.5 accent-white"
                    />
                    Aquecimento
                  </label>

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
                  {sets.length > 0 && (
                    <span className="text-[10px] text-text-muted">
                      {sets.length} {sets.length === 1 ? 'série' : 'séries'}
                    </span>
                  )}
                </div>
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
        onChange={(e) => {
          markDirty()
          setNote(e.target.value)
        }}
      />

      <div className="mt-2 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="solid" size="sm" onClick={submit} disabled={saving || create.isPending}>
          {saving ? 'Salvando' : 'Salvar treino'}
        </Button>
      </div>
    </div>
  )
}
