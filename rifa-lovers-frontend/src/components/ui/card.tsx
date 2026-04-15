/* eslint-disable react-refresh/only-export-components */
import type { HTMLAttributes, Ref } from 'react'
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
    VariantProps<typeof cardVariants> {
  ref?: Ref<HTMLDivElement>
}

function Card({ className, variant, ref, ...props }: CardProps) {
  return (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), 'p-6', className)}
      {...props}
    />
  )
}

interface CardSubProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>
}

function CardHeader({ className, ref, ...props }: CardSubProps) {
  return <div ref={ref} className={cn('mb-4', className)} {...props} />
}

function CardContent({ className, ref, ...props }: CardSubProps) {
  return <div ref={ref} className={cn(className)} {...props} />
}

function CardTitle({ className, ref, ...props }: CardSubProps) {
  return <h3 ref={ref} className={cn('font-semibold text-text-primary', className)} {...props} />
}

export { Card, CardHeader, CardContent, CardTitle, cardVariants }
