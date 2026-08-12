import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { Button, Input, Panel } from '@/shared/components/ui'
import { supabase } from '@/shared/lib/supabase'
import { useAuthStore } from '@/shared/store/auth-store'

/**
 * O supabase-js devolve a mensagem em ingles e sem codigo estavel para os
 * casos comuns — a traducao e por texto mesmo, com fallback pro original.
 */
function translateError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'Email ou senha incorretos.'
  if (m.includes('email not confirmed')) {
    return 'Conta ainda nao confirmada. Confirme em Authentication > Users no Supabase.'
  }
  if (m.includes('too many requests') || m.includes('rate limit')) {
    return 'Tentativas demais. Espere alguns minutos.'
  }
  if (m.includes('failed to fetch') || m.includes('network')) {
    return 'Sem conexao com o servidor.'
  }
  return message
}

export function LoginPage() {
  const ready = useAuthStore((s) => s.ready)
  const session = useAuthStore((s) => s.session)
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  // Ja logado: nao faz sentido mostrar o formulario. Cobre tanto o acesso
  // direto a /login quanto o instante seguinte ao signIn — o onAuthStateChange
  // preenche o store e este redirect dispara sozinho, sem navigate() na mao.
  if (ready && session) return <Navigate to={from} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      setError(translateError(signInError.message))
      setPassword('')
      setSubmitting(false)
    }
    // No sucesso nao mexemos em estado: o componente desmonta no redirect
    // acima, e um setState depois disso seria update em componente morto.
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm boot-up">
        <header className="mb-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted">
            Operation: Better Self
          </p>
          <h1 className="mt-2 font-display text-xl tracking-wide text-white">
            Acesso restrito
          </h1>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-text-secondary">
            Terminal de operador
          </p>
        </header>

        <Panel className="p-5">
          <form onSubmit={submit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              autoFocus
              required
              disabled={submitting}
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={submitting}
            />

            {error && (
              <p role="alert" className="border-l border-fail/40 pl-3 text-[11px] text-fail">
                {error}
              </p>
            )}

            <Button type="submit" variant="solid" size="md" block disabled={submitting}>
              <LogIn />
              {submitting ? 'Verificando' : 'Entrar'}
            </Button>
          </form>
        </Panel>

        <p className="mt-4 text-center text-[10px] leading-relaxed text-text-muted">
          Cadastro fechado. A conta e criada no painel do Supabase.
        </p>
      </div>
    </div>
  )
}
