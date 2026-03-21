import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

interface UseCountUpOptions {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
  separator?: string
}

function formatNumber(n: number, separator: string): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator)
}

export function useCountUp({
  end,
  duration = 1.5,
  prefix = '',
  suffix = '',
  separator = '.',
}: UseCountUpOptions) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      el.textContent = `${prefix}${formatNumber(end, separator)}${suffix}`
      return
    }

    el.textContent = `${prefix}0${suffix}`
    const obj = { value: 0 }

    const tween = gsap.to(obj, {
      value: end,
      duration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        once: true,
      },
      onUpdate: () => {
        el.textContent = `${prefix}${formatNumber(Math.round(obj.value), separator)}${suffix}`
      },
    })

    return () => {
      tween.kill()
    }
  }, [end, duration, prefix, suffix, separator])

  return ref
}
