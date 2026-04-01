import { Skeleton } from '@/components/ui/skeleton'

function HeroSkeleton() {
  return (
    <section className="px-4 md:px-8 pt-24 md:pt-28 pb-16 md:pb-24 text-center">
      <div className="mx-auto max-w-[800px] space-y-5">
        <Skeleton className="h-12 w-[70%] mx-auto" />
        <Skeleton className="h-5 w-[55%] mx-auto" />
      </div>
    </section>
  )
}

function StepsSkeleton() {
  return (
    <section className="px-4 md:px-8 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <Skeleton className="size-16 rounded-full" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsSkeleton() {
  return (
    <section className="px-4 md:px-8 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  )
}

function MilestonesSkeleton() {
  return (
    <section className="px-4 md:px-8 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] space-y-8">
        <div className="text-center space-y-3">
          <Skeleton className="h-10 w-[45%] mx-auto" />
          <Skeleton className="h-5 w-[35%] mx-auto" />
        </div>
        <div className="space-y-4 max-w-[700px] mx-auto">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  )
}

export function ImpactPageSkeleton() {
  return (
    <>
      <HeroSkeleton />
      <div className="h-px mx-auto max-w-[1200px] bg-gray-100" />
      <StepsSkeleton />
      <StatsSkeleton />
      <div className="h-px mx-auto max-w-[1200px] bg-gray-100" />
      <MilestonesSkeleton />
    </>
  )
}
