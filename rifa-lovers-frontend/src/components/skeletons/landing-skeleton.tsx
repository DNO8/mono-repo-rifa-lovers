import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

function HeroSkeleton() {
  return (
    <section className="px-4 md:px-8 pt-24 md:pt-28 pb-16 md:pb-24">
      <div className="mx-auto max-w-[1400px] flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
        <div className="flex-1 space-y-5 w-full">
          <Skeleton className="h-8 w-40 rounded-full" />
          <Skeleton className="h-14 w-[80%]" />
          <Skeleton className="h-14 w-[65%]" />
          <Skeleton className="h-14 w-[55%]" />
          <SkeletonText className="w-[70%] mt-4" />
          <div className="flex gap-3 mt-6">
            <Skeleton className="h-12 w-44 rounded-full" />
            <Skeleton className="h-12 w-52 rounded-full" />
          </div>
        </div>
        <Skeleton className="flex-1 h-[300px] md:h-[400px] w-full rounded-2xl" />
      </div>
    </section>
  )
}

function TickerSkeleton() {
  return (
    <div className="py-3 overflow-hidden">
      <Skeleton className="h-6 w-full max-w-[600px] mx-auto rounded-md" />
    </div>
  )
}

function CountdownSkeleton() {
  return (
    <section className="px-4 md:px-8 py-8">
      <div className="mx-auto max-w-[800px] text-center space-y-4">
        <Skeleton className="h-6 w-48 mx-auto rounded-full" />
        <div className="flex justify-center gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-20 rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  )
}

function StepsSkeleton() {
  return (
    <section className="px-4 md:px-8 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] space-y-12">
        <div className="text-center space-y-3">
          <Skeleton className="h-6 w-36 mx-auto rounded-full" />
          <Skeleton className="h-10 w-[60%] mx-auto" />
          <SkeletonText className="w-48 mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  )
}

function WinnersSkeleton() {
  return (
    <section className="px-4 md:px-8 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] space-y-10">
        <div className="text-center space-y-3">
          <Skeleton className="h-6 w-32 mx-auto rounded-full" />
          <Skeleton className="h-10 w-[50%] mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSkeleton() {
  return (
    <section className="px-4 md:px-8 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] space-y-10">
        <div className="text-center space-y-3">
          <Skeleton className="h-6 w-36 mx-auto rounded-full" />
          <Skeleton className="h-10 w-[55%] mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSkeleton() {
  return (
    <section className="px-4 md:px-8 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] space-y-10">
        <div className="text-center space-y-3">
          <Skeleton className="h-6 w-40 mx-auto rounded-full" />
          <Skeleton className="h-10 w-[50%] mx-auto" />
          <SkeletonText className="w-64 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[900px] mx-auto">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className={`h-72 rounded-2xl ${i === 1 ? 'md:scale-105' : ''}`} />
          ))}
        </div>
      </div>
    </section>
  )
}

function DividerSkeleton() {
  return <div className="h-px mx-auto max-w-[1200px] bg-gray-100" />
}

export function LandingPageSkeleton() {
  return (
    <>
      <HeroSkeleton />
      <TickerSkeleton />
      <CountdownSkeleton />
      <DividerSkeleton />
      <StepsSkeleton />
      <DividerSkeleton />
      <WinnersSkeleton />
      <DividerSkeleton />
      <TestimonialsSkeleton />
      <DividerSkeleton />
      <PricingSkeleton />
    </>
  )
}
