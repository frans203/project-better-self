#!/usr/bin/env node
/**
 * Converte midia para a landing com ffmpeg.
 *
 *   node scripts/convert-media.mjs <entrada> <nome> [--crop=w:h:x:y] [--out=public/landing]
 *
 * Video  -> <nome>-1280.webm + <nome>-720.webm + <nome>-poster.webp
 * Imagem -> <nome>.webp (1280px de largura)
 *
 * O tipo vem do ffprobe (duracao + codec), nao da extensao: .gif animado
 * e tratado como video, .png parado como imagem.
 *
 * --crop recebe o filtro crop do ffmpeg em pixels do ORIGINAL. Use para tirar
 * logo, marca d'agua, letterbox ou fechar em 4:3 (o formato do card).
 *
 * Imprime um JSON no fim com os arquivos gerados, os tamanhos e o brilho medio
 * do primeiro quadro (YAVG < 20 = quadro quase preto, ruim de poster).
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { extname, join, resolve } from 'node:path'

const IMAGE_CODECS = new Set(['png', 'mjpeg', 'jpeg2000', 'webp', 'bmp', 'tiff'])

function findBin(name) {
  const exe = process.platform === 'win32' ? `${name}.exe` : name
  const candidates = [
    process.env[`${name.toUpperCase()}_PATH`],
    name,
    // winget (Gyan.FFmpeg) cria o alias aqui, mas so entra no PATH de shells novos.
    join(homedir(), 'AppData', 'Local', 'Microsoft', 'WinGet', 'Links', exe),
  ].filter(Boolean)
  for (const c of candidates) {
    const r = spawnSync(c, ['-version'], { stdio: 'ignore' })
    if (r.status === 0) return c
  }
  console.error(`${name} nao encontrado. Instale: winget install --id Gyan.FFmpeg -e`)
  process.exit(1)
}

const FFMPEG = findBin('ffmpeg')
const FFPROBE = findBin('ffprobe')

function run(bin, args) {
  const r = spawnSync(bin, args, { encoding: 'utf8' })
  if (r.status !== 0) {
    console.error(`falhou: ${bin} ${args.join(' ')}\n${r.stderr}`)
    process.exit(1)
  }
  return r.stdout
}

function parseArgs(argv) {
  const pos = []
  const opts = { out: 'public/landing', crop: null }
  for (const a of argv) {
    if (a.startsWith('--crop=')) opts.crop = a.slice(7)
    else if (a.startsWith('--out=')) opts.out = a.slice(6)
    else pos.push(a)
  }
  if (pos.length !== 2) {
    console.error('uso: node scripts/convert-media.mjs <entrada> <nome> [--crop=w:h:x:y] [--out=dir]')
    process.exit(1)
  }
  if (!/^[a-z0-9-]+$/.test(pos[1])) {
    console.error('nome: so minusculas, numeros e hifen (ex.: cacador, operador-alt)')
    process.exit(1)
  }
  if (opts.crop && !/^\d+:\d+:\d+:\d+$/.test(opts.crop)) {
    console.error('--crop no formato w:h:x:y, em pixels do original')
    process.exit(1)
  }
  return { input: resolve(pos[0]), name: pos[1], ...opts }
}

function probe(input) {
  const json = JSON.parse(
    run(FFPROBE, ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', input]),
  )
  const v = json.streams.find((s) => s.codec_type === 'video')
  if (!v) {
    console.error('a entrada nao tem trilha de video/imagem')
    process.exit(1)
  }
  const duration = Number(json.format.duration ?? v.duration ?? 0)
  const frames = Number(v.nb_frames ?? 0)
  const isImage =
    IMAGE_CODECS.has(v.codec_name) ||
    (v.codec_name === 'gif' && frames <= 1) ||
    (!duration && ['.png', '.jpg', '.jpeg', '.webp', '.bmp'].includes(extname(input).toLowerCase()))
  return { isImage, width: v.width, height: v.height, codec: v.codec_name, duration }
}

/** Brilho medio (0-255) do primeiro quadro de um arquivo. */
function firstFrameLuma(file) {
  const r = spawnSync(
    FFMPEG,
    ['-hide_banner', '-i', file, '-frames:v', '1', '-vf',
      'scale=320:-2,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-', '-f', 'null', '-'],
    { encoding: 'utf8' },
  )
  const m = /YAVG=([\d.]+)/.exec(r.stdout ?? '')
  return m ? Math.round(Number(m[1])) : null
}

const kb = (f) => Math.round(statSync(f).size / 1024)

const { input, name, out, crop } = parseArgs(process.argv.slice(2))
if (!existsSync(input)) {
  console.error(`arquivo nao existe: ${input}`)
  process.exit(1)
}
mkdirSync(out, { recursive: true })

const info = probe(input)
const pre = crop ? `crop=${crop},` : ''
const files = []

if (info.isImage) {
  const dest = join(out, `${name}.webp`)
  run(FFMPEG, ['-v', 'error', '-y', '-i', input, '-vf', `${pre}scale='min(1280,iw)':-2`,
    '-c:v', 'libwebp', '-quality', '74', '-compression_level', '6', dest])
  files.push(dest)
} else {
  const vp9 = ['-c:v', 'libvpx-vp9', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2']
  const desk = join(out, `${name}-1280.webm`)
  const mobile = join(out, `${name}-720.webm`)
  const poster = join(out, `${name}-poster.webp`)
  run(FFMPEG, ['-v', 'error', '-y', '-i', input, '-an', '-vf', `${pre}scale=1280:-2,fps=24`, ...vp9, '-crf', '40', desk])
  run(FFMPEG, ['-v', 'error', '-y', '-i', input, '-an', '-vf', `${pre}scale=720:-2,fps=24`, ...vp9, '-crf', '42', mobile])
  run(FFMPEG, ['-v', 'error', '-y', '-i', input, '-frames:v', '1', '-vf', `${pre}scale=1280:-2`,
    '-c:v', 'libwebp', '-quality', '72', poster])
  files.push(desk, mobile, poster)
}

console.log(
  JSON.stringify(
    {
      type: info.isImage ? 'image' : 'video',
      source: { width: info.width, height: info.height, codec: info.codec, duration: info.duration, kb: kb(input) },
      crop,
      files: files.map((f) => ({ path: f.replaceAll('\\', '/'), kb: kb(f) })),
      firstFrameLuma: firstFrameLuma(files[info.isImage ? 0 : 2]),
    },
    null,
    2,
  ),
)
