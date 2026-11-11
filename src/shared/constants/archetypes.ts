/**
 * Registro de arquetipos (SAAS_PLAN.md §3).
 *
 * `codename` e o identificador PERMANENTE: e o unico nome que codigo, banco e
 * gateway conhecem. `showcaseName` e o personagem de vitrine, temporario e so
 * para UI/landing (§0). Nunca vai para checkout, nota ou `plan_id`.
 *
 * Trocar a vitrine tem que continuar sendo uma linha: desligar
 * `SHOW_SHOWCASE_NAMES` tira todos os nomes de personagem da interface.
 *
 * Por enquanto so a landing le daqui. O motor de rank parametrizado por
 * arquetipo (F1) entra depois e usa os mesmos codinomes.
 */

export const SHOW_SHOWCASE_NAMES = true

export type ArchetypeCodename = 'operador' | 'espartano' | 'sobrevivente' | 'cacador' | 'herdeiro'

export type Archetype = {
  codename: ArchetypeCodename
  /** Rotulo de interface do codinome, em maiuscula. */
  label: string
  /** Personagem de vitrine. Temporario. */
  showcaseName: string
  /** A fantasia em uma linha. */
  tagline: string
  /** O protocolo de treino que o arquetipo propoe. */
  protocol: string
  /** Metricas que pesam mais na regua dele. */
  focus: string[]
  /**
   * Arte da vitrine (F2). Loop curto em video (webm/mp4), nao GIF: o mesmo
   * loop em GIF pesa 5 a 10x mais e nao tem poster. Sem `media`, a landing
   * mostra a moldura vazia. Arquivos em public/archetypes/.
   */
  media?: ArchetypeMedia
}

export type ArchetypeMedia = {
  /** Loop mudo em webm VP9, 1280px, ate ~1,5 MB. */
  video?: string
  /** Mesmo loop em 720px, servido no celular. */
  videoMobile?: string
  /** Fallback H.264 para Safari antigo. */
  videoMp4?: string
  /** Primeiro quadro em webp. E o que aparece com prefers-reduced-motion. */
  poster: string
  /** Descricao da cena para leitor de tela. */
  alt: string
}

export const ARCHETYPES: Archetype[] = [
  {
    codename: 'operador',
    label: 'OPERADOR',
    showcaseName: 'Leon',
    tagline: 'Híbrido tático. Força e condicionamento no mesmo plano.',
    protocol: 'Força 3x por semana, 1 a 2 WODs e um piso de corrida.',
    focus: ['Repetições', 'WOD', 'Quilometragem'],
    // PROTOTIPO: wallpaper animado do Leon, nao e fan art encomendada. O §0 do
    // SAAS_PLAN proibe arte oficial no produto pago: trocar antes do lancamento.
    media: {
      video: '/landing/operador-1280.webm',
      videoMobile: '/landing/operador-720.webm',
      videoMp4: '/landing/operador-1280.mp4',
      poster: '/landing/operador-poster.webp',
      alt: 'Agente tático em operação, em loop.',
    },
  },
  {
    codename: 'espartano',
    label: 'ESPARTANO',
    showcaseName: 'Kratos',
    tagline: 'Força bruta. A fúria vira disciplina.',
    protocol: 'Básicos pesados e poucas repetições: agachamento, terra, supino, desenvolvimento.',
    focus: ['Volume', '1RM estimado', 'Contenção'],
    // PROTOTIPO: wallpaper animado do Kratos. Arte oficial, trocar antes do
    // lancamento (SAAS_PLAN §0).
    media: {
      video: '/landing/espartano-1280.webm',
      videoMobile: '/landing/espartano-720.webm',
      videoMp4: '/landing/espartano-1280.mp4',
      poster: '/landing/espartano-poster.webp',
      alt: 'Guerreiro de força bruta, em loop.',
    },
  },
  {
    codename: 'sobrevivente',
    label: 'SOBREVIVENTE',
    showcaseName: 'Joel',
    tagline: 'Resistência. Continuar andando.',
    protocol: 'Corrida e caminhada com carga, calistenia e treino curto nos dias de escassez.',
    focus: ['Quilometragem', 'Pace', 'Sequência'],
    // PROTOTIPO: imagem estatica do Joel (logo do jogo cortado). Arte oficial,
    // trocar antes do lancamento (SAAS_PLAN §0).
    media: {
      poster: '/landing/sobrevivente.webp',
      alt: 'Sobrevivente de barba grisalha e olhar duro, na penumbra.',
    },
  },
  {
    codename: 'cacador',
    label: 'CAÇADOR',
    showcaseName: 'Dante',
    tagline: 'Estilo e técnica.',
    protocol: 'Calistenia de habilidade: muscle-up, parada de mão, pistol. Variedade.',
    focus: ['Repetições', 'Variedade', 'WOD'],
    // PROTOTIPO: imagem estatica do Dante (rodape de texto cortado). Arte oficial, trocar antes do lancamento (SAAS_PLAN §0).
    media: {
      poster: '/landing/cacador.webp',
      alt: 'Caçador de cabelo branco cruzando espadas em meio a faíscas.',
    },
  },
  {
    codename: 'herdeiro',
    label: 'HERDEIRO',
    showcaseName: 'Nero',
    tagline: 'O começo. Fundamentos.',
    protocol: 'Full-body 3x por semana, técnica e progressão linear simples.',
    focus: ['Consistência', 'Régua mais curta'],
    // PROTOTIPO: imagem estatica do Nero. Arte oficial, trocar antes do lancamento (SAAS_PLAN §0).
    media: {
      poster: '/landing/herdeiro.webp',
      alt: 'Jovem de cabelo branco com o braço em brasa, pronto para o golpe.',
    },
  },
]
