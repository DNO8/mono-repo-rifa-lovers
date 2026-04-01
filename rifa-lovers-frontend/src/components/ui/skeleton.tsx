import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-gray-200/60',
        className,
      )}
      {...props}
    />
  )
}

export function SkeletonText({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn('h-4 rounded-md', className)} {...props} />
}

export function SkeletonCircle({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn('rounded-full', className)} {...props} />
}
