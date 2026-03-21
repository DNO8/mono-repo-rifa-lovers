/* eslint-disable react-refresh/only-export-components */
import type { ButtonHTMLAttributes, Ref } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]',
  {
    variants: {
      variant: {
        primary:
          'gradient-rl text-white rounded-[var(--radius-lg)] shadow-md hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]',
        secondary:
          'bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-[var(--radius-lg)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]',
        ghost:
          'bg-transparent text-[var(--color-primary)] rounded-[var(--radius-md)] hover:bg-[var(--color-bg-purple-soft)]',
        'outline-primary':
          'bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)] rounded-[var(--radius-full)] hover:bg-[var(--color-bg-purple-soft)]',
      },
      size: {
        sm: 'h-8 px-4 text-[13px] font-medium',
        md: 'h-10 px-6 text-[15px]',
        lg: 'h-12 px-8 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  ref?: Ref<HTMLButtonElement>
}

function Button({ className, variant, size, loading, disabled, children, ref, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : children}
    </button>
  )
}

export { Button, buttonVariants }
