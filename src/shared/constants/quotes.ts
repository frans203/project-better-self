/**
 * Duas colecoes. Regra de integridade: frase com `author` e frase que a pessoa
 * realmente disse (traduzida). Frase escrita para o app vai SEM autor — nao
 * existe citacao inventada com nome de gente real embaixo.
 */

export interface FieldQuote {
  text: string
  /** Ausente = escrita para o app. */
  author?: string
  /** Contexto curto do conceito, quando ajuda. */
  note?: string
}

export const FIELD_QUOTES: readonly FieldQuote[] = [
  // ---- Goggins, atribuidas ----
  {
    text: 'Voce tem que criar calos na mente do mesmo jeito que cria calos na mao. Calejar pela dor e pelo sofrimento.',
    author: 'David Goggins',
  },
  {
    text: 'Quando a sua cabeca diz que acabou, voce esta em 40%.',
    author: 'David Goggins',
    note: 'a regra dos 40%',
  },
  {
    text: 'O unico jeito de ficar mais duro e se colocar em situacoes infernais.',
    author: 'David Goggins',
  },
  {
    text: 'Faca o inventario da sua vida. Olhe no espelho e se responsabilize.',
    author: 'David Goggins',
    note: 'o espelho da responsabilidade',
  },
  {
    text: 'Voce nunca vai aprender nada com quem concorda com voce.',
    author: 'David Goggins',
  },
  { text: 'Sofrer e o verdadeiro teste da vida.', author: 'David Goggins' },
  { text: 'Motivacao e uma merda. Ela vem e vai.', author: 'David Goggins' },

  // ---- Escritas para o app ----
  { text: 'Ninguem vem te salvar. E a pior e a melhor noticia que voce vai receber hoje.' },
  { text: 'Depressao nao negocia. Voce nao vence discutindo, vence levantando.' },
  { text: 'O dia que voce menos quer e exatamente o dia que conta.' },
  { text: 'Consistencia nao e fazer sempre bem. E fazer sempre.' },
  { text: 'Voce nao precisa sentir vontade. Vontade e passageira, o registro e permanente.' },
  { text: 'Registrar um dia ruim ainda e registrar. Sumir e a unica derrota real.' },
  { text: 'Disciplina e o que sobra quando a empolgacao acaba.' },
  { text: 'Ninguem aplaude. Faz mesmo assim.' },
  { text: 'Recaida nao apaga o historico. Ela so reinicia o contador.' },
  { text: 'Nao confunda estar cansado com estar terminado.' },
  { text: 'A parte dificil nao e comecar. E comecar de novo pela setima vez.' },
  { text: 'Ninguem esta vendo. E exatamente esse o teste.' },
  { text: 'Quem voce e as cinco da manha e quem voce e.' },
  { text: 'O desconforto e o preco da entrada. Nao tem meia-entrada.' },
  { text: 'Voce nao esta construindo um corpo. Esta construindo alguem que nao desiste.' },
  { text: 'A vontade morre em vinte minutos. O habito nao.' },
  { text: 'Todo dia que voce nao registra e um dia que voce entregou de graca.' },
  { text: 'A mente pede pra parar muito antes do corpo precisar.' },
  { text: 'Nao existe fundo do poco com pa na mao.' },
  { text: 'Constancia vence intensidade. Sempre venceu.' },
  { text: 'Voce nao tem que estar inteiro pra fazer o que precisa ser feito.' },
  { text: 'O tedio e o ultimo chefe. Quase ninguem chega nele.' },
  { text: 'Zero nao e um numero pequeno. E um numero diferente.' },
] as const

export interface LeonLine {
  text: string
  /** true = fala real do jogo (traduzida). false = escrita para o app. */
  canon: boolean
  source?: string
}

export const LEON_LINES: readonly LeonLine[] = [
  { text: 'Melhor tentar um truque novo, esse ai ja ficou velho.', canon: true, source: 'RE4' },
  { text: 'Aonde e que todo mundo vai? Bingo?', canon: true, source: 'RE4' },
  { text: 'Foi bem, isso.', canon: true, source: 'RE4' },

  { text: 'Ja estive em lugares piores. Continuo aqui.', canon: false },
  { text: 'Um passo. Depois o proximo. E assim que se sai de qualquer lugar.', canon: false },
  { text: 'Nao e sobre nao sentir medo. E sobre andar com ele do lado.', canon: false },
  { text: 'Sobreviver nao e bonito. So funciona.', canon: false },
  { text: 'Todo mundo que eu perdi me ensinou a nao parar.', canon: false },
  { text: 'Se der ruim, improvisa. Deu certo ate aqui.', canon: false },
  { text: 'Descansa. Amanha tem mais.', canon: false },
  { text: 'O trabalho nunca acaba. E por isso que a gente aparece.', canon: false },
  { text: 'Nao olha pra tras procurando culpa. Olha pra frente procurando saida.', canon: false },
  { text: 'Ja fui novato tambem. Ninguem nasce pronto pra isso.', canon: false },
  { text: 'Fica em movimento. Alvo parado e alvo facil.', canon: false },
  { text: 'Nao confia em atalho. Confia no treino.', canon: false },
  { text: 'Uma sala de cada vez. Sempre foi assim.', canon: false },
  { text: 'Ninguem sai ileso. Sai vivo, que ja e muito.', canon: false },
  { text: 'Cansaco passa. Arrependimento fica.', canon: false },
  { text: 'Missao e missao. Sentimento a gente resolve depois.', canon: false },
  { text: 'Voce chegou ate aqui. Isso nao foi sorte.', canon: false },
] as const
