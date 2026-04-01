import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

export function AuthPageSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-[420px] space-y-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-10 w-48 mx-auto" />
          <SkeletonText className="w-64 mx-auto" />
        </div>
        <div className="rounded-2xl border border-gray-100 p-6 space-y-5">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
        <SkeletonText className="w-52 mx-auto" />
      </div>
    </div>
  )
}
