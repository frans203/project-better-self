import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Dumbbell, ShieldCheck } from 'lucide-react'
import { GlitchLogo, Panel, StatCard, buttonVariants } from '@/shared/components/ui'
import { ARCHETYPES, type ArchetypeMedia } from '@/shared/constants/archetypes'
import { RANK_KEYS, RANK_LABEL } from '@/shared/lib/rank'
import { cn } from '@/shared/lib/utils'
import { FAQ, PLANS, PRICING } from '../content'
import { LandingArchetypes } from './LandingArchetypes'
import { LandingDemo } from './LandingDemo'
import { LandingRanks } from './LandingRanks'
import { LoopVideo } from './LoopVideo'
import { Reveal } from './Reveal'

/**
 * Para onde vai o CTA. Ainda nao existe cadastro publico (F3): ate la, o
 * botao leva para o login. Quando o signup existir, trocar so aqui.
 */
const CTA_HREF = '/login'

const BOOT = [
  '> operation: better self ........ ONLINE',
  '> motor de rank ................. OK',
  '> operador ...................... NÃO IDENTIFICADO',
]

/**
 * Landing publica (SAAS_PLAN.md §9).
 *
 * Fica fora do AppLayout e nao toca no Supabase: nenhuma query, nenhum
 * getUserId(). Tudo o que parece dado e ficticio e esta em LandingDemo.
 *
 * Sem wallpaper: a arte atual e oficial (Leon, RE4) e o guardrail do §0 proibe
 * arte oficial no produto pago. O fundo e grade + CRT em CSS ate a fan art (F2).
 */
