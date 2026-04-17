import { cva, type VariantProps } from "class-variance-authority"

export const buttonVariants = cva(
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
        default:
          'gradient-rl text-white rounded-[var(--radius-lg)] shadow-md hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]',
        outline:
          'bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-[var(--radius-lg)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]',
        destructive:
          'bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-[var(--radius-lg)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]',
      },
      size: {
        sm: 'h-8 px-4 text-[13px] font-medium',
        md: 'h-10 px-6 text-[15px]',
        lg: 'h-12 px-8 text-base',
        default: 'h-10 px-6 text-[15px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
