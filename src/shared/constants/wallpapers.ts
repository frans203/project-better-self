import leonDesktop from '@/assets/wallpapers/leon-re4.webp'
import leonMobile from '@/assets/wallpapers/leon-re4-mobile.webp'

export interface Wallpaper {
  id: string
  label: string
  /** 1920w, webp — panoramica */
  src: string
  /** 1080x1920, webp — recorte retrato feito em volta do rosto */
  srcMobile: string
  /** Placeholder borrado inline, evita o flash preto no primeiro paint. */
  lqip: string
  /**
   * Enquadramento por breakpoint. O mobile costuma ser `center` porque a
   * fonte ja e um recorte; o desktop e onde vale reposicionar.
   */
  objectPositionMobile: string
  objectPositionDesktop: string
  /** Arte clara pede veu mais forte; arte escura, mais fraco. */
  veilOpacity: number
  /** O recorte mobile costuma ser mais claro que a panoramica. */
  veilOpacityMobile: number
}

/**
 * Registry de wallpapers. Adicionar arte nova = colocar o arquivo em
 * src/assets/wallpapers/, rodar `node scripts/optimize-wallpapers.mjs`
 * e acrescentar uma entrada aqui. O seletor no perfil le desta lista.
 */
export const WALLPAPERS: Wallpaper[] = [
  {
    id: 'leon-re4',
    label: 'Leon S. Kennedy — RE4',
    src: leonDesktop,
    srcMobile: leonMobile,
    lqip: 'data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAACQAwCdASoYAA4APu1kqU2ppaQiMAgBMB2JZwDLLB2VaKwKQCeAAP7p19mVVu95EZm5OPTXLYHgPyet2w7ag64p0AA=',
    objectPositionMobile: 'center',
    objectPositionDesktop: 'center',
    // Panoramica ja e escura — veu forte apagaria o Leon por completo.
    veilOpacity: 0.3,
    // O close do rosto tem ceu claro atras; sem reforco o texto branco some.
    veilOpacityMobile: 0.5,
  },
]

export const DEFAULT_WALLPAPER_ID = WALLPAPERS[0].id

export function getWallpaper(id: string | null | undefined): Wallpaper {
  return WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0]
}
