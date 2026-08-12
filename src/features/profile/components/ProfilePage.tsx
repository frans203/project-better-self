import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Image as ImageIcon, LogOut, Monitor, Save, Volume2 } from 'lucide-react'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { Button, Input, Loading, Panel, SectionLabel, showSnack } from '@/shared/components/ui'
import { WALLPAPERS } from '@/shared/constants/wallpapers'
import { useUiStore } from '@/shared/store/ui-store'
import { todayKey } from '@/shared/lib/date'
import { cn } from '@/shared/lib/utils'
import { profileQuery, useUpdateProfile } from '../api/profile-api'
import { useHabitWindow } from '@/features/checkin/hooks/use-habit-window'
import { supabase } from '@/shared/lib/supabase'
import { useAuthStore } from '@/shared/store/auth-store'

export function ProfilePage() {
  const { data: profile, isPending } = useQuery(profileQuery())
  const update = useUpdateProfile()
  const { logs } = useHabitWindow()
  const email = useAuthStore((s) => s.session?.user.email)

  const {
    crt,
    sound,
    wallpaperId,
    wallpaperEnabled,
    toggleCrt,
    toggleSound,
    setWallpaper,
    toggleWallpaper,
  } = useUiStore()

  const exportData = () => {
    const payload = JSON.stringify({ profile, habit_logs: logs }, null, 2)
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `better-self-${todayKey()}.json`
    a.click()
    URL.revokeObjectURL(url)
    showSnack('Export gerado')
  }

  if (isPending) return <Loading label="Lendo perfil" />

  return (
    <div className="page-section mx-auto w-full max-w-2xl">
      <PageHeader title="Perfil" subtitle="Operador local" />

      <div className="flex flex-col gap-6 boot-up">
        <div>
          <SectionLabel className="mb-3">Identificacao</SectionLabel>
          {/* Form em componente proprio, montado so quando o perfil ja chegou:
              o estado inicial vem direto das props e nao precisa de useEffect
              copiando dado do servidor para o state a cada mudanca. */}
          <IdentityForm
            key={profile?.id ?? 'none'}
            initialName={profile?.display_name ?? ''}
            initialStartDate={profile?.start_date ?? todayKey()}
            saving={update.isPending}
            onSave={(display_name, start_date) => update.mutate({ display_name, start_date })}
          />
        </div>

        <div>
          <SectionLabel className="mb-3">Aparencia</SectionLabel>
          <Panel className="flex flex-col gap-1 p-2">
            <ToggleRow
              icon={Monitor}
              label="Efeito CRT"
              hint="Ruido, scanlines e vinheta."
              checked={crt}
              onChange={toggleCrt}
            />
            <ToggleRow
              icon={Volume2}
              label="Som"
              hint="Bipes curtos de confirmacao."
              checked={sound}
              onChange={toggleSound}
            />
            <ToggleRow
              icon={ImageIcon}
              label="Wallpaper na home"
              hint="Desligado, a home fica em preto puro."
              checked={wallpaperEnabled}
              onChange={toggleWallpaper}
            />
          </Panel>
        </div>

        <div>
          <SectionLabel className="mb-3">Wallpaper</SectionLabel>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {WALLPAPERS.map((wp) => (
              <button
                key={wp.id}
                onClick={() => setWallpaper(wp.id)}
                aria-pressed={wp.id === wallpaperId}
                className={cn(
                  'cover-frame group relative aspect-video cursor-pointer transition-all',
                  wp.id === wallpaperId
                    ? 'border-solid border-white shadow-[0_0_14px_rgba(255,255,255,0.2)]'
                    : 'hover:border-white/40',
                )}
              >
                <img src={wp.src} alt={wp.label} loading="lazy" />
                <span className="absolute inset-x-0 bottom-0 bg-black/75 px-2 py-1 text-left text-[9px] uppercase tracking-[0.1em] text-text-primary">
                  {wp.label}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-text-muted">
            Novas artes entram em src/assets/wallpapers e no registry — o seletor le de la.
          </p>
        </div>

        <div>
          <SectionLabel className="mb-3">Dados</SectionLabel>
          <Panel className="flex flex-col gap-3 p-5">
            <p className="text-[11px] leading-relaxed text-text-muted">
              Base protegida por RLS: cada linha e visivel so para o dono, verificado pelo
              JWT da sessao. O export sai com o que esta em cache nesta janela.
            </p>
            <Button variant="outline" size="sm" className="self-start" onClick={exportData}>
              Exportar JSON
            </Button>
          </Panel>
        </div>

        <div>
          <SectionLabel className="mb-3">Sessao</SectionLabel>
          <Panel className="flex flex-col gap-3 p-5">
            <p className="text-[11px] text-text-muted">
              Conectado como <span className="text-text-primary">{email ?? '—'}</span>
            </p>
            <Button
              variant="danger"
              size="sm"
              className="self-start"
              onClick={() => void supabase.auth.signOut()}
            >
              <LogOut />
              Encerrar sessao
            </Button>
          </Panel>
        </div>
      </div>
    </div>
  )
}

interface IdentityFormProps {
  initialName: string
  initialStartDate: string
  saving: boolean
  onSave: (displayName: string | null, startDate: string) => void
}

function IdentityForm({ initialName, initialStartDate, saving, onSave }: IdentityFormProps) {
  const [name, setName] = useState(initialName)
  const [startDate, setStartDate] = useState(initialStartDate)

  return (
    <Panel className="flex flex-col gap-4 p-5">
      <Input
        label="Nome do agente"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="AGENTE"
      />
      <Input
        label="Inicio da operacao"
        type="date"
        value={startDate}
        max={todayKey()}
        onChange={(e) => setStartDate(e.target.value)}
        hint="Dia zero. Alimenta o contador da home e o streak de contencao quando nao ha recaida registrada."
      />
      <Button
        variant="solid"
        size="sm"
        className="self-start"
        disabled={saving}
        onClick={() => onSave(name.trim() || null, startDate)}
      >
        <Save />
        {saving ? 'Salvando' : 'Salvar'}
      </Button>
    </Panel>
  )
}

interface ToggleRowProps {
  icon: typeof Monitor
  label: string
  hint: string
  checked: boolean
  onChange: () => void
}

function ToggleRow({ icon: Icon, label, hint, checked, onChange }: ToggleRowProps) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className="flex cursor-pointer items-center gap-3 p-3 text-left transition-colors hover:bg-white/3"
    >
      <Icon
        className={cn('size-4 shrink-0', checked ? 'text-white' : 'text-text-muted')}
        strokeWidth={1.5}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] text-text-primary">{label}</span>
        <span className="block text-[10px] text-text-muted">{hint}</span>
      </span>
      <span
        className={cn(
          'flex h-5 w-9 shrink-0 items-center border p-0.5 transition-colors',
          checked ? 'border-white bg-white/15' : 'border-border-default',
        )}
      >
        <span
          className={cn(
            'size-3.5 transition-transform',
            checked ? 'translate-x-4 bg-white' : 'translate-x-0 bg-text-muted',
          )}
        />
      </span>
    </button>
  )
}
