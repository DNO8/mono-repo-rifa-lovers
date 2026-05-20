import { lazy, Suspense, useEffect, useRef, useState } from 'react'

const HeroCanvasBG = lazy(() => import('./hero-canvas-bg'))

function FullscreenSkeleton() {
  return (
    <div className="w-full h-full bg-[#0d0b1a] animate-pulse flex flex-col items-center justify-center gap-3">
      <div className="size-12 rounded-full bg-white/10" />
      <span className="text-white/40 text-sm">Cargando escena 3D...</span>
    </div>
  )
}

/**
 * LazyHeroModelViewer
 *
 * Implements:
 * - Code splitting with React.lazy() - 3D viewer in separate chunk
 * - Intersection Observer - only loads when entering viewport
 * - Page Visibility API - pauses animation when tab is backgrounded
 * - Delayed unmount - keeps rendered for 5s after leaving viewport
 *
 * Reduces initial bundle by ~350KB and stops wasting CPU/GPU when not visible.
 */
export function LazyHeroModelViewer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const pausedRef = useRef(false)

  // Intersection Observer - detect when section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting
        setIsVisible(visible)
        if (visible) setShouldRender(true)
      },
      {
        threshold: 0.05,
        rootMargin: '100px',
      }
    )

    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Delayed unmount - keep rendered for 5s after leaving viewport
  useEffect(() => {
    if (!isVisible && shouldRender) {
      const timer = setTimeout(() => setShouldRender(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, shouldRender])

  // Page Visibility API - pause when tab is backgrounded
  useEffect(() => {
    const handleVisibilityChange = () => { pausedRef.current = document.hidden }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full">
      {shouldRender ? (
        <Suspense fallback={<FullscreenSkeleton />}>
          <HeroCanvasBG isVisible={isVisible} pausedRef={pausedRef} />
        </Suspense>
      ) : (
        <FullscreenSkeleton />
      )}
    </div>
  )
}
