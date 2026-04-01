import { Skeleton, SkeletonText, SkeletonCircle } from '@/components/ui/skeleton'

function GreetingSkeleton() {
  return (
    <div className="mb-8 space-y-3">
      <Skeleton className="h-8 w-64" />
      <SkeletonText className="w-48" />
      <div className="flex gap-4 mt-4">
        <Skeleton className="h-20 w-36 rounded-2xl" />
        <Skeleton className="h-20 w-36 rounded-2xl" />
      </div>
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <aside className="space-y-5">
      {/* Ticket history */}
      <div className="rounded-2xl border border-gray-100 p-5 space-y-4">
        <Skeleton className="h-5 w-32" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonCircle className="size-8" />
            <div className="flex-1 space-y-1.5">
              <SkeletonText className="w-[70%]" />
              <SkeletonText className="w-[40%] h-3" />
            </div>
          </div>
        ))}
      </div>
      {/* Social impact banner */}
      <Skeleton className="h-32 rounded-2xl" />
    </aside>
  )
}

function MainSkeleton() {
  return (
    <main className="space-y-6">
      {/* Raffle hero card */}
      <Skeleton className="h-64 rounded-2xl" />
      {/* Impact section */}
      <div className="rounded-2xl border border-gray-100 p-6 space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full rounded-full" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <SkeletonCircle className="size-5" />
              <SkeletonText className="w-[60%]" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export function DashboardPageSkeleton() {
  return (
    <div className="px-4 md:px-8 py-8 md:py-12">
      <div className="mx-auto max-w-[1200px]">
        <GreetingSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
          <div className="order-2 lg:order-1">
            <SidebarSkeleton />
          </div>
          <div className="order-1 lg:order-2">
            <MainSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}
