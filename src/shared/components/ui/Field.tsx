import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { useId } from 'react'
import { cn } from '@/shared/lib/utils'

interface FieldShellProps {
  label?: string
  hint?: string
  error?: string
  children: (id: string) => ReactNode
  className?: string
}

function FieldShell({ label, hint, error, children, className }: FieldShellProps) {
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
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
  wrapperClassName?: string
}

export function Input({ label, hint, error, suffix, wrapperClassName, className, ...props }: InputProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={wrapperClassName}>
      {(id) => (
        <div className="relative">
          <input
            id={id}
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
      )}
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
