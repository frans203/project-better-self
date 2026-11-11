---
name: convert-media
description: Converte midia enviada pelo usuario (video ou imagem) para a landing com ffmpeg — video vira webm (1280 + 720) com poster webp, imagem vira webp — e registra no destino (arquetipo, hero, secao). Use sempre que o usuario mandar um arquivo de video/imagem (caminho, anexo ou print) dizendo onde ele entra, mesmo sem pedir conversao explicitamente.
---

# convert-media

Converte a midia com `scripts/convert-media.mjs` (ffmpeg) e liga o resultado na landing.
**Nunca converter na mao nem descrever pixels: quem converte e o ffmpeg.**

## 1. Descobrir entrada, nome e destino

- **Entrada:** o caminho que o usuario mandou. Imagem colada no chat vem com
  `[Image: source: C:\...]`: use esse caminho.
- **Destino:** onde a midia entra (ex.: "para o dante" = arquetipo `cacador`, "primeira
  secao" = hero). Mapa vitrine -> codinome em `src/shared/constants/archetypes.ts`
  (Leon/Chris = `operador`, Kratos = `espartano`, Joel = `sobrevivente`,
  Dante = `cacador`, Nero = `herdeiro`). Sem destino claro, pergunte.
- **Nome do arquivo:** sempre o **codinome**, nunca o nome do personagem (CLAUDE.md:
  nome de personagem nao vai para codigo nem arquivo). Segunda midia do mesmo
  arquetipo: `<codinome>-2`.

## 2. Olhar antes de converter (so imagem / primeiro quadro)

Abra a imagem com Read. Procure **logo do jogo, marca d'agua, texto de site
(GameWallpapers etc.), letterbox preto**. Se houver, monte um `--crop=w:h:x:y` em pixels
do original que:
- tire o logo/texto/faixa;
- feche em **4:3** (formato do card) centrado no rosto/foco da cena;
- caiba no original (`x + w <= largura`, `y + h <= altura`).

Para video, extraia um quadro para olhar:
`ffmpeg -v error -y -ss 1 -i <entrada> -frames:v 1 <scratchpad>/frame.png`.
Hero (fundo em tela cheia) nao precisa de 4:3: so corte se houver logo.

## 3. Converter

```bash
node scripts/convert-media.mjs "<entrada>" <nome> [--crop=w:h:x:y]
```

O script detecta o tipo pelo ffprobe:
- **video** -> `public/landing/<nome>-1280.webm`, `<nome>-720.webm`, `<nome>-poster.webp`
- **imagem** -> `public/landing/<nome>.webp` (ate 1280px)

Sem ffmpeg: `winget install --id Gyan.FFmpeg -e` (o script ja acha o alias do winget
mesmo fora do PATH).

## 4. Conferir a saida

- Abra o `.webp` gerado com Read: o logo saiu? o corte ficou no rosto?
- `firstFrameLuma` < 20 no JSON = poster quase preto. Em video, gere outro poster de um
  instante mais claro (`-ss 2`) com o mesmo `--crop`.
- Peso: webm 1280 ate ~1,5 MB; imagem ate ~150 KB. Passou: corte o loop (`-t 8` no
  original antes) ou suba o `-crf`/baixe `-quality` no script.

## 5. Registrar

- **Arquetipo:** `media` no item em `src/shared/constants/archetypes.ts`:
  - video: `{ video: '/landing/<nome>-1280.webm', videoMobile: '/landing/<nome>-720.webm', poster: '/landing/<nome>-poster.webp', alt }`
  - imagem: `{ poster: '/landing/<nome>.webp', alt }`
  - `alt` descreve a cena sem nome de personagem nem de jogo.
- **Hero:** o hero usa a `media` do `operador` (`HERO_MEDIA` em `LandingPage.tsx`).
  Para outra midia no hero, troque essa constante.
- **README:** uma linha na tabela de `public/landing/README.md` (arquivo, origem,
  `--crop` usado, peso).
- Se for arte oficial de jogo (nao fan art encomendada), marque como **PROTOTIPO** no
  comentario do `archetypes.ts` e no README (SAAS_PLAN §0). Nao precisa avisar o usuario
  de novo: ele ja assumiu o risco.

## 6. Validar e reportar

`npm run build`. Reporte em uma tabela curta: arquivo, peso antes -> depois, corte feito e
por que (ex.: "tirei o rodape com o titulo do jogo").
