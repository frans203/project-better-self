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

  toggleCrt: () => void
  toggleSound: () => void
  setWallpaper: (id: string) => void
  toggleWallpaper: () => void
  markBooted: () => void
}

/** O recorte que vai para o localStorage — espelha o `partialize` abaixo. */
type PersistedUiState = Pick<UiState, 'crt' | 'sound' | 'wallpaperId' | 'wallpaperEnabled'>

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      crt: false,
      sound: true,
      wallpaperId: DEFAULT_WALLPAPER_ID,
      wallpaperEnabled: true,
      booted: false,

      toggleCrt: () => set({ crt: !get().crt }),
      toggleSound: () => {
        const next = !get().sound
        setSoundEnabled(next)
        set({ sound: next })
      },
      setWallpaper: (id) => set({ wallpaperId: id }),
      toggleWallpaper: () => set({ wallpaperEnabled: !get().wallpaperEnabled }),
      markBooted: () => set({ booted: true }),
    }),
    {
      name: 'obs-ui',
      // v1: CRT passou a nascer desligado. Sem o bump, quem ja tinha `crt: true`
      // no localStorage continuaria com o efeito ligado para sempre.
      version: 1,
      migrate: (persisted, version) =>
        version === 0
          ? { ...(persisted as PersistedUiState), crt: false }
          : (persisted as PersistedUiState),
      // `booted` e por sessao, nao por dispositivo — nao persiste.
      partialize: (s) => ({
        crt: s.crt,
        sound: s.sound,
        wallpaperId: s.wallpaperId,
        wallpaperEnabled: s.wallpaperEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) setSoundEnabled(state.sound)
      },
    },
  ),
)