export function LandingPage() {
  useEffect(() => {
    const prev = document.title
    document.title = 'OPERATION: BETTER SELF — o nerd forte não nasce. É treinado.'
    return () => {
      document.title = prev
    }
  }, [])

  return (
    <div className="landing">
      <div className="landing-grid" aria-hidden />
      <div className="landing-crt" aria-hidden />

      <TopBar />

      <Hero />

      <main className="mx-auto w-full max-w-5xl px-4">
        {/* 01 — texto sobe; os tres cartoes sobem um depois do outro. */}
        <Section id="diagnostico" index="01" label="Diagnóstico">
          <Reveal as="h2" className="landing-h2">
            Isso não é mais um app de academia.
          </Reveal>
          <Reveal
            stagger
            step={140}
            delay={150}
            className="mt-5 grid max-w-2xl gap-4 text-[14px] leading-relaxed text-text-secondary"
          >
            <p>
              Você sabe a rota exata, o grind necessário e a build ótima do seu personagem. Seu
              próprio treino está num bloco de notas, a leitura parou na página 40 e a disciplina
              depende do humor do dia.
            </p>
            <p className="text-text-primary">
              Aqui o personagem é você. O rank sobe com o que você registra e cai quando você para.
            </p>
          </Reveal>
          <Reveal stagger step={160} threshold={0.3} className="mt-8 grid gap-3 sm:grid-cols-3">
            <StatCard
              icon={Dumbbell}
              label="Força"
              value="e1RM"
              hint="Carga, volume e recorde pessoal calculados a cada série."
            />
            <StatCard
              icon={ShieldCheck}
              label="Disciplina"
              value="8"
              unit="métricas"
              hint="Contenção, leitura, meditação, corrida e treino no mesmo painel."
            />
            <StatCard
              icon={Activity}
              label="Rank"
              value="9"
              unit="níveis"
              hint="Sobe com consistência. Cai com recaída ou abandono."
            />
          </Reveal>
        </Section>

        {/* 02 — as nove insignias acendem uma a uma (LandingRanks). */}
        <Section id="escada" index="02" label="A escada" backdrop={LADDER_MEDIA}>
          <Reveal as="h2" className="landing-h2">
            Todo mundo começa no LIXO.
          </Reveal>
          <Reveal as="p" delay={120} className="landing-lead">
            Nove níveis. Cada um exige mais em todas as oito métricas ao mesmo tempo. Seu nível não
            é comprado: é conquistado, e pode ser perdido.
          </Reveal>
          <Reveal
            as="p"
            variant="type"
            delay={300}
            className="mt-2 text-[11px] uppercase tracking-[0.15em] text-text-muted"
          >
            {RANK_KEYS.map((k) => RANK_LABEL[k]).join(' · ')}
          </Reveal>
          <div className="mt-8">
            <LandingRanks />
          </div>
          <Reveal
            as="ul"
            stagger
            step={140}
            className="mt-6 grid gap-2 text-[12px] text-text-secondary sm:grid-cols-3"
          >
            <Rule>
              Os requisitos olham os últimos 7 e 15 dias. Parou, a janela anda e o nível desce.
            </Rule>
            <Rule>Recaída derruba um nível. Duas em 15 dias derrubam dois.</Rule>
            <Rule>Um dia sem registro, sozinho, não é falha e não derruba nada.</Rule>
          </Reveal>
        </Section>

        {/* 03 — cada classe entra do lado onde esta a arte (LandingArchetypes). */}
        <Section id="arquetipos" index="03" label="Arquétipos">
          <Reveal as="h2" className="landing-h2">
            Todo jogador escolhe uma classe.
          </Reveal>
          <Reveal as="p" delay={120} className="landing-lead">
            Cada arquétipo traz um protocolo de treino e uma régua de rank própria. Você escolhe um
            no cadastro.
          </Reveal>
          <div className="mt-8">
            <LandingArchetypes />
          </div>
        </Section>

        {/* 04 — numeros correm, linha se desenha, heatmap em onda (LandingDemo). */}
        <Section id="painel" index="04" label="Painel">
          <Reveal as="h2" className="landing-h2">
            Sem confete falso. Só o registro.
          </Reveal>
          <Reveal as="p" delay={120} className="landing-lead">
            É isso que você vê depois do treino. Dados de exemplo, calculados pelo mesmo motor de
            rank do app.
          </Reveal>
          <div className="mt-8">
            <LandingDemo />
          </div>
        </Section>

        {/* 05 — texto entra da esquerda, protocolo da direita, linha por linha. */}
        <Section id="contencao" index="05" label="Contenção">
          <div className="grid gap-8 md:grid-cols-2">
            <Reveal variant="left">
              <h2 className="landing-h2">Sem moralismo. Sem tabu.</h2>
              <p className="landing-lead">
                Um contador de dias limpos. Recaída se registra, com o gatilho se você quiser. O
                contador volta para zero, o nível sofre o ajuste e a operação continua.
              </p>
            </Reveal>
            <Reveal variant="right" delay={150}>
              <Panel className="p-4">
                <Reveal
                  as="ul"
                  stagger
                  variant="type"
                  step={260}
                  delay={450}
                  className="grid gap-3 text-[12px] text-text-secondary"
                >
                  <Rule>Módulo opcional. Desligado, ele não aparece em lugar nenhum.</Rule>
                  <Rule>Dado sensível pela LGPD: só a sua conta enxerga.</Rule>
                  <Rule>Export completo e exclusão de verdade, a qualquer hora.</Rule>
                </Reveal>
              </Panel>
            </Reveal>
          </div>
        </Section>

        {/* 06 — titulo sai do desfoque; cada negacao acende como tubo de CRT. */}
        <Section id="honestidade" index="06" label="O que este app não faz">
          <Reveal as="h2" variant="focus" className="landing-h2">
            Um app que mente pra te motivar não te respeita.
          </Reveal>
          <Reveal
            as="ul"
            stagger
            variant="flicker"
            step={220}
            delay={250}
            className="mt-8 grid gap-px border border-border-default bg-border-default sm:grid-cols-2"
          >
            {[
              'Não faz o agachamento por você.',
              'Não manda mensagem fofa quando você some.',
              'Não esconde a queda de rank para você se sentir bem.',
              'Não inventa autor para frase motivacional.',
            ].map((t) => (
              <li key={t} className="bg-bg-surface px-4 py-4 text-[13px] text-text-primary">
                <span className="mr-2 text-text-muted">×</span>
                {t}
              </li>
            ))}
          </Reveal>
        </Section>

        {/* 07 — planos crescem em sequencia; o anual em destaque e o ultimo. */}
        <Section id="planos" index="07" label="Planos">
          <Reveal as="h2" className="landing-h2">
            Registrar nunca trava.
          </Reveal>
          <Reveal as="p" delay={120} className="landing-lead">
            O plano grátis é para sempre. O pago abre o histórico completo e todos os arquétipos,
            com preço de fundador: quem entra agora nunca paga mais.
          </Reveal>
          <Reveal
            stagger
            variant="scale"
            step={180}
            threshold={0.15}
            className="mt-8 grid gap-3 md:grid-cols-3"
          >
            {PLANS.map((p) => (
              <article
                key={p.id}
                className={cn(
                  'flex flex-col p-5',
                  p.featured
                    ? 'animated-border-slow'
                    : 'border border-border-default bg-bg-surface',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[11px] uppercase tracking-[0.25em] text-text-secondary">
                    {p.label}
                  </h3>
                  {p.featured && (
                    <span className="border border-white px-2 py-0.5 text-[9px] uppercase tracking-[0.15em] text-white">
                      Melhor escolha
                    </span>
                  )}
                </div>
                <p className="mt-4 font-display text-4xl leading-none text-white">{p.price}</p>
                <p className="mt-1 text-[11px] text-text-muted">{p.period}</p>
                <p className="mt-3 text-[12px] text-text-secondary">{p.note}</p>
                <ul className="mt-5 grid gap-2 border-t border-border-default pt-4 text-[12px] text-text-primary">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <span className="text-text-muted">›</span>
                      {it}
                    </li>
                  ))}
                </ul>
                <Link
                  to={CTA_HREF}
                  className={cn(
                    buttonVariants({ variant: p.featured ? 'solid' : 'outline', block: true }),
                    'mt-6',
                  )}
                >
                  {p.cta}
                </Link>
              </article>
            ))}
          </Reveal>
          <Reveal as="p" delay={600} className="mt-4 text-[11px] text-text-muted">
            Anual sai por {PRICING.yearlyPerMonth}/mês contra {PRICING.monthly} no mensal. Pagamento
            no PIX.
          </Reveal>
        </Section>

        {/* 08 — perguntas deslizam da esquerda em cascata rapida. */}
        <Section id="faq" index="08" label="Perguntas">
          <Reveal as="h2" className="landing-h2">
            Sem juridiquês.
          </Reveal>
          <Reveal
            stagger
            variant="left"
            step={70}
            threshold={0.1}
            className="mt-8 border-t border-border-default"
          >
            {FAQ.map((f) => (
              <details key={f.q} className="landing-faq group border-b border-border-default">
                <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 text-[14px] text-text-primary">
                  {f.q}
                  <span className="text-text-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pb-5 text-[13px] leading-relaxed text-text-secondary">{f.a}</p>
              </details>
            ))}
          </Reveal>
        </Section>

        {/* Final — a frase entra em foco, depois o botao. */}
        <section className="py-24 text-center">
          <Reveal
            as="h2"
            variant="focus"
            threshold={0.5}
            className="font-display text-4xl leading-tight text-white sm:text-6xl"
          >
            A operação começa hoje.
          </Reveal>
          <Reveal stagger step={160} delay={500} threshold={0.5}>
            <p className="mt-4 text-[13px] text-text-secondary">
              Grátis. Sem cartão. Começa no LIXO.
            </p>
            <div>
              <Link
                to={CTA_HREF}
                className={cn(buttonVariants({ variant: 'solid', size: 'lg' }), 'mt-8')}
              >
                [ ALISTAR-SE ]
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border-default">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-[10px] uppercase tracking-[0.18em] text-text-muted">
          <span>Operation: Better Self</span>
          <span>Feito no Brasil · {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}

function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border-default bg-bg-base/85 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <a
          href="#"
          className="flex items-center gap-3"
          aria-label="Operation: Better Self, voltar ao topo"
        >
          <GlitchLogo text="OBS" className="text-xl text-white" />
          <span className="hidden text-[10px] uppercase tracking-[0.25em] text-text-secondary sm:inline">
            Operation: Better Self
          </span>
        </a>
        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-text-muted md:flex">
            <span className="status-dot dot-live" aria-hidden />
            Sistema operacional
          </span>
          <Link to="/login" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            [ Entrar ]
          </Link>
        </div>
      </div>
    </header>
  )
}

