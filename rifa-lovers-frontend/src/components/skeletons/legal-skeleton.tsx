import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

export function LegalPageSkeleton() {
  return (
    <div className="px-4 md:px-8 py-12 md:py-16">
      <div className="mx-auto max-w-[800px] space-y-8">
        {/* Back link */}
        <Skeleton className="h-5 w-28" />

        {/* Header */}
        <div className="mb-10 space-y-4">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-10 w-[70%]" />
          <Skeleton className="h-5 w-48" />
        </div>

        {/* Legal notice */}
        <div className="rounded-xl p-4 md:p-5 bg-primary/5 border border-primary/10 mb-8">
          <div className="flex items-start gap-3">
            <Skeleton className="size-5 rounded-full mt-0.5 shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-28" />
              <SkeletonText className="w-full" />
              <SkeletonText className="w-[80%]" />
            </div>
          </div>
        </div>

        {/* Sections */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-lg shrink-0" />
              <Skeleton className="h-5 w-48" />
            </div>
            <SkeletonText className="w-full" />
            <SkeletonText className="w-[90%]" />
            <SkeletonText className="w-[60%]" />
          </div>
        ))}

        {/* CTA */}
        <div className="pt-8 border-t border-border-light text-center space-y-4">
          <Skeleton className="h-4 w-64 mx-auto" />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
