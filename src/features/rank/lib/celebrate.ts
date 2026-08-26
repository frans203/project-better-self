/**
 * Confete de conquista.
 *
 * Monocromatico de proposito: estilhaços brancos quadrados, nao papel picado
 * colorido. O sistema tem um accent so e `--radius: 0` — o confete respeita as
 * duas coisas, senao parece que veio de outro app.
 *
 * O import e dinamico e so acontece aqui: assim a lib nao entra no bundle
 * inicial, so no chunk da tela de nivel, e so quando ha o que comemorar.
 */
const COLORS = ['#ffffff', '#d4d4d4', '#8a8a8a']

export async function fireConfetti(): Promise<void> {
  const { default: confetti } = await import('canvas-confetti')

  const base = {
    colors: COLORS,
    shapes: ['square' as const],
    scalar: 0.7,
    ticks: 120,
    gravity: 1.1,
    disableForReducedMotion: true,
  }

  // Duas rajadas laterais em vez de uma central: o miolo da tela e onde estao
  // os requisitos, e o confete nao deve tapar justamente o que foi riscado.
  confetti({ ...base, particleCount: 45, spread: 55, origin: { x: 0.15, y: 0.45 }, angle: 60 })
  confetti({ ...base, particleCount: 45, spread: 55, origin: { x: 0.85, y: 0.45 }, angle: 120 })
}
