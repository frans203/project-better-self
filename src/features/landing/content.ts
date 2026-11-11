/**
 * Texto e numeros da landing num lugar so.
 *
 * PRECO DE FUNDADOR (decisao de 11/11/2026): alem do RECRUTA gratis, so dois
 * planos pagos, os dois com preco travado para sempre para quem assinar
 * agora. R$ 19,90/mes ou R$ 100/ano. Mudou o preco, muda aqui.
 *
 * Regra de copy (CLAUDE.md): seco, sem emoji, sem exclamacao, sem prometer o
 * que o app nao faz. Cada afirmacao abaixo tem que ser verdade no produto.
 */

export const PRICING = {
  monthly: 'R$ 19,90',
  yearly: 'R$ 100',
  /** 100 / 12, arredondado para cima: nunca anunciar menos do que se cobra. */
  yearlyPerMonth: 'R$ 8,34',
  /** 1 - 100 / (19,90 x 12) = 58,1%. Arredondado para baixo. */
  yearlySavings: '58%',
} as const

export type Plan = {
  id: 'recruta' | 'fundador-mensal' | 'fundador-anual'
  label: string
  price: string
  period: string
  note: string
  items: string[]
  cta: string
  featured?: boolean
}

const PRO_ITEMS = [
  'Todos os arquétipos, troca livre',
  'Histórico completo de carga e corrida',
  'Escada inteira e histórico de rank',
  'Relatórios: 6 meses, gatilhos, consistência',
  'Protocolo completo do arquétipo',
]

export const PLANS: Plan[] = [
  {
    id: 'recruta',
    label: 'RECRUTA',
    price: 'R$ 0',
    period: 'para sempre',
    note: '7 dias com tudo liberado no alistamento.',
    items: [
      '1 arquétipo, escolhido no cadastro',
      'Check-in, treino, corrida e WOD sem limite',
      'Rank atual e requisitos do próximo nível',
      'Recorde pessoal detectado sempre',
      'Export dos seus dados',
    ],
    cta: '[ ALISTAR-SE ]',
  },
  {
    id: 'fundador-mensal',
    label: 'FUNDADOR MENSAL',
    price: PRICING.monthly,
    period: 'por mês',
    note: 'Preço de fundador: nunca aumenta.',
    items: PRO_ITEMS,
    cta: '[ ASSINAR MENSAL ]',
  },
  {
    id: 'fundador-anual',
    label: 'FUNDADOR ANUAL',
    price: PRICING.yearly,
    period: `por ano · ${PRICING.yearlyPerMonth}/mês`,
    note: `Preço de fundador: nunca aumenta. ${PRICING.yearlySavings} a menos que o mensal.`,
    items: PRO_ITEMS,
    cta: '[ ASSINAR ANUAL ]',
    featured: true,
  },
]

export type Faq = { q: string; a: string }

export const FAQ: Faq[] = [
  {
    q: 'Preciso já treinar?',
    a: 'Não. O arquétipo HERDEIRO existe para isso: full-body 3x por semana, técnica e uma régua de rank mais curta. Todo mundo começa no LIXO.',
  },
  {
    q: 'Preciso de cartão para testar?',
    a: 'Não. Os 7 dias de alistamento são livres. Depois disso, ou você assina, ou continua no RECRUTA. O registro nunca trava.',
  },
  {
    q: 'O rank pode cair?',
    a: 'Pode. Os requisitos olham os últimos 7 e 15 dias: se você para, a janela anda e o nível desce. Recaída na contenção derruba um nível; duas em 15 dias derrubam dois. Um dia sem registro, sozinho, não derruba nada.',
  },
  {
    q: 'E se eu recair na contenção?',
    a: 'Você registra, com o gatilho se quiser. O contador volta para zero, o nível sofre o ajuste e a operação continua. Sem sermão.',
  },
  {
    q: 'Meus dados são meus?',
    a: 'São. Cada conta só enxerga as próprias linhas, o export completo é grátis e excluir a conta apaga de verdade. Contenção é dado sensível pela LGPD e só entra se você ligar o módulo.',
  },
  {
    q: 'Posso cancelar?',
    a: 'Quando quiser. Você volta para o RECRUTA e nenhum registro some.',
  },
  {
    q: 'O preço de fundador muda depois?',
    a: `Não. Quem assina agora paga ${PRICING.monthly} por mês ou ${PRICING.yearly} por ano enquanto a assinatura estiver ativa, mesmo que o preço suba para quem chegar depois.`,
  },
  {
    q: 'Tem app?',
    a: 'Roda no navegador do celular, feito para tela pequena primeiro. A versão instalável na tela inicial está em preparo.',
  },
]
