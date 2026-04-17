import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps {
  className?: string
  children?: React.ReactNode
  size?: "sm" | "md" | "lg"
}

interface AvatarImageProps {
  src?: string
  alt?: string
  className?: string
}

interface AvatarFallbackProps {
  children: React.ReactNode
  className?: string
}

function Avatar({ className, children, size = "md", ...props }: AvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm", 
    lg: "h-12 w-12 text-base"
  }

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full font-medium text-white gradient-rl",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function AvatarImage({ src, alt, className }: AvatarImageProps) {
  if (!src) return null
  
  return (
    <img
      src={src}
      alt={alt}
      className={cn("h-full w-full rounded-full object-cover", className)}
    />
  )
}

function AvatarFallback({ children, className }: AvatarFallbackProps) {
  return (
    <span className={cn("flex h-full w-full items-center justify-center rounded-full", className)}>
      {children}
    </span>
  )
}

export { Avatar, AvatarImage, AvatarFallback }
