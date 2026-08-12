/**
 * Gera as variantes de cada wallpaper a partir do original em src/assets/wallpapers/*.jpg|png
 *
 *   <nome>.webp          1920w  — desktop
 *   <nome>-mobile.webp   1080w  — mobile (cortado em 9:16 pra nao desperdicar bytes)
 *   <nome>.lqip.txt      data URI 24w borrado, colado inline como placeholder
 *
 * Uso:  node scripts/optimize-wallpapers.mjs
 */
import { readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const DIR = path.resolve('src/assets/wallpapers')
const SOURCE_EXT = /\.(jpe?g|png)$/i

const files = (await readdir(DIR)).filter((f) => SOURCE_EXT.test(f))

if (files.length === 0) {
  console.log('nenhum wallpaper original encontrado em', DIR)
  process.exit(0)
}

for (const file of files) {
  const name = file.replace(SOURCE_EXT, '')
  const src = path.join(DIR, file)

  const desktop = path.join(DIR, `${name}.webp`)
  await sharp(src).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 80 }).toFile(desktop)

  // Mobile: recorta pro retrato mantendo o lado esquerdo (onde esta o rosto) e reduz.
  const mobile = path.join(DIR, `${name}-mobile.webp`)
  await sharp(src)
    .resize({ width: 1080, height: 1920, fit: 'cover', position: sharp.strategy.attention })
    .webp({ quality: 72 })
    .toFile(mobile)

  // LQIP: 24px de largura, borrado, em base64. Vira o background do <picture> enquanto carrega.
  const lqip = await sharp(src).resize({ width: 24 }).blur(1.5).webp({ quality: 40 }).toBuffer()
  await writeFile(path.join(DIR, `${name}.lqip.txt`), `data:image/webp;base64,${lqip.toString('base64')}`)

  console.log(`${name}: webp + mobile + lqip (${(lqip.length / 1024).toFixed(1)}KB de placeholder)`)
}
