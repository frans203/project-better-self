import { useState } from 'react'
import { Modal, Button, Input, Textarea, Select } from '@/shared/components/ui'
import { todayKey, type DayKey } from '@/shared/lib/date'
import { fmtPace } from '@/shared/lib/utils'
import type { RunRow } from '@/shared/types/database.types'
import { useCreateRun, useUpdateRun, type RunInput } from '../api/running-api'

interface RunFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Presente = edicao. Ausente = nova corrida. */
  run?: RunRow | null
}

const FEELINGS = [
  { value: '', label: 'Nao informado' },
  { value: '1', label: '1 — arrastado' },
  { value: '2', label: '2 — pesado' },
  { value: '3', label: '3 — normal' },
  { value: '4', label: '4 — bom' },
  { value: '5', label: '5 — voando' },
]

export function RunFormModal({ open, onOpenChange, run }: RunFormModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={run ? 'Editar corrida' : 'Registrar corrida'}
      description="O habito 'Corrida' do dia e marcado automaticamente."
      footer={null}
    >
      {/*
        O corpo do form so existe enquanto o modal esta aberto, e a key troca
        junto com o registro editado. Assim o estado nasce ja preenchido no
        useState e nao precisa de useEffect sincronizando props -> state — que
        e o padrao que causa render em cascata e limpa o que o usuario digitou.
      */}
      {open && <RunForm key={run?.id ?? 'new'} run={run ?? null} onDone={() => onOpenChange(false)} />}
    </Modal>
  )
}

function RunForm({ run, onDone }: { run: RunRow | null; onDone: () => void }) {
  const create = useCreateRun()
  const update = useUpdateRun()

  const [date, setDate] = useState<DayKey>(run?.run_date ?? todayKey())
  const [distance, setDistance] = useState(run ? String(run.distance_km) : '')
  const [duration, setDuration] = useState(run?.duration_min ? String(run.duration_min) : '')
  const [route, setRoute] = useState(run?.route ?? '')
  const [feeling, setFeeling] = useState(run?.feeling ? String(run.feeling) : '')
  const [note, setNote] = useState(run?.note ?? '')
  const [error, setError] = useState<string | null>(null)

  const km = Number(distance.replace(',', '.'))
  const min = duration ? Number(duration) : null
  const pacePreview = km > 0 && min ? fmtPace((min * 60) / km) : null
  const saving = create.isPending || update.isPending

  const submit = async () => {
    if (!Number.isFinite(km) || km <= 0) {
      setError('Informe a distancia em km.')
      return
    }

    const payload: RunInput = {
      run_date: date,
      distance_km: Math.round(km * 100) / 100,
      duration_min: min && min > 0 ? Math.round(min) : null,
      route: route.trim() || null,
      feeling: feeling ? Number(feeling) : null,
      note: note.trim() || null,
    }

    if (run) await update.mutateAsync({ id: run.id, ...payload })
    else await create.mutateAsync(payload)

    onDone()
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Data"
        type="date"
        value={date}
        max={todayKey()}
        onChange={(e) => setDate(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Distancia"
          type="number"
          inputMode="decimal"
          step="0.01"
          min={0}
          suffix="km"
          placeholder="5"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          error={error ?? undefined}
        />
        <Input
          label="Duracao"
          type="number"
          inputMode="numeric"
          min={0}
          suffix="min"
          placeholder="30"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          hint={pacePreview ? `Pace ${pacePreview} /km` : 'Opcional'}
        />
      </div>

      <Input
        label="Percurso"
        placeholder="Parque, esteira, rua de casa..."
        value={route}
        onChange={(e) => setRoute(e.target.value)}
      />

      <Select
        label="Sensacao"
        options={FEELINGS}
        value={feeling}
        onChange={(e) => setFeeling(e.target.value)}
      />

      <Textarea
        label="Nota"
        placeholder="Como foi."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="mt-2 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onDone}>
          Cancelar
        </Button>
        <Button variant="solid" size="sm" onClick={submit} disabled={saving}>
          {saving ? 'Salvando' : 'Salvar'}
        </Button>
      </div>
    </div>
  )
}
