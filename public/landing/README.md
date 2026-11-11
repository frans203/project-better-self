# Videos da landing

Midia dos arquetipos e do hero, usada pelo `LoopVideo` (`src/features/landing/components/LoopVideo.tsx`).

**Daqui pra frente, use o script** (e a skill `convert-media`, que chama ele):

```bash
node scripts/convert-media.mjs <entrada> <nome> [--crop=w:h:x:y]
```

Video vira `<nome>-1280.webm` + `<nome>-720.webm` + `<nome>-poster.webp`; imagem vira `<nome>.webp`.
Os comandos abaixo sao o que o script roda (os primeiros videos tambem ganharam um mp4 de fallback):

```bash
SRC=original.mp4
NAME=operador

# principal: webm VP9, 1280px, 24 fps, sem audio
ffmpeg -y -i "$SRC" -an -vf "scale=1280:-2,fps=24" -c:v libvpx-vp9 -crf 40 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 $NAME-1280.webm
# celular: 720px (entra via <source media="(max-width: 768px)">)
ffmpeg -y -i "$SRC" -an -vf "scale=720:-2,fps=24" -c:v libvpx-vp9 -crf 42 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 $NAME-720.webm
# fallback para Safari antigo
ffmpeg -y -i "$SRC" -an -vf "scale=1280:-2,fps=24" -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart $NAME-1280.mp4
# poster (primeiro quadro): aparece antes do play e com prefers-reduced-motion
ffmpeg -y -i "$SRC" -frames:v 1 -vf "scale=1280:-2" -c:v libwebp -quality 72 $NAME-poster.webp
```

Meta de peso: ate ~1,5 MB no webm de 1280px. Se passar, suba o `-crf` ou corte o loop
(`-t 8`). Confira se o primeiro quadro nao e preto antes de usar como poster.

| Arquivo | Origem | Observacao |
|---|---|---|
| `operador-*` | wallpaper animado do Leon (21,7 s, 1920x1080) | **Prototipo.** Arte oficial: trocar por fan art antes do lancamento (SAAS_PLAN §0) |
| `espartano-*` | wallpaper animado do Kratos (21,7 s, 1920x1080) | **Prototipo.** Arte oficial: trocar por fan art antes do lancamento (SAAS_PLAN §0) |
| `sobrevivente.webp` | imagem estatica do Joel (PNG 1920x1080, 2,2 MB) | **Prototipo.** Cortada em 4:3 sem o logo do jogo: `crop=1392:1044:264:18,scale=1280:-2`, webp q74. Arte oficial: trocar antes do lancamento |
| `cacador.webp` | imagem estatica do Dante (JPG 1680x1050, 212 KB) | **Prototipo.** `--crop=1333:1000:334:0` tira o rodape com titulo/Capcom/GameWallpapers.com. 85 KB |
| `herdeiro.webp` | imagem estatica do Nero (JPG 1920x1200, 1 MB) | **Prototipo.** `--crop=1600:1200:240:0`. 71 KB |
| `escada-*` | gameplay em primeira pessoa (MP4 1920x1080, 12,3 s, 15,4 MB) | **Prototipo.** Fundo da secao da escada. Sem corte (sem logo). webm 906 KB / 414 KB, poster 17 KB |
