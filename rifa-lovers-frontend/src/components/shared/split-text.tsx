import { useRef, useEffect, type CSSProperties } from 'react'
import { gsap } from '@/lib/gsap'

interface SplitTextProps {
  children: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  style?: CSSProperties
  type?: 'words' | 'chars'
  stagger?: number
  duration?: number
  y?: number
  delay?: number
  triggerStart?: string
  gradient?: boolean
}

export function SplitText({
  children,
  as: Tag = 'span',
  className,
  style,
  type = 'words',
  stagger = 0.04,
  duration = 0.6,
  y = 20,
  delay = 0,
  triggerStart = 'top 85%',
  gradient = false,
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      el.style.opacity = '1'
      return
    }

    const lines = children.split('\n')

    if (type === 'chars') {
      el.innerHTML = lines
        .map((line) => {
          const lineWords = line.trim().split(/\s+/)
          return lineWords
            .map((word) => {
              const chars = word
                .split('')
                .map((c) => `<span class="split-char" style="display:inline-block;opacity:0">${c}</span>`)
                .join('')
              return `<span style="display:inline-block;white-space:nowrap">${chars}</span>`
            })
            .join(' ')
        })
        .join('<br>')

      const charEls = el.querySelectorAll('.split-char')
      gsap.set(charEls, { y, opacity: 0 })
      const tween = gsap.to(charEls, {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: triggerStart, once: true },
      })
      return () => { tween.kill() }
    }

    el.innerHTML = lines
      .map((line) => {
        const lineWords = line.trim().split(/\s+/)
        return lineWords
          .map((word) => {
            const gs = gradient ? 'background:inherit;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;' : ''
            return `<span class="split-word" style="display:inline-block;opacity:0;${gs}">${word}</span>`
          })
          .join(' ')
      })
      .join('<br>')

    const wordEls = el.querySelectorAll('.split-word')
    gsap.set(wordEls, { y, opacity: 0 })
    const tween = gsap.to(wordEls, {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      delay,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: triggerStart, once: true },
    })
    return () => { tween.kill() }
  }, [children, type, stagger, duration, y, delay, triggerStart, gradient])

  return (
    <Tag
      ref={ref as React.RefObject<never>}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  )
}
