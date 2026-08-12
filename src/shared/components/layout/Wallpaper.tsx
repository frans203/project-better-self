import type { CSSProperties } from 'react'
import { getWallpaper } from '@/shared/constants/wallpapers'
import { useUiStore } from '@/shared/store/ui-store'

/**
 * Wallpaper de fundo com veu preto por cima.
 *
 * Duas fontes (mobile recortado em retrato / desktop panoramico) porque servir
 * a arte de 1920px pro celular gastaria banda a toa e ainda enquadraria errado.
 * O LQIP entra como background-image do proprio <img>: enquanto o webp carrega,
 * o que aparece e a versao borrada de 24px, nao um retangulo preto.
 *
 * Enquadramento e opacidade do veu saem do registry por custom property, entao
 * arte nova so precisa de uma entrada em WALLPAPERS — nada de CSS novo.
 */
export function Wallpaper() {
  const { wallpaperId, wallpaperEnabled } = useUiStore()
  const wp = getWallpaper(wallpaperId)

  if (!wallpaperEnabled) {
    return (
      <div
        className="hero-veil"
        style={{ '--veil-opacity': 1, '--veil-opacity-mobile': 1 } as CSSProperties}
      />
    )
  }

  return (
    <>
      <picture>
        <source media="(max-width: 768px)" srcSet={wp.srcMobile} type="image/webp" />
        <source srcSet={wp.src} type="image/webp" />
        <img
          src={wp.src}
          alt=""
          aria-hidden
          fetchPriority="high"
          decoding="async"
          className="hero-wallpaper"
          style={
            {
              backgroundImage: `url(${wp.lqip})`,
              '--wp-pos-mobile': wp.objectPositionMobile,
              '--wp-pos-desktop': wp.objectPositionDesktop,
            } as CSSProperties
          }
        />
      </picture>
      <div
        className="hero-veil"
        style={
          {
            '--veil-opacity': wp.veilOpacity,
            '--veil-opacity-mobile': wp.veilOpacityMobile,
          } as CSSProperties
        }
      />
    </>
  )
}
