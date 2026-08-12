/**
 * Bipes curtos via Web Audio. Sem arquivo de audio, sem biblioteca — o
 * oscilador basta e o bundle nao cresce.
 *
 * Regras: nada toca antes do primeiro gesto do usuario (politica de autoplay
 * do browser resolve isso sozinha ao criar o contexto sob demanda), e tudo
 * respeita o toggle em ui-store.
 */

let ctx: AudioContext | null = null
let enabled = true

export function setSoundEnabled(value: boolean) {
  enabled = value
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

interface BeepOptions {
  freq: number
  duration?: number
  type?: OscillatorType
  gain?: number
  sweepTo?: number
}

function beep({ freq, duration = 0.06, type = 'square', gain = 0.03, sweepTo }: BeepOptions) {
  if (!enabled) return
  const audio = getCtx()
  if (!audio) return

  const osc = audio.createOscillator()
  const vol = audio.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, audio.currentTime)
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, audio.currentTime + duration)

  vol.gain.setValueAtTime(gain, audio.currentTime)
  vol.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration)

  osc.connect(vol)
  vol.connect(audio.destination)
  osc.start()
  osc.stop(audio.currentTime + duration)
}

export const playClick = () => beep({ freq: 620, duration: 0.035, gain: 0.025 })
export const playNav = () => beep({ freq: 420, duration: 0.045, gain: 0.02 })
export const playCheck = () => beep({ freq: 720, sweepTo: 1180, duration: 0.11, gain: 0.035 })
export const playUncheck = () => beep({ freq: 520, sweepTo: 300, duration: 0.09, gain: 0.03 })
export const playRelapse = () => beep({ freq: 200, sweepTo: 110, duration: 0.3, type: 'sawtooth', gain: 0.03 })

/** PR batido: dois bipes subindo. */
export function playRecord() {
  beep({ freq: 660, duration: 0.08, gain: 0.035 })
  setTimeout(() => beep({ freq: 990, duration: 0.16, gain: 0.04 }), 90)
}
