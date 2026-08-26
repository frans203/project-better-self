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
    text: 'Você tem que criar calos na mente do mesmo jeito que cria calos na mão. Calejar pela dor e pelo sofrimento.',
    author: 'David Goggins',
  },
  {
    text: 'Quando a sua cabeça diz que acabou, você está em 40%.',
    author: 'David Goggins',
    note: 'a regra dos 40%',
  },
  {
    text: 'O único jeito de ficar mais duro é se colocar em situações infernais.',
    author: 'David Goggins',
  },
  {
    text: 'Faça o inventário da sua vida. Olhe no espelho e se responsabilize.',
    author: 'David Goggins',
    note: 'o espelho da responsabilidade',
  },
  {
    text: 'Você nunca vai aprender nada com quem concorda com você.',
    author: 'David Goggins',
  },
  { text: 'Sofrer é o verdadeiro teste da vida.', author: 'David Goggins' },
  { text: 'Motivação é uma merda. Ela vem e vai.', author: 'David Goggins' },

  // ---- Escritas para o app ----
  { text: 'Ninguém vem te salvar. É a pior e a melhor notícia que você vai receber hoje.' },
  { text: 'Depressão não negocia. Você não vence discutindo, vence levantando.' },
  { text: 'O dia que você menos quer é exatamente o dia que conta.' },
  { text: 'Consistência não é fazer sempre bem. É fazer sempre.' },
  { text: 'Você não precisa sentir vontade. Vontade é passageira, o registro é permanente.' },
  { text: 'Registrar um dia ruim ainda é registrar. Sumir é a única derrota real.' },
  { text: 'Disciplina é o que sobra quando a empolgação acaba.' },
  { text: 'Ninguém aplaude. Faz mesmo assim.' },
  { text: 'Recaída não apaga o histórico. Ela só reinicia o contador.' },
  { text: 'Não confunda estar cansado com estar terminado.' },
  { text: 'A parte difícil não é começar. É começar de novo pela sétima vez.' },
  { text: 'Ninguém está vendo. É exatamente esse o teste.' },
  { text: 'Quem você é às cinco da manhã é quem você é.' },
  { text: 'O desconforto é o preço da entrada. Não tem meia-entrada.' },
  { text: 'Você não está construindo um corpo. Está construindo alguém que não desiste.' },
  { text: 'A vontade morre em vinte minutos. O hábito não.' },
  { text: 'Todo dia que você não registra é um dia que você entregou de graça.' },
  { text: 'A mente pede pra parar muito antes do corpo precisar.' },
  { text: 'Não existe fundo do poço com pá na mão.' },
  { text: 'Constância vence intensidade. Sempre venceu.' },
  { text: 'Você não tem que estar inteiro pra fazer o que precisa ser feito.' },
  { text: 'O tédio é o último chefe. Quase ninguém chega nele.' },
  { text: 'Zero não é um número pequeno. É um número diferente.' },
] as const

export interface LeonLine {
  text: string
  /** true = fala real do jogo (traduzida). false = escrita para o app. */
  canon: boolean
  source?: string
}

export const LEON_LINES: readonly LeonLine[] = [
  { text: 'Melhor tentar um truque novo, esse aí já ficou velho.', canon: true, source: 'RE4' },
  { text: 'Aonde é que todo mundo vai? Bingo?', canon: true, source: 'RE4' },
  { text: 'Foi bem, isso.', canon: true, source: 'RE4' },

  { text: 'Já estive em lugares piores. Continuo aqui.', canon: false },
  { text: 'Um passo. Depois o próximo. É assim que se sai de qualquer lugar.', canon: false },
  { text: 'Não é sobre não sentir medo. É sobre andar com ele do lado.', canon: false },
  { text: 'Sobreviver não é bonito. Só funciona.', canon: false },
  { text: 'Todo mundo que eu perdi me ensinou a não parar.', canon: false },
  { text: 'Se der ruim, improvisa. Deu certo até aqui.', canon: false },
  { text: 'Descansa. Amanhã tem mais.', canon: false },
  { text: 'O trabalho nunca acaba. É por isso que a gente aparece.', canon: false },
  { text: 'Não olha pra trás procurando culpa. Olha pra frente procurando saída.', canon: false },
  { text: 'Já fui novato também. Ninguém nasce pronto pra isso.', canon: false },
  { text: 'Fica em movimento. Alvo parado é alvo fácil.', canon: false },
  { text: 'Não confia em atalho. Confia no treino.', canon: false },
  { text: 'Uma sala de cada vez. Sempre foi assim.', canon: false },
  { text: 'Ninguém sai ileso. Sai vivo, que já é muito.', canon: false },
  { text: 'Cansaço passa. Arrependimento fica.', canon: false },
  { text: 'Missão é missão. Sentimento a gente resolve depois.', canon: false },
  { text: 'Você chegou até aqui. Isso não foi sorte.', canon: false },
] as const
