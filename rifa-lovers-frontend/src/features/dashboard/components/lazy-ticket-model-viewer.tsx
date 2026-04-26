import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'

const TicketModelViewer = lazy(() =>
  import('./ticket-model-viewer').then((m) => ({ default: m.TicketModelViewer }))
)

function ModelSkeleton() {
  return (
    <div className="w-full h-[320px] sm:h-[380px] md:h-[420px] bg-surface-secondary/30 rounded-2xl animate-pulse flex flex-col items-center justify-center gap-3">
      <Spinner size="lg" />
      <span className="text-text-tertiary text-sm">Cargando ticket 3D...</span>
    </div>
  )
}

interface LazyTicketModelViewerProps {
  ticketNumber: number
}

export function LazyTicketModelViewer({ ticketNumber }: LazyTicketModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="w-full">
      {shouldRender ? (
        <Suspense fallback={<ModelSkeleton />}>
          <TicketModelViewer ticketNumber={ticketNumber} />
        </Suspense>
      ) : (
        <ModelSkeleton />
      )}
    </div>
  )
}
