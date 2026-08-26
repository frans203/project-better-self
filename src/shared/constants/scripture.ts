/**
 * Passagens para a tela de nivel.
 *
 * TRADUCAO: Almeida Revista e Corrigida (ARC), dominio publico. A escolha nao
 * e estetica — ACF e da Trinitariana, NVI e da Biblica, ARA/NAA sao da SBB, e
 * nenhuma delas pode ser embutida num repositorio. A ARC ainda tem a vantagem
 * de vir integralmente acentuada, que e o ponto do resto desta tela.
 *
 * Rotacao diaria deterministica, igual a fala do Leon: pickByDate garante a
 * mesma passagem o dia inteiro, entao ela nao troca no meio da leitura.
 */

export type ScriptureTheme = 'perdao' | 'pureza' | 'ansiedade' | 'forca' | 'luta'

export const THEME_LABEL: Record<ScriptureTheme, string> = {
  perdao: 'Perdão',
  pureza: 'Pureza',
  ansiedade: 'Ansiedade',
  forca: 'Força',
  luta: 'Luta',
}

export interface ScriptureVerse {
  n: number
  text: string
}

export interface Scripture {
  ref: string
  theme: ScriptureTheme
  verses: ScriptureVerse[]
}

export const SCRIPTURES: readonly Scripture[] = [
  // ---------------------------------------------------------------- perdão --
  {
    ref: 'Salmo 32:1-5',
    theme: 'perdao',
    verses: [
      { n: 1, text: 'Bem-aventurado aquele cuja transgressão é perdoada, e cujo pecado é coberto.' },
      { n: 2, text: 'Bem-aventurado o homem a quem o SENHOR não imputa maldade, e em cujo espírito não há engano.' },
      { n: 3, text: 'Quando eu me calei, envelheceram os meus ossos pelo meu bramido em todo o dia.' },
      { n: 4, text: 'Porque de dia e de noite a tua mão pesava sobre mim; o meu humor se tornou em sequidão de estio.' },
      { n: 5, text: 'Confessei-te o meu pecado, e a minha maldade não encobri. Dizia eu: Confessarei ao SENHOR as minhas transgressões; e tu perdoaste a maldade do meu pecado.' },
    ],
  },
  {
    ref: 'Salmo 51:1-12',
    theme: 'perdao',
    verses: [
      { n: 1, text: 'Tem misericórdia de mim, ó Deus, segundo a tua benignidade; apaga as minhas transgressões, segundo a multidão das tuas misericórdias.' },
      { n: 2, text: 'Lava-me completamente da minha iniquidade, e purifica-me do meu pecado.' },
      { n: 3, text: 'Porque eu conheço as minhas transgressões, e o meu pecado está sempre diante de mim.' },
      { n: 4, text: 'Contra ti, contra ti somente pequei, e fiz o que é mal à tua vista.' },
      { n: 6, text: 'Eis que amas a verdade no íntimo, e no oculto me fazes conhecer a sabedoria.' },
      { n: 7, text: 'Purifica-me com hissopo, e ficarei puro; lava-me, e ficarei mais branco do que a neve.' },
      { n: 10, text: 'Cria em mim, ó Deus, um coração puro, e renova em mim um espírito reto.' },
      { n: 11, text: 'Não me lances fora da tua presença, e não retires de mim o teu Espírito Santo.' },
      { n: 12, text: 'Torna a dar-me a alegria da tua salvação, e sustém-me com um espírito voluntário.' },
    ],
  },
  {
    ref: 'Salmo 103:8-14',
    theme: 'perdao',
    verses: [
      { n: 8, text: 'Misericordioso e piedoso é o SENHOR; longânimo e grande em benignidade.' },
      { n: 9, text: 'Não repreenderá perpetuamente, nem para sempre reterá a sua ira.' },
      { n: 10, text: 'Não nos tratou segundo os nossos pecados, nem nos recompensou segundo as nossas iniquidades.' },
      { n: 12, text: 'Assim como está longe o oriente do ocidente, assim afasta de nós as nossas transgressões.' },
      { n: 13, text: 'Assim como um pai se compadece de seus filhos, assim o SENHOR se compadece daqueles que o temem.' },
      { n: 14, text: 'Pois ele conhece a nossa estrutura; lembra-se de que somos pó.' },
    ],
  },
  {
    ref: 'Salmo 130:1-5',
    theme: 'perdao',
    verses: [
      { n: 1, text: 'Das profundezas a ti clamo, ó SENHOR.' },
      { n: 2, text: 'Senhor, escuta a minha voz; sejam os teus ouvidos atentos à voz das minhas súplicas.' },
      { n: 3, text: 'Se tu, SENHOR, observares as iniquidades, Senhor, quem subsistirá?' },
      { n: 4, text: 'Mas contigo está o perdão, para que sejas temido.' },
      { n: 5, text: 'Aguardo ao SENHOR; a minha alma o aguarda, e espero na sua palavra.' },
    ],
  },
  {
    ref: 'Lamentações 3:22-26',
    theme: 'perdao',
    verses: [
      { n: 22, text: 'As misericórdias do SENHOR são a causa de não sermos consumidos; porque as suas misericórdias não têm fim.' },
      { n: 23, text: 'Novas são cada manhã; grande é a tua fidelidade.' },
      { n: 24, text: 'A minha porção é o SENHOR, diz a minha alma; portanto esperarei nele.' },
      { n: 25, text: 'Bom é o SENHOR para os que se atêm a ele, para a alma que o busca.' },
      { n: 26, text: 'Bom é ter esperança, e esperar quietamente pela salvação do SENHOR.' },
    ],
  },
  {
    ref: 'Provérbios 24:16',
    theme: 'perdao',
    verses: [
      { n: 16, text: 'Porque sete vezes cairá o justo, e se levantará; mas os ímpios tropeçarão no mal.' },
    ],
  },
  {
    ref: '1 João 1:9',
    theme: 'perdao',
    verses: [
      { n: 9, text: 'Se confessarmos os nossos pecados, ele é fiel e justo para nos perdoar os pecados, e nos purificar de toda a injustiça.' },
    ],
  },
  {
    ref: 'Romanos 8:1-2',
    theme: 'perdao',
    verses: [
      { n: 1, text: 'Portanto, agora nenhuma condenação há para os que estão em Cristo Jesus, que não andam segundo a carne, mas segundo o espírito.' },
      { n: 2, text: 'Porque a lei do Espírito de vida, em Cristo Jesus, me livrou da lei do pecado e da morte.' },
    ],
  },

  // ---------------------------------------------------------------- pureza --
  {
    ref: 'Salmo 119:9-11',
    theme: 'pureza',
    verses: [
      { n: 9, text: 'Com que purificará o jovem o seu caminho? Observando-o conforme a tua palavra.' },
      { n: 10, text: 'Com todo o meu coração te busquei; não me deixes desviar dos teus mandamentos.' },
      { n: 11, text: 'Escondi a tua palavra no meu coração, para eu não pecar contra ti.' },
    ],
  },
  {
    ref: 'Provérbios 4:23-27',
    theme: 'pureza',
    verses: [
      { n: 23, text: 'Sobre tudo o que se deve guardar, guarda o teu coração, porque dele procedem as saídas da vida.' },
      { n: 25, text: 'Os teus olhos olhem direitos, e as tuas pálpebras olhem diretamente diante de ti.' },
      { n: 26, text: 'Pondera a vereda de teus pés, e todos os teus caminhos sejam bem ordenados.' },
      { n: 27, text: 'Não declines nem para a direita nem para a esquerda; retira o teu pé do mal.' },
    ],
  },
  {
    ref: 'Mateus 5:8',
    theme: 'pureza',
    verses: [{ n: 8, text: 'Bem-aventurados os limpos de coração, porque eles verão a Deus.' }],
  },
  {
    ref: 'Mateus 5:27-29',
    theme: 'pureza',
    verses: [
      { n: 27, text: 'Ouvistes que foi dito aos antigos: Não cometerás adultério.' },
      { n: 28, text: 'Eu, porém, vos digo, que qualquer que atentar numa mulher para a cobiçar, já em seu coração cometeu adultério com ela.' },
      { n: 29, text: 'Portanto, se o teu olho direito te escandalizar, arranca-o e atira-o para longe de ti.' },
    ],
  },
  {
    ref: '1 Coríntios 6:18-20',
    theme: 'pureza',
    verses: [
      { n: 18, text: 'Fugi da prostituição. Todo o pecado que o homem comete é fora do corpo; mas o que se prostitui peca contra o seu próprio corpo.' },
      { n: 19, text: 'Ou não sabeis que o vosso corpo é o templo do Espírito Santo, que habita em vós, proveniente de Deus, e que não sois de vós mesmos?' },
      { n: 20, text: 'Porque fostes comprados por bom preço; glorificai, pois, a Deus no vosso corpo, e no vosso espírito, os quais pertencem a Deus.' },
    ],
  },
  {
    ref: 'Romanos 6:12-14',
    theme: 'pureza',
    verses: [
      { n: 12, text: 'Não reine, portanto, o pecado em vosso corpo mortal, para lhe obedecerdes em suas concupiscências.' },
      { n: 13, text: 'Nem tampouco apresenteis os vossos membros ao pecado por instrumentos de iniquidade; mas apresentai-vos a Deus, como vivos dentre mortos.' },
      { n: 14, text: 'Porque o pecado não terá domínio sobre vós, pois não estais debaixo da lei, mas debaixo da graça.' },
    ],
  },
  {
    ref: 'Romanos 12:1-2',
    theme: 'pureza',
    verses: [
      { n: 1, text: 'Rogo-vos, pois, irmãos, pela compaixão de Deus, que apresenteis os vossos corpos em sacrifício vivo, santo e agradável a Deus, que é o vosso culto racional.' },
      { n: 2, text: 'E não vos conformeis com este mundo, mas transformai-vos pela renovação do vosso entendimento, para que experimenteis qual seja a boa, agradável e perfeita vontade de Deus.' },
    ],
  },
  {
    ref: 'Colossenses 3:2-5',
    theme: 'pureza',
    verses: [
      { n: 2, text: 'Pensai nas coisas que são de cima, e não nas que são da terra.' },
      { n: 3, text: 'Porque já estais mortos, e a vossa vida está escondida com Cristo em Deus.' },
      { n: 5, text: 'Mortificai, pois, os vossos membros, que estão sobre a terra: a prostituição, a impureza, o apetite desordenado, a vil concupiscência, e a avareza, que é idolatria.' },
    ],
  },
  {
    ref: '1 Tessalonicenses 4:3-5',
    theme: 'pureza',
    verses: [
      { n: 3, text: 'Porque esta é a vontade de Deus, a vossa santificação: que vos abstenhais da prostituição.' },
      { n: 4, text: 'Que cada um de vós saiba possuir o seu vaso em santificação e honra.' },
      { n: 5, text: 'Não na paixão da concupiscência, como os gentios, que não conhecem a Deus.' },
    ],
  },
  {
    ref: 'Tiago 1:12-15',
    theme: 'pureza',
    verses: [
      { n: 12, text: 'Bem-aventurado o varão que sofre a tentação; porque, quando for provado, receberá a coroa da vida, a qual o Senhor tem prometido aos que o amam.' },
      { n: 14, text: 'Mas cada um é tentado, quando atraído e engodado pela sua própria concupiscência.' },
      { n: 15, text: 'Depois, havendo a concupiscência concebido, dá à luz o pecado; e o pecado, sendo consumado, gera a morte.' },
    ],
  },
  {
    ref: '1 João 2:15-17',
    theme: 'pureza',
    verses: [
      { n: 15, text: 'Não ameis o mundo, nem o que no mundo há. Se alguém ama o mundo, o amor do Pai não está nele.' },
      { n: 16, text: 'Porque tudo o que há no mundo, a concupiscência da carne, a concupiscência dos olhos e a soberba da vida, não é do Pai, mas do mundo.' },
      { n: 17, text: 'E o mundo passa, e a sua concupiscência; mas aquele que faz a vontade de Deus permanece para sempre.' },
    ],
  },
  {
    ref: 'Gálatas 5:22-24',
    theme: 'pureza',
    verses: [
      { n: 22, text: 'Mas o fruto do Espírito é: amor, gozo, paz, longanimidade, benignidade, bondade, fé, mansidão, temperança.' },
      { n: 23, text: 'Contra estas coisas não há lei.' },
      { n: 24, text: 'E os que são de Cristo crucificaram a carne com as suas paixões e concupiscências.' },
    ],
  },

  // ------------------------------------------------------------- ansiedade --
  {
    ref: 'Filipenses 4:6-8',
    theme: 'ansiedade',
    verses: [
      { n: 6, text: 'Não estejais inquietos por coisa alguma; antes as vossas petições sejam em tudo conhecidas diante de Deus, pela oração e súplicas, com ação de graças.' },
      { n: 7, text: 'E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos sentimentos em Cristo Jesus.' },
      { n: 8, text: 'Quanto ao mais, irmãos, tudo o que é verdadeiro, tudo o que é honesto, tudo o que é justo, tudo o que é puro, tudo o que é amável, tudo o que é de boa fama, nisso pensai.' },
    ],
  },
  {
    ref: '1 Pedro 5:6-10',
    theme: 'ansiedade',
    verses: [
      { n: 6, text: 'Humilhai-vos, pois, debaixo da potente mão de Deus, para que a seu tempo vos exalte.' },
      { n: 7, text: 'Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.' },
      { n: 8, text: 'Sede sóbrios; vigiai; porque o diabo, vosso adversário, anda em derredor, bramando como leão, buscando a quem possa tragar.' },
      { n: 9, text: 'Ao qual resisti firmes na fé, sabendo que as mesmas aflições se cumprem entre os vossos irmãos no mundo.' },
      { n: 10, text: 'E o Deus de toda a graça, depois de haverdes padecido um pouco, ele mesmo vos aperfeiçoará, confirmará, fortificará e fortalecerá.' },
    ],
  },
  {
    ref: 'Salmo 46:1-3',
    theme: 'ansiedade',
    verses: [
      { n: 1, text: 'Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.' },
      { n: 2, text: 'Portanto não temeremos, ainda que a terra se mude, e ainda que os montes se transportem para o meio dos mares.' },
      { n: 3, text: 'Ainda que as águas rujam e se perturbem, ainda que os montes se abalem pela sua braveza.' },
    ],
  },
  {
    ref: 'Salmo 55:22',
    theme: 'ansiedade',
    verses: [
      { n: 22, text: 'Lança o teu cuidado sobre o SENHOR, e ele te susterá; nunca permitirá que o justo seja abalado.' },
    ],
  },
  {
    ref: 'Salmo 94:18-19',
    theme: 'ansiedade',
    verses: [
      { n: 18, text: 'Se eu disse: O meu pé vacila; a tua benignidade, SENHOR, me susteve.' },
      { n: 19, text: 'Na multidão dos meus pensamentos dentro de mim, as tuas consolações recrearam a minha alma.' },
    ],
  },
  {
    ref: 'Salmo 121:1-4',
    theme: 'ansiedade',
    verses: [
      { n: 1, text: 'Elevo os meus olhos para os montes, de onde vem o meu socorro.' },
      { n: 2, text: 'O meu socorro vem do SENHOR que fez o céu e a terra.' },
      { n: 3, text: 'Não deixará vacilar o teu pé; aquele que te guarda não tosquenejará.' },
      { n: 4, text: 'Eis que não tosquenejará nem dormirá o guarda de Israel.' },
    ],
  },
  {
    ref: 'Mateus 11:28-30',
    theme: 'ansiedade',
    verses: [
      { n: 28, text: 'Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.' },
      { n: 29, text: 'Tomai sobre vós o meu jugo, e aprendei de mim, que sou manso e humilde de coração; e encontrareis descanso para as vossas almas.' },
      { n: 30, text: 'Porque o meu jugo é suave e o meu fardo é leve.' },
    ],
  },

  // ----------------------------------------------------------------- força --
  {
    ref: 'Isaías 40:29-31',
    theme: 'forca',
    verses: [
      { n: 29, text: 'Dá vigor ao cansado, e multiplica as forças ao que não tem nenhum vigor.' },
      { n: 30, text: 'Os jovens se cansarão e se fatigarão, e os mancebos certamente cairão.' },
      { n: 31, text: 'Mas os que esperam no SENHOR renovarão as suas forças, subirão com asas como águias; correrão, e não se cansarão; caminharão, e não se fatigarão.' },
    ],
  },
  {
    ref: 'Isaías 41:10',
    theme: 'forca',
    verses: [
      { n: 10, text: 'Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.' },
    ],
  },
  {
    ref: 'Salmo 34:17-19',
    theme: 'forca',
    verses: [
      { n: 17, text: 'Os justos clamam, e o SENHOR os ouve, e os livra de todas as suas angústias.' },
      { n: 18, text: 'Perto está o SENHOR dos que têm o coração quebrantado, e salva os contritos de espírito.' },
      { n: 19, text: 'Muitas são as aflições do justo, mas o SENHOR o livra de todas.' },
    ],
  },
  {
    ref: 'Salmo 40:1-3',
    theme: 'forca',
    verses: [
      { n: 1, text: 'Esperei com paciência no SENHOR, e ele se inclinou para mim, e ouviu o meu clamor.' },
      { n: 2, text: 'Tirou-me dum lago horrível, dum charco de lodo; pôs os meus pés sobre uma rocha, firmou os meus passos.' },
      { n: 3, text: 'E pôs um novo cântico na minha boca, um hino ao nosso Deus; muitos o verão, e temerão, e confiarão no SENHOR.' },
    ],
  },
  {
    ref: 'Salmo 42:11',
    theme: 'forca',
    verses: [
      { n: 11, text: 'Por que estás abatida, ó minha alma, e por que te perturbas dentro de mim? Espera em Deus, pois ainda o louvarei; ele é a salvação da minha face, e o meu Deus.' },
    ],
  },
  {
    ref: 'Salmo 73:26',
    theme: 'forca',
    verses: [
      { n: 26, text: 'A minha carne e o meu coração desfalecem; mas Deus é a fortaleza do meu coração, e a minha porção para sempre.' },
    ],
  },
  {
    ref: 'Salmo 143:7-8',
    theme: 'forca',
    verses: [
      { n: 7, text: 'Ouve-me depressa, ó SENHOR; o meu espírito desfalece; não escondas de mim a tua face.' },
      { n: 8, text: 'Faze-me ouvir a tua benignidade pela manhã, pois em ti confio; faze-me saber o caminho que devo seguir, porque a ti levanto a minha alma.' },
    ],
  },
  {
    ref: '2 Coríntios 12:9-10',
    theme: 'forca',
    verses: [
      { n: 9, text: 'E disse-me: A minha graça te basta, porque o meu poder se aperfeiçoa na fraqueza.' },
      { n: 10, text: 'Por isso sinto prazer nas fraquezas, nas angústias por amor de Cristo. Porque quando estou fraco então sou forte.' },
    ],
  },
  {
    ref: '2 Timóteo 1:7',
    theme: 'forca',
    verses: [
      { n: 7, text: 'Porque Deus não nos deu o espírito de temor, mas de fortaleza, e de amor, e de moderação.' },
    ],
  },
  {
    ref: 'Hebreus 12:1-2',
    theme: 'forca',
    verses: [
      { n: 1, text: 'Deixemos todo o embaraço, e o pecado que tão de perto nos rodeia, e corramos com paciência a carreira que nos está proposta.' },
      { n: 2, text: 'Olhando para Jesus, autor e consumador da fé.' },
    ],
  },

  // ------------------------------------------------------------------ luta --
  {
    ref: '1 Coríntios 10:13',
    theme: 'luta',
    verses: [
      { n: 13, text: 'Não veio sobre vós tentação, senão humana; mas fiel é Deus, que vos não deixará tentar acima do que podeis, antes com a tentação dará também o escape, para que a possais suportar.' },
    ],
  },
  {
    ref: 'Romanos 7:18-25',
    theme: 'luta',
    verses: [
      { n: 18, text: 'Porque eu sei que em mim, isto é, na minha carne, não habita bem algum; e com efeito o querer está em mim, mas não consigo realizar o bem.' },
      { n: 19, text: 'Porque não faço o bem que quero, mas o mal que não quero, esse faço.' },
      { n: 24, text: 'Miserável homem que eu sou! Quem me livrará do corpo desta morte?' },
      { n: 25, text: 'Dou graças a Deus por Jesus Cristo nosso Senhor.' },
    ],
  },
  {
    ref: 'Gálatas 5:16-17',
    theme: 'luta',
    verses: [
      { n: 16, text: 'Digo, porém: Andai em Espírito, e não cumprireis a concupiscência da carne.' },
      { n: 17, text: 'Porque a carne cobiça contra o Espírito, e o Espírito contra a carne; e estes opõem-se um ao outro, para que não façais o que quereis.' },
    ],
  },
  {
    ref: 'Efésios 6:10-13',
    theme: 'luta',
    verses: [
      { n: 10, text: 'No demais, irmãos meus, fortalecei-vos no Senhor e na força do seu poder.' },
      { n: 11, text: 'Revesti-vos de toda a armadura de Deus, para que possais estar firmes contra as astutas ciladas do diabo.' },
      { n: 12, text: 'Porque não temos que lutar contra a carne e o sangue, mas, sim, contra as hostes espirituais da maldade, nos lugares celestiais.' },
      { n: 13, text: 'Portanto, tomai toda a armadura de Deus, para que possais resistir no dia mau e, havendo feito tudo, ficar firmes.' },
    ],
  },
  {
    ref: 'Tiago 4:7-8',
    theme: 'luta',
    verses: [
      { n: 7, text: 'Sujeitai-vos, pois, a Deus, resisti ao diabo, e ele fugirá de vós.' },
      { n: 8, text: 'Chegai-vos a Deus, e ele se chegará a vós. Alimpai as mãos, pecadores; e, vós de duplo ânimo, purificai os corações.' },
    ],
  },
  {
    ref: 'Hebreus 4:15-16',
    theme: 'luta',
    verses: [
      { n: 15, text: 'Porque não temos um sumo sacerdote que não possa compadecer-se das nossas fraquezas; porém, um que, como nós, em tudo foi tentado, mas sem pecado.' },
      { n: 16, text: 'Cheguemos, pois, com confiança ao trono da graça, para que possamos alcançar misericórdia e achar graça, a fim de sermos ajudados em tempo oportuno.' },
    ],
  },
  {
    ref: 'Salmo 139:23-24',
    theme: 'luta',
    verses: [
      { n: 23, text: 'Sonda-me, ó Deus, e conhece o meu coração; prova-me, e conhece os meus pensamentos.' },
      { n: 24, text: 'E vê se há em mim algum caminho mau, e guia-me pelo caminho eterno.' },
    ],
  },
] as const
