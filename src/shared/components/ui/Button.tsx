import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-mono uppercase tracking-widest ' +
    'transition-all duration-200 cursor-pointer select-none whitespace-nowrap ' +
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none ' +
    '[&_svg]:shrink-0',
  {
    variants: {
      variant: {
        solid:
          'bg-white text-[#0a0a0a] border border-white hover:shadow-[0_0_14px_rgba(255,255,255,0.3)]',
        outline:
          'bg-transparent text-text-secondary border border-border-default ' +
          'hover:border-white hover:text-white',
        ghost:
          'bg-transparent text-text-secondary border border-transparent ' +
          'hover:text-white hover:bg-white/5',
        danger:
          'bg-transparent text-fail border border-fail/40 hover:border-fail hover:bg-fail/10',
        ok: 'bg-transparent text-ok border border-ok/40 hover:border-ok hover:bg-ok/10',
      },
      size: {
        sm: 'text-[10px] px-3 py-1.5 [&_svg]:size-3.5',
        md: 'text-[11px] px-4 py-2.5 [&_svg]:size-4',
        lg: 'text-xs px-6 py-3.5 [&_svg]:size-4',
        icon: 'p-2 [&_svg]:size-4',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'outline', size: 'md', block: false },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children?: ReactNode
}

export function Button({ className, variant, size, block, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, block }), className)} {...props} />
}
