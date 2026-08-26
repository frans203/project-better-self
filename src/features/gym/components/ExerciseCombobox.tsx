import { useId, useMemo, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export interface ExerciseOption {
  id: string
  name: string
}

interface ExerciseComboboxProps {
  value: string
  onChange: (name: string) => void
  /** Ja vem ordenado por uso recente — a lista nao reordena sozinha. */
  options: ExerciseOption[]
  label?: string
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

/**
 * Sugestao de exercicio ja usado.
 *
 * Substitui o <datalist>, que era invisivel no mobile, nao abria sem digitar e
 * nao aceita estilo nenhum. Aqui a lista abre no foco com os exercicios mais
 * recentes no topo, entao repetir o treino da semana passada e escolher, nao
 * digitar de novo.
 *
 * Nome que nao existe na lista nao e erro: a ultima opcao cria o exercicio, e
 * o mesmo comportamento de antes (digitou, criou) continua valendo.
 */
export function ExerciseCombobox({
  value,
  onChange,
  options,
  label = 'Exercício',
  placeholder = 'Supino reto',
  className,
  autoFocus,
}: ExerciseComboboxProps) {
  const id = useId()
  const listId = `${id}-list`
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const blurTimer = useRef<number | undefined>(undefined)

  const query = value.trim().toLowerCase()

  const matches = useMemo(() => {
    if (!query) return options.slice(0, 8)
    const starts: ExerciseOption[] = []
    const contains: ExerciseOption[] = []
    for (const o of options) {
      const n = o.name.toLowerCase()
      if (n.startsWith(query)) starts.push(o)
      else if (n.includes(query)) contains.push(o)
    }
    return [...starts, ...contains].slice(0, 8)
  }, [options, query])

  const exactHit = matches.some((m) => m.name.toLowerCase() === query)
  const canCreate = query.length > 0 && !exactHit
  const rowCount = matches.length + (canCreate ? 1 : 0)

  const commit = (name: string) => {
    onChange(name)
    setOpen(false)
    setActive(0)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true)
      return
    }
    if (!open || rowCount === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % rowCount)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i - 1 + rowCount) % rowCount)
    } else if (e.key === 'Enter') {
      // So intercepta quando ha opcao destacada: sem isso o Enter deixaria de
      // submeter o form quando a lista esta aberta mas nada foi navegado.
      if (active < matches.length) {
        e.preventDefault()
        commit(matches[active].name)
      } else if (canCreate) {
        e.preventDefault()
        commit(value.trim())
      }
    }
  }

  return (
    <div className={cn('relative', className)}>
      <div className="field-float">
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          autoFocus={autoFocus}
          value={value}
          placeholder={placeholder}
          className="field-input py-2 text-sm"
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
            setActive(0)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          onBlur={() => {
            // Fecha no proximo tick: o clique numa opcao dispara blur antes do
            // click, e fechar aqui direto mataria a selecao.
            blurTimer.current = window.setTimeout(() => setOpen(false), 120)
          }}
        />
        <label htmlFor={id} className="field-float-label">
          {label}
        </label>
      </div>

      {open && rowCount > 0 && (
        <ul id={listId} role="listbox" className="combo-list">
          {matches.map((o, i) => (
            <li key={o.id}>
              <button
                type="button"
                role="option"
                aria-selected={i === active}
                className={cn('combo-option', i === active && 'active')}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  window.clearTimeout(blurTimer.current)
                  commit(o.name)
                }}
              >
                {o.name}
              </button>
            </li>
          ))}

          {canCreate && (
            <li>
              <button
                type="button"
                role="option"
                aria-selected={active === matches.length}
                className={cn(
                  'combo-option combo-create',
                  active === matches.length && 'active',
                )}
                onMouseEnter={() => setActive(matches.length)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  window.clearTimeout(blurTimer.current)
                  commit(value.trim())
                }}
              >
                <Plus className="size-3 shrink-0" />
                <span className="truncate">Criar &laquo;{value.trim()}&raquo;</span>
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
