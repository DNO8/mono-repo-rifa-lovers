import { Skeleton } from '@/components/ui/skeleton'

function HeroSkeleton() {
  return (
    <section className="px-4 md:px-8 pt-24 md:pt-28 pb-16 md:pb-24 text-center">
      <div className="mx-auto max-w-[800px] space-y-5">
        <Skeleton className="h-8 w-48 mx-auto rounded-full" />
        <Skeleton className="h-12 w-[75%] mx-auto" />
        <Skeleton className="h-12 w-[60%] mx-auto" />
        <Skeleton className="h-5 w-[50%] mx-auto" />
        <div className="flex gap-3 justify-center mt-6">
          <Skeleton className="h-12 w-40 rounded-full" />
          <Skeleton className="h-12 w-44 rounded-full" />
        </div>
      </div>
    </section>
  )
}

function ValuesSkeleton() {
  return (
    <section className="px-4 md:px-8 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] space-y-10">
        <div className="text-center space-y-3">
          <Skeleton className="h-6 w-32 mx-auto rounded-full" />
          <Skeleton className="h-10 w-[50%] mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  )
}

function TeamSkeleton() {
  return (
    <section className="px-4 md:px-8 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] space-y-10">
        <div className="text-center space-y-3">
          <Skeleton className="h-10 w-[40%] mx-auto" />
          <Skeleton className="h-5 w-[30%] mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <Skeleton className="size-24 rounded-full" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function AboutPageSkeleton() {
  return (
    <>
      <HeroSkeleton />
      <div className="h-px mx-auto max-w-[1200px] bg-gray-100" />
      <ValuesSkeleton />
      <TeamSkeleton />
    </>
  )
}
