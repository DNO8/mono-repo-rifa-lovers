import type { ButtonHTMLAttributes, Ref } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from "@/lib/utils"
import { buttonVariants, type ButtonVariants } from "./button-variants"

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
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

export { Button }
