import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import {
  Modal,
  Button,
  ConfirmDialog,
  Input,
  Textarea,
  Select,
  Badge,
} from '@/shared/components/ui'
import { todayKey, type DayKey } from '@/shared/lib/date'
import { fmtInt, cn } from '@/shared/lib/utils'
import {
  SCORING_LABEL,
  SCORING_SHORT,
  WOD_PRESETS,
  repsPerRoundOf,
  scoresByRounds,
  type WodPreset,
} from '@/shared/constants/wods'
import type { WodMovement, WodRow, WodScoring } from '@/shared/types/database.types'
import { useCreateWodWorkout, useResolveWod, wodsQuery } from '../api/wod-api'

const SCORING_OPTIONS = (Object.keys(SCORING_LABEL) as WodScoring[]).map((v) => ({
  value: v,
  label: SCORING_LABEL[v],
}))

let uidCounter = 0
const uid = () => `m${++uidCounter}`

interface DraftMovement {
  uid: string
  name: string
  reps: string
}

/**
 * A definicao escolhida, venha ela do catalogo, do banco ou do formulario de
 * WOD novo. Uniformizar aqui evita tres caminhos diferentes ate o insert.
 */
interface Chosen {
  name: string
  scoring: WodScoring
  timeCapMin: number | null
  repsPerRound: number | null
  movements: WodMovement[]
  description: string | null
  isBenchmark: boolean
}

const fromPreset = (p: WodPreset): Chosen => ({
  name: p.name,
  scoring: p.scoring,
  timeCapMin: p.timeCapMin,
  repsPerRound: p.repsPerRound,
  movements: p.movements,
  description: p.description,
  isBenchmark: true,
})

const fromRow = (w: WodRow): Chosen => ({
  name: w.name,
  scoring: w.scoring,
  timeCapMin: w.time_cap_min,
  repsPerRound: w.reps_per_round,
  movements: w.movements ?? [],
  description: w.description,
  isBenchmark: w.is_benchmark,
})

export function WodFormModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmExit, setConfirmExit] = useState(false)

  const interceptClose = () => {
    if (!dirty && !saving) return true
    setConfirmExit(true)
    return false
  }

  const close = () => {
    setDirty(false)
    setSaving(false)
    onOpenChange(false)
  }

  /* "Cancelar" tambem passa pelo aviso — ele fica encostado em "Salvar WOD". */
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
        busyLabel="Salvando WOD"
        title="Registrar WOD"
        description="CrossFit. O hábito 'Treino' do dia marca sozinho, igual à musculação."
        className="md:max-w-2xl"
        footer={null}
      >
        {open && (
          <WodForm
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
            ? 'O WOD ainda está sendo gravado. Se sair agora, ele pode não ser salvo por inteiro.'
            : 'O resultado que você digitou será perdido. Nada foi gravado ainda.'
        }
        confirmLabel="Sair mesmo assim"
        cancelLabel="Continuar aqui"
        onConfirm={close}
      />
    </>
  )
}

interface WodFormProps {
  onDone: () => void
  /** Cancelar passa pelo aviso; onDone fecha direto (usado no sucesso). */
  onCancel: () => void
  onDirtyChange: (dirty: boolean) => void
  onSavingChange: (saving: boolean) => void
  saving: boolean
}

