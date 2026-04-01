import { Skeleton, SkeletonText, SkeletonCircle } from '@/components/ui/skeleton'

export function RaffleDetailPageSkeleton() {
  return (
    <div className="px-4 md:px-8 py-8 md:py-12">
      <div className="mx-auto max-w-[1200px] space-y-8">
        {/* Back button */}
        <Skeleton className="h-8 w-24" />

        {/* Raffle hero */}
        <Skeleton className="h-72 w-full rounded-2xl" />

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 p-5 space-y-3">
              <SkeletonCircle className="size-10" />
              <Skeleton className="h-5 w-32" />
              <SkeletonText className="w-[80%]" />
            </div>
          ))}
        </div>

        {/* Ticket grid */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {[...Array(40)].map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
