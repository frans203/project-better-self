import type { VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { buttonVariants } from './button-variants'

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children?: ReactNode
}

export function Button({ className, variant, size, block, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, block }), className)} {...props} />
}
