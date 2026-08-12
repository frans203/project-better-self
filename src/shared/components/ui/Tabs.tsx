import { cn } from '@/shared/lib/utils'
import { useSound } from '@/shared/hooks/use-sound'

export interface TabItem<T extends string = string> {
  value: T
  label: string
}

interface TabsProps<T extends string> {
  items: TabItem<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
  label?: string
}

export function Tabs<T extends string>({ items, value, onChange, className, label }: TabsProps<T>) {
  const { playNav } = useSound()

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none]', className)}
    >
      {items.map((item) => (
        <button
          key={item.value}
          role="tab"
          aria-selected={item.value === value}
          className={cn('tab-btn', item.value === value && 'active')}
          onClick={() => {
            playNav()
            onChange(item.value)
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
