import { useRef } from 'react'
import { LazyHeroModelViewer } from '../components/lazy-hero-model-viewer'
import { HeroContentOverlay } from '../components/hero-content-overlay'
import { HeroLiveBadges } from '../components/hero-live-badges'

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const rectRef = useRef<DOMRect | null>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const spot = spotlightRef.current
    if (!spot) return
    if (!rectRef.current) rectRef.current = e.currentTarget.getBoundingClientRect()
    const rect = rectRef.current
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    spot.style.transform = `translate(${x - 5}px, ${y - 5}px)`
    spot.style.opacity = '1'
  }

  const handleMouseLeave = () => {
    const spot = spotlightRef.current
    if (spot) spot.style.opacity = '0'
    rectRef.current = null
  }

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-[85vh] lg:min-h-screen overflow-hidden bg-[#0d0b1a]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Gradient flashlight cursor — desktop only */}
      <div className="hidden lg:block absolute inset-0 overflow-hidden pointer-events-none z-50">
        <div
          ref={spotlightRef}
          className="absolute w-[50px] h-[50px] rounded-full transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle, rgba(123,63,228,0.13) 0%, rgba(255,77,166,0.09) 40%, rgba(255,138,61,0.05) 65%, transparent 80%)',
            opacity: 0,
            willChange: 'transform',
          }}
        />
      </div>

      {/* Desktop: 3D Canvas fullscreen */}
      <div className="hidden lg:block absolute inset-0 z-0">
        <LazyHeroModelViewer />
      </div>

      {/* Desktop: Text Overlay */}
      <div className="hidden lg:flex absolute inset-0 z-30 pointer-events-none items-center px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="w-full max-w-[42%] lg:max-w-[45%] xl:max-w-[50%]">
          <HeroContentOverlay />
        </div>
      </div>

      {/* Desktop: Floating Live Badges */}
      <div className="hidden lg:block absolute inset-0 z-40 pointer-events-none">
        <HeroLiveBadges />
      </div>

      {/* Mobile: Split layout */}
      <div className="lg:hidden relative z-10 flex flex-col min-h-[85vh]">
        {/* Text side */}
        <div className="w-full flex items-center px-6 py-12 bg-linear-to-b from-[#0d0b1a] via-[#110d1a] to-[#1a0f2e]">
          <HeroContentOverlay />
        </div>
        {/* 3D Canvas side */}
        <div className="relative w-full h-[55vh]">
          <LazyHeroModelViewer />
          <div className="absolute inset-0 z-40 pointer-events-none">
            <HeroLiveBadges />
          </div>
        </div>
      </div>
    </section>
  )
}
