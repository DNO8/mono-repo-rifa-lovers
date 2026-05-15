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
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      const startTime = performance.now()
      const MAX_WAIT_MS = 3000

      let rafId: number
      const tryScroll = () => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
          return
        }
        if (performance.now() - startTime < MAX_WAIT_MS) {
          rafId = requestAnimationFrame(tryScroll)
        }
      }
      rafId = requestAnimationFrame(tryScroll)
      return () => cancelAnimationFrame(rafId)
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

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
