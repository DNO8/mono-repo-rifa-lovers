import { type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        gradient:
          'gradient-rl text-white rounded-[var(--radius-full)] px-3 py-1 text-xs uppercase tracking-wider font-bold',
        'outline-primary':
          'border border-[var(--color-primary)] text-[var(--color-primary)] rounded-[var(--radius-full)] px-3 py-1 text-xs',
        subtle:
          'bg-[rgba(123,63,228,0.08)] text-[var(--color-primary)] rounded-[var(--radius-full)] px-3 py-1 text-xs',
        success:
          'bg-[rgba(34,197,94,0.1)] text-[var(--color-success)] rounded-[var(--radius-full)] px-3 py-1 text-xs',
        muted:
          'bg-[var(--color-bg-muted)] text-[var(--color-text-tertiary)] rounded-[var(--radius-full)] px-3 py-1 text-xs',
        step: 'text-[11px] uppercase tracking-[1.5px] font-bold',
      },
    },
    defaultVariants: {
      variant: 'subtle',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
