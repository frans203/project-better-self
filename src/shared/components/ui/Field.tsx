import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { useId } from 'react'
import { cn } from '@/shared/lib/utils'

interface FieldShellProps {
  label?: string
  hint?: string
  error?: string
  children: (id: string) => ReactNode
  className?: string
  /** Floating: o rotulo vive dentro do campo, entao o shell nao desenha o de cima. */
  floating?: boolean
}

function FieldShell({ label, hint, error, children, className, floating }: FieldShellProps) {
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && !floating && (
        <label
          htmlFor={id}
          className="text-[10px] uppercase tracking-[0.18em] text-text-secondary"
        >
          {label}
        </label>
      )}
      {children(id)}
      {error ? (
        <span role="alert" className="text-[10px] text-fail">
          {error}
        </span>
      ) : (
        hint && <span className="text-[10px] text-text-muted">{hint}</span>
      )}
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  /** Sufixo fixo dentro do campo: km, min, pag. */
  suffix?: string
  /**
   * Rotulo dentro do campo, que sobe ao focar ou preencher.
   *
   * Use em campo denso (linha de serie, grade de metricas) onde o rotulo em
   * cima gastaria altura demais. NAO use com type="date": input de data nunca
   * satisfaz :placeholder-shown, entao o rotulo nasceria em cima do valor.
   */
  floating?: boolean
  wrapperClassName?: string
}

export function Input({
  label,
  hint,
  error,
  suffix,
  floating,
  wrapperClassName,
  className,
  placeholder,
  ...props
}: InputProps) {
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      className={wrapperClassName}
      floating={floating}
    >
      {(id) =>
        floating ? (
          /*
            Ordem do DOM importa: o CSS usa `input:focus + label`, entao o
            rotulo tem que ser o irmao imediatamente seguinte ao input.
            O placeholder de fallback e um espaco porque :placeholder-shown
            so casa quando existe placeholder — com string vazia o rotulo
            ficaria travado em cima para sempre.
          */
          <div className="field-float">
            <input
              id={id}
              placeholder={placeholder ?? ' '}
              className={cn('field-input', suffix && 'pr-12', error && 'border-fail', className)}
              aria-invalid={error ? true : undefined}
              {...props}
            />
            <label htmlFor={id} className="field-float-label">
              {label}
            </label>
            {suffix && <span className="field-float-suffix">{suffix}</span>}
          </div>
        ) : (
          <div className="relative">
            <input
              id={id}
              placeholder={placeholder}
              className={cn('field-input', suffix && 'pr-12', error && 'border-fail', className)}
              aria-invalid={error ? true : undefined}
              {...props}
            />
            {suffix && (
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] uppercase text-text-muted">
                {suffix}
              </span>
            )}
          </div>
        )
      }
    </FieldShell>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  wrapperClassName?: string
}

export function Textarea({ label, hint, error, wrapperClassName, className, ...props }: TextareaProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={wrapperClassName}>
      {(id) => (
        <textarea
          id={id}
          rows={3}
          className={cn('field-input resize-y', error && 'border-fail', className)}
          aria-invalid={error ? true : undefined}
          {...props}
        />
      )}
    </FieldShell>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  wrapperClassName?: string
  options: { value: string; label: string }[]
}

export function Select({
  label,
  hint,
  error,
  wrapperClassName,
  className,
  options,
  ...props
}: SelectProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={wrapperClassName}>
      {(id) => (
        <select id={id} className={cn('field-select w-full py-2.5', className)} {...props}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  )
}
