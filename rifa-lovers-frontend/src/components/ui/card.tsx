import { forwardRef, type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva('rounded-[var(--radius-xl)] transition-all', {
  variants: {
    variant: {
      default: 'bg-white shadow-md',
      glass: 'glass-medium',
      'glass-light': 'glass-light',
      'glass-heavy': 'glass-heavy',
      highlight:
        'bg-white shadow-md border-2 border-[var(--color-primary)]',
      warm: 'bg-[var(--color-bg-warm)]',
      'soft-purple': 'bg-[var(--color-bg-purple-soft)]',
      'soft-pink': 'bg-[var(--color-bg-pink-soft)]',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), 'p-6', className)}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardContent, cardVariants }
