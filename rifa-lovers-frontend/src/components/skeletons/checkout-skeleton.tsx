import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

export function CheckoutPageSkeleton() {
  return (
    <div className="px-4 md:px-8 py-8 md:py-12">
      <div className="mx-auto max-w-[900px] space-y-8">
        <Skeleton className="h-8 w-48" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Order form */}
          <div className="space-y-5">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-6 w-36 mt-4" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>

          {/* Order summary */}
          <div className="rounded-2xl border border-gray-100 p-6 h-fit space-y-4">
            <Skeleton className="h-6 w-36" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <SkeletonText className="w-28" />
                  <SkeletonText className="w-16" />
                </div>
              ))}
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-12 w-full rounded-full mt-2" />
          </div>
        </div>
      </div>
    </div>
  )
}
