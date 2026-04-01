import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

function HeroSkeleton() {
  return (
    <section className="px-4 md:px-8 pt-24 md:pt-28 pb-16 md:pb-24 text-center">
      <div className="mx-auto max-w-[800px] space-y-5">
        <Skeleton className="h-12 w-[60%] mx-auto" />
        <Skeleton className="h-5 w-[70%] mx-auto" />
        <Skeleton className="h-5 w-[50%] mx-auto" />
      </div>
    </section>
  )
}

function FaqFormSkeleton() {
  return (
    <section className="px-4 md:px-8 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] space-y-12">
        <div className="text-center space-y-3">
          <Skeleton className="h-6 w-28 mx-auto rounded-full" />
          <Skeleton className="h-10 w-[50%] mx-auto" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* FAQ side */}
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
          {/* Form side */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-12 w-44 rounded-full" />
            <SkeletonText className="w-52 mx-auto mt-2" />
          </div>
        </div>
      </div>
    </section>
  )
}

function CommunitySkeleton() {
  return (
    <section className="px-4 md:px-8 py-16 md:py-24 text-center">
      <div className="mx-auto max-w-[600px] space-y-4">
        <Skeleton className="h-10 w-[60%] mx-auto" />
        <Skeleton className="h-5 w-[45%] mx-auto" />
        <Skeleton className="h-12 w-48 mx-auto rounded-full mt-4" />
      </div>
    </section>
  )
}

export function ContactPageSkeleton() {
  return (
    <>
      <HeroSkeleton />
      <div className="h-px mx-auto max-w-[1200px] bg-gray-100" />
      <FaqFormSkeleton />
      <CommunitySkeleton />
    </>
  )
}