function WodForm({ onDone, onCancel, onDirtyChange, onSavingChange, saving }: WodFormProps) {
  const { data: savedWods = [] } = useQuery(wodsQuery())
  const resolveWod = useResolveWod()
  const create = useCreateWodWorkout()

  const [date, setDate] = useState<DayKey>(todayKey())
  // Cindy sai selecionada: e o benchmark mais comum e evita abrir num estado vazio.
  const [pickedName, setPickedName] = useState<string>(WOD_PRESETS[0].name)
  const [custom, setCustom] = useState(false)

  // Definicao de WOD novo
  const [customName, setCustomName] = useState('')
  const [customScoring, setCustomScoring] = useState<WodScoring>('amrap')
  const [customCap, setCustomCap] = useState('')
  const [movements, setMovements] = useState<DraftMovement[]>(() => [
    { uid: uid(), name: '', reps: '' },
  ])

  // Resultado
  const [rounds, setRounds] = useState('')
  const [extraReps, setExtraReps] = useState('')
  const [timeMin, setTimeMin] = useState('')
  const [timeSec, setTimeSec] = useState('')
  const [scaled, setScaled] = useState(false)
  const [rpe, setRpe] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const markDirty = () => onDirtyChange(true)

  /**
   * Catalogo + o que ja esta no banco, sem duplicar.
   * Benchmark ja registrado aparece uma vez so, na versao do banco.
   */
  const catalog = useMemo<Chosen[]>(() => {
    const out = savedWods.map(fromRow)
    const seen = new Set(out.map((w) => w.name.trim().toLowerCase()))
    for (const p of WOD_PRESETS) {
      if (!seen.has(p.name.trim().toLowerCase())) out.push(fromPreset(p))
    }
    return out
  }, [savedWods])

  const customMovements = useMemo<WodMovement[]>(
    () =>
      movements
        .filter((m) => m.name.trim() && Number(m.reps) > 0)
        .map((m) => ({ name: m.name.trim(), reps: Number(m.reps) })),
    [movements],
  )

  const chosen = useMemo<Chosen | null>(() => {
    if (custom) {
      if (!customName.trim()) return null
      const perRound = repsPerRoundOf(customMovements)
      return {
        name: customName.trim(),
        scoring: customScoring,
        timeCapMin: customCap ? Number(customCap) : null,
        repsPerRound: scoresByRounds(customScoring) && perRound > 0 ? perRound : null,
        movements: customMovements,
        description: null,
        isBenchmark: false,
      }
    }
    return catalog.find((w) => w.name === pickedName) ?? null
  }, [custom, customName, customScoring, customCap, customMovements, catalog, pickedName])

  const byRounds = chosen ? scoresByRounds(chosen.scoring) : true

  /** Placar em reps — o mesmo numero que a coluna gerada vai calcular. */
  const totalReps =
    chosen && byRounds && chosen.repsPerRound
      ? (Number(rounds) || 0) * chosen.repsPerRound + (Number(extraReps) || 0)
      : null

  const durationSec = byRounds
    ? null
    : (Number(timeMin) || 0) * 60 + (Number(timeSec) || 0) || null

  const hasDraft =
    saving || Boolean(rounds || extraReps || timeMin || timeSec || note.trim() || rpe || customName)

  useEffect(() => {
    if (!hasDraft) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [hasDraft])

  const submit = async () => {
    if (!chosen) {
      setError('Escolha um WOD ou dê um nome ao novo.')
      return
    }
    if (custom && customMovements.length === 0) {
      setError('Adicione ao menos um movimento com repetições.')
      return
    }
    if (byRounds && !rounds && !extraReps) {
      setError('Informe quantos rounds você completou.')
      return
    }
    if (!byRounds && !durationSec) {
      setError('Informe o tempo total.')
      return
    }

    setError(null)
    onSavingChange(true)
    try {
      const wod = await resolveWod(
        {
          name: chosen.name,
          scoring: chosen.scoring,
          time_cap_min: chosen.timeCapMin,
          reps_per_round: chosen.repsPerRound,
          movements: chosen.movements,
          description: chosen.description,
          is_benchmark: chosen.isBenchmark,
        },
        savedWods,
      )

      await create.mutateAsync({
        workout_date: date,
        wod_id: wod.id,
        wod_name: wod.name,
        // AMRAP/EMOM duram o time cap; for time dura o que o cronometro marcou.
        duration_min: byRounds
          ? (chosen.timeCapMin ?? null)
          : durationSec
            ? Math.max(1, Math.round(durationSec / 60))
            : null,
        rpe: rpe ? Number(rpe) : null,
        rounds: byRounds ? Number(rounds) || 0 : null,
        extra_reps: byRounds ? Number(extraReps) || 0 : null,
        duration_sec: byRounds ? null : durationSec,
        // Copia do WOD: se a definicao mudar depois, o placar historico nao anda.
        reps_per_round: byRounds ? chosen.repsPerRound : null,
        scaled,
        note: note.trim() || null,
      })

      onDone()
    } catch {
      onSavingChange(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
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

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">WOD</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              markDirty()
              setCustom((c) => !c)
            }}
          >
            {custom ? 'Usar da lista' : 'Novo WOD'}
          </Button>
        </div>

        {custom ? (
          <div className="flex flex-col gap-3 border border-border-default bg-bg-base/60 p-3">
            <Input
              label="Nome do WOD"
              floating
              placeholder="Ex.: Terça pesada"
              value={customName}
              onChange={(e) => {
                markDirty()
                setCustomName(e.target.value)
              }}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Pontuação"
                options={SCORING_OPTIONS}
                value={customScoring}
                onChange={(e) => {
                  markDirty()
                  setCustomScoring(e.target.value as WodScoring)
                }}
              />
              <Input
                label="Tempo"
                floating
                type="number"
                inputMode="numeric"
                min={1}
                suffix="min"
                placeholder="20"
                value={customCap}
                onChange={(e) => {
                  markDirty()
                  setCustomCap(e.target.value)
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">
                Movimentos
              </span>
              {movements.map((m, i) => (
                <div key={m.uid} className="flex items-center gap-2">
                  <Input
                    wrapperClassName="w-20 shrink-0"
                    label="Reps"
                    floating
                    type="number"
                    inputMode="numeric"
                    min={1}
                    placeholder="10"
                    value={m.reps}
                    onChange={(e) => {
                      markDirty()
                      setMovements((p) =>
                        p.map((x) => (x.uid === m.uid ? { ...x, reps: e.target.value } : x)),
                      )
                    }}
                    className="text-sm"
                  />
                  <Input
                    wrapperClassName="min-w-0 flex-1"
                    label="Movimento"
                    floating
                    placeholder="Flexão de braço"
                    value={m.name}
                    onChange={(e) => {
                      markDirty()
                      setMovements((p) =>
                        p.map((x) => (x.uid === m.uid ? { ...x, name: e.target.value } : x)),
                      )
                    }}
                    className="text-sm"
                  />
                  {movements.length > 1 && (
                    <button
                      onClick={() => {
                        markDirty()
                        setMovements((p) => p.filter((x) => x.uid !== m.uid))
                      }}
                      aria-label={`Remover movimento ${i + 1}`}
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
                  setMovements((p) => [...p, { uid: uid(), name: '', reps: '' }])
                }}
              >
                <Plus />
                Movimento
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {catalog.map((w) => (
                <button
                  key={w.name}
                  onClick={() => {
                    markDirty()
                    setPickedName(w.name)
                  }}
                  aria-pressed={w.name === pickedName}
                  className={cn('tab-btn', w.name === pickedName && 'active')}
                >
                  {w.name}
                </button>
              ))}
            </div>

            {chosen && (
              <div className="mt-3 border border-border-default bg-bg-base/60 p-3">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-display text-sm text-white">{chosen.name}</span>
                  <Badge>{SCORING_SHORT[chosen.scoring]}</Badge>
                  {chosen.timeCapMin && <Badge>{chosen.timeCapMin} min</Badge>}
                </div>
                <ul className="flex flex-col gap-1">
                  {chosen.movements.map((m, i) => (
                    <li key={`${m.name}-${i}`} className="flex items-baseline gap-3 text-[12px]">
                      <span className="w-8 shrink-0 text-right font-display text-white">
                        {m.reps}
                      </span>
                      <span className="min-w-0 text-text-secondary">{m.name}</span>
                    </li>
                  ))}
                </ul>
                {chosen.description && (
                  <p className="mt-2 text-[10px] text-text-muted">{chosen.description}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div>
        <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-text-secondary">
          Resultado
        </span>

        {byRounds ? (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Rounds completos"
              floating
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="12"
              value={rounds}
              onChange={(e) => {
                markDirty()
                setRounds(e.target.value)
              }}
            />
            <Input
              label="Reps extras"
              floating
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="7"
              value={extraReps}
              onChange={(e) => {
                markDirty()
                setExtraReps(e.target.value)
              }}
              hint="Do round incompleto"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Minutos"
              floating
              type="number"
              inputMode="numeric"
              min={0}
              suffix="min"
              placeholder="13"
              value={timeMin}
              onChange={(e) => {
                markDirty()
                setTimeMin(e.target.value)
              }}
            />
            <Input
              label="Segundos"
              floating
              type="number"
              inputMode="numeric"
              min={0}
              max={59}
              suffix="s"
              placeholder="42"
              value={timeSec}
              onChange={(e) => {
                markDirty()
                setTimeSec(e.target.value)
              }}
            />
          </div>
        )}

        {totalReps !== null && totalReps > 0 && (
          <p className="mt-2 text-[10px] text-text-muted">
            Placar: <span className="text-text-primary">{fmtInt(totalReps)}</span> repetições no
            total.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="RPE geral"
          floating
          type="number"
          inputMode="numeric"
          min={1}
          max={10}
          placeholder="9"
          value={rpe}
          onChange={(e) => {
            markDirty()
            setRpe(e.target.value)
          }}
          hint="1 a 10"
        />
        <label className="flex cursor-pointer items-center gap-2 self-end pb-3 text-[11px] text-text-muted">
          <input
            type="checkbox"
            checked={scaled}
            onChange={(e) => {
              markDirty()
              setScaled(e.target.checked)
            }}
            className="size-3.5 accent-white"
          />
          Adaptado (scaled)
        </label>
      </div>

      <Textarea
        label="Nota"
        placeholder="Como foi o WOD."
        value={note}
        onChange={(e) => {
          markDirty()
          setNote(e.target.value)
        }}
      />

      {error && (
        <p role="alert" className="text-[10px] text-fail">
          {error}
        </p>
      )}

      <div className="mt-2 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="solid" size="sm" onClick={submit} disabled={saving || create.isPending}>
          {saving ? 'Salvando' : 'Salvar WOD'}
        </Button>
      </div>
    </div>
  )
}
