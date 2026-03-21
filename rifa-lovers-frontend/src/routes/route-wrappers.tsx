import { Suspense } from 'react'
import { PageLayout } from '@/components/shared/layout/page-layout'
import { Spinner } from '@/components/ui/spinner'

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  )
}

export function PageWithSuspense({ children }: { children: React.ReactNode }) {
  return (
    <PageLayout>
      <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
    </PageLayout>
  )
}
