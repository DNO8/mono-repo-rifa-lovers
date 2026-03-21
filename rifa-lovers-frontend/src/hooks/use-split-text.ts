import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export interface SplitTextOptions {
  type?: 'words' | 'chars' | 'both'
  stagger?: number
  duration?: number
  y?: number
  delay?: number
  triggerStart?: string
  once?: boolean
}

export function useSplitText<T extends HTMLElement>(options: SplitTextOptions = {}) {
  const ref = useRef<T>(null)
  const {
    type = 'words',
    stagger = 0.04,
    duration = 0.6,
    y = 20,
    delay = 0,
    triggerStart = 'top 85%',
    once = true,
  } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const originalHTML = el.innerHTML
    const text = el.textContent || ''

    if (type === 'chars' || type === 'both') {
      const words = text.split(/\s+/)
      el.innerHTML = words
        .map((word) => {
          const chars = word
            .split('')
            .map((char) => `<span class="split-char" style="display:inline-block;opacity:0">${char}</span>`)
            .join('')
          return `<span class="split-word" style="display:inline-block;white-space:nowrap">${chars}</span>`
        })
        .join(' ')

      const charEls = el.querySelectorAll('.split-char')
      const tween = gsap.to(charEls, {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: triggerStart,
          once,
        },
      })
      gsap.set(charEls, { y, opacity: 0 })

      return () => {
        tween.kill()
        el.innerHTML = originalHTML
      }
    }

    // Words only
    const words = text.split(/\s+/)
    el.innerHTML = words
      .map((word) => `<span class="split-word" style="display:inline-block;opacity:0">${word}</span>`)
      .join(' ')

    const wordEls = el.querySelectorAll('.split-word')
    gsap.set(wordEls, { y, opacity: 0 })
    const tween = gsap.to(wordEls, {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: triggerStart,
        once,
      },
    })

    return () => {
      tween.kill()
      el.innerHTML = originalHTML
    }
  }, [type, stagger, duration, y, delay, triggerStart, once])

  return ref
}
