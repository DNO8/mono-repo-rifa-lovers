import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { HeroLiveFrame } from './hero-live-frame'

// Lazy load the heavy 3D viewer - creates separate chunk
const HeroModelViewer = lazy(() => import('./hero-model-viewer'))

/**
 * Lightweight skeleton placeholder shown while 3D model loads
 * or when not in viewport
 */
function ModelSkeleton() {
  return (
    <div className="aspect-square bg-surface-secondary/30 rounded-2xl animate-pulse flex flex-col items-center justify-center gap-3 min-h-[300px]">
      <div className="size-12 rounded-full bg-surface-secondary/50" />
      <span className="text-text-tertiary text-sm">Cargando modelo 3D...</span>
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
        
        // Mount when becoming visible
        if (visible) {
          setShouldRender(true)
        }
      },
      { 
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: '100px' // Start loading 100px before entering viewport
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Delayed unmount - keep rendered for 5s after leaving viewport
  // Prevents thrashing on quick scrolls
  useEffect(() => {
    if (!isVisible && shouldRender) {
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, shouldRender])

  // Page Visibility API - pause when tab is backgrounded
  useEffect(() => {
    const handleVisibilityChange = () => {
      pausedRef.current = document.hidden
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return (
    <div ref={containerRef} className="w-full">
      {shouldRender ? (
        <Suspense fallback={<ModelSkeleton />}>
          <HeroLiveFrame>
            <HeroModelViewer isVisible={isVisible} pausedRef={pausedRef} />
          </HeroLiveFrame>
        </Suspense>
      ) : (
        <ModelSkeleton />
      )}
    </div>
  )
}
