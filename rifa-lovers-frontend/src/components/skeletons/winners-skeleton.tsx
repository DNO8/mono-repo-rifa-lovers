import { Skeleton } from '@/components/ui/skeleton'

export function WinnersPageSkeleton() {
  return (
    <div className="min-h-screen bg-bg-base px-4 py-12">
      <div className="mx-auto max-w-xl space-y-8">
        {/* Back button */}
        <Skeleton className="h-10 w-32 rounded-full" />

        {/* Header */}
        <div className="text-center space-y-4">
          <Skeleton className="h-6 w-40 rounded-full mx-auto" />
          <Skeleton className="h-9 w-48 mx-auto" />
          <Skeleton className="h-4 w-56 mx-auto" />
        </div>

        {/* Winner cards */}
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="glass-medium rounded-2xl p-5 flex items-center gap-4"
            >
              <div className="shrink-0 flex flex-col items-center gap-1">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-3 w-6" />
              </div>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="size-5 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
