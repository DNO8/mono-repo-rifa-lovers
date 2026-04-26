import { type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        gradient:
          'gradient-rl text-white rounded-full px-3 py-1 text-xs uppercase tracking-wider font-bold',
        'outline-primary':
          'border border-primary text-primary rounded-full px-3 py-1 text-xs',
        subtle:
          'bg-primary/8 text-primary rounded-full px-3 py-1 text-xs',
        success:
          'bg-success/10 text-success rounded-full px-3 py-1 text-xs',
        muted:
          'bg-bg-muted text-text-tertiary rounded-full px-3 py-1 text-xs',
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
