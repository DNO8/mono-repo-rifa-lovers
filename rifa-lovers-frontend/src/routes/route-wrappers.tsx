import { Suspense } from 'react'
import { PageLayout } from '@/components/shared/layout/page-layout'
import { Spinner } from '@/components/ui/spinner'

function DefaultFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  )
}

export function PageWithSuspense({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <PageLayout>
      <Suspense fallback={fallback ?? <DefaultFallback />}>{children}</Suspense>
    </PageLayout>
  )
}
