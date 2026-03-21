import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface UseGsapScrollOptions {
  y?: number
  opacity?: number
  duration?: number
  stagger?: number
  delay?: number
  once?: boolean
}

export function useGsapScroll<T extends HTMLElement>(
  options: UseGsapScrollOptions = {}
) {
  const ref = useRef<T>(null)
  const {
    y = 24,
    opacity = 0,
    duration = 0.6,
    stagger = 0.1,
    delay = 0,
    once = true,
  } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const children = el.dataset.gsapStagger
      ? Array.from(el.children)
      : [el]

    gsap.set(children, { y, opacity })

    const tween = gsap.to(children, {
      y: 0,
      opacity: 1,
      duration,
      stagger,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once,
      },
    })

    return () => {
      tween.kill()
    }
  }, [y, opacity, duration, stagger, delay, once])

  return ref
}
