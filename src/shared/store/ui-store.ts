import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_WALLPAPER_ID } from '@/shared/constants/wallpapers'
import { setSoundEnabled } from '@/shared/lib/sounds'

interface UiState {
  crt: boolean
  sound: boolean
  wallpaperId: string
  wallpaperEnabled: boolean
  /** Ja rodou o boot screen nesta aba? */
  booted: boolean
  /**
   * Requisitos de nivel que ja renderam confete, por `nivelAlvo:metrica`.
   *
   * Fica aqui, e nao no banco, porque e memoria de UI: serve so para nao
   * comemorar duas vezes a mesma conquista. Perder isso ao trocar de
   * dispositivo custa um confete repetido, nao um dado.
   */
  celebrated: Record<string, true>

  toggleCrt: () => void
  toggleSound: () => void
  setWallpaper: (id: string) => void
  toggleWallpaper: () => void
  markBooted: () => void
  markCelebrated: (keys: string[]) => void
}

/** O recorte que vai para o localStorage — espelha o `partialize` abaixo. */
type PersistedUiState = Pick<
  UiState,
  'crt' | 'sound' | 'wallpaperId' | 'wallpaperEnabled' | 'celebrated'
>

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      crt: false,
      sound: true,
      wallpaperId: DEFAULT_WALLPAPER_ID,
      wallpaperEnabled: true,
      booted: false,
      celebrated: {},

      toggleCrt: () => set({ crt: !get().crt }),
      toggleSound: () => {
        const next = !get().sound
        setSoundEnabled(next)
        set({ sound: next })
      },
      setWallpaper: (id) => set({ wallpaperId: id }),
      toggleWallpaper: () => set({ wallpaperEnabled: !get().wallpaperEnabled }),
      markBooted: () => set({ booted: true }),
      markCelebrated: (keys) => {
        if (keys.length === 0) return
        const next = { ...get().celebrated }
        for (const k of keys) next[k] = true
        set({ celebrated: next })
      },
    }),
    {
      name: 'obs-ui',
      // v1: CRT passou a nascer desligado. Sem o bump, quem ja tinha `crt: true`
      // no localStorage continuaria com o efeito ligado para sempre.
      // v2: entrou `celebrated`. Sem o default no migrate, quem ja tem o
      // 'obs-ui' salvo rehidrata sem a chave e Object.keys(celebrated) estoura.
      version: 2,
      migrate: (persisted, version) => {
        const prev = (persisted ?? {}) as Partial<PersistedUiState>
        return {
          ...prev,
          ...(version === 0 ? { crt: false } : {}),
          celebrated: prev.celebrated ?? {},
        } as PersistedUiState
      },
      // `booted` e por sessao, nao por dispositivo — nao persiste.
      partialize: (s) => ({
        crt: s.crt,
        sound: s.sound,
        wallpaperId: s.wallpaperId,
        wallpaperEnabled: s.wallpaperEnabled,
        celebrated: s.celebrated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) setSoundEnabled(state.sound)
      },
    },
  ),
)