/**
 * Fundo do hero: o mesmo loop do OPERADOR. O veu e quase transparente para o
 * video aparecer; quem segura a leitura e o text-shadow do `.landing-hero` e o
 * escurecimento so na base (`--hero-veil` no index.css ajusta a forca).
 */
const HERO_MEDIA = ARCHETYPES.find((a) => a.codename === 'operador')?.media

function Hero() {
  return (
    <section className="landing-hero">
      {HERO_MEDIA && (
        <div className="landing-hero-bg" aria-hidden>
          <LoopVideo
            media={HERO_MEDIA}
            preload="metadata"
            decorative
            className="landing-hero-video"
          />
          <div className="landing-hero-veil" />
        </div>
      )}

      <div className="boot-up mx-auto flex w-full max-w-5xl flex-col px-4">
        {BOOT.map((line) => (
          <p key={line} className="text-[11px] text-text-secondary sm:text-[12px]">
            {line}
          </p>
        ))}

        <h1 className="landing-h1 mt-8">
          O nerd forte não nasce.
          <br />
          <span className="accent-text text-white">É treinado.</span>
        </h1>

        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-text-primary">
          Você já levou personagem ao nível máximo. Agora o personagem é você. Treino, corrida,
          leitura, meditação e contenção viram um rank que sobe e cai.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link to={CTA_HREF} className={buttonVariants({ variant: 'solid', size: 'lg' })}>
            [ Iniciar operação ]
          </Link>
          <a href="#escada" className={buttonVariants({ variant: 'ghost', size: 'lg' })}>
            Ver a escada
          </a>
        </div>
        <p className="mt-4 text-[11px] text-text-secondary">
          Grátis, sem cartão. 7 dias com tudo liberado.
          <span className="terminal-text ml-1" aria-hidden />
        </p>
      </div>
    </section>
  )
}

