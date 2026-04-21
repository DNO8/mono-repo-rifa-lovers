import { Suspense, useEffect } from 'react'
import { useLocation } from 'react-router'
import { PageLayout } from '@/components/shared/layout/page-layout'
import { Spinner } from '@/components/ui/spinner'

function DefaultFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
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
      <ScrollToTop />
      <Suspense fallback={fallback ?? <DefaultFallback />}>{children}</Suspense>
    </PageLayout>
  )
}