/**
 * Fundo da escada. PROTOTIPO: gameplay de jogo (sem logo), trocar antes do
 * lancamento (SAAS_PLAN §0). Ver public/landing/README.md.
 */
const LADDER_MEDIA: ArchetypeMedia = {
  video: '/landing/escada-1280.webm',
  videoMobile: '/landing/escada-720.webm',
  poster: '/landing/escada-poster.webp',
  alt: 'Operação noturna no convés de um navio, em loop.',
}

function Section({
  id,
  index,
  label,
  backdrop,
  children,
}: {
  id: string
  index: string
  label: string
  /** Video de fundo sangrando a largura toda da tela, com veu. */
  backdrop?: ArchetypeMedia
  children: ReactNode
}) {
  return (
    <section
      id={id}
      className={cn(
        'scroll-mt-20 border-t border-border-default py-20',
        backdrop && 'landing-section-backdrop',
      )}
    >
      {backdrop && (
        <div className="landing-section-bg" aria-hidden>
          <LoopVideo media={backdrop} decorative className="landing-hero-video" />
          <div className="landing-section-veil" />
        </div>
      )}
      {/* Rotulo "digitado" a cada secao: o sinal de que ha algo novo. */}
      <Reveal
        as="p"
        variant="type"
        threshold={0.6}
        className="mb-6 text-[10px] uppercase tracking-[0.25em] text-text-muted"
      >
        {index} // {label}
      </Reveal>
      {children}
    </section>
  )
}

function Rule({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2 leading-relaxed">
      <span className="text-white">›</span>
      <span>{children}</span>
    </li>
  )
}
