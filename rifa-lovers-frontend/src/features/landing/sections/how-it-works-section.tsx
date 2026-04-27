import { useRef, useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { gsap } from '@/lib/gsap'
import { Badge } from '@/components/ui/badge'
import { SplitText } from '@/components/shared/split-text'
import { FLOW_STEPS, TRUST_ITEMS } from '@/lib/content/how-it-works.content'

/* ══════════════════════════════════════════════════════
   Components
   ══════════════════════════════════════════════════════ */

function FlowStep({
  step,
  index,
  isLast,
}: {
  step: typeof FLOW_STEPS[number]
  index: number
  isLast: boolean
}) {
  const Icon = step.icon
  const isEven = index % 2 === 0

  return (
    <div className={`flow-step relative flex gap-6 md:gap-10 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
      {/* Left/Right content */}
      <div className={`flex-1 pb-10 ${isEven ? 'md:text-right' : 'md:text-left'}`}>
        <div
          className={`inline-flex items-center gap-2 mb-3 ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} flex-row`}
        >
          <div
            className="size-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: step.bg }}
          >
            <Icon className="size-4.5" style={{ color: step.color }} />
          </div>
          <span
            className="text-[10px] font-black tracking-widest uppercase"
            style={{ color: step.color }}
          >
            PASO {step.step}
          </span>
        </div>
        <h3 className="text-base md:text-lg font-bold text-text-primary mb-1 leading-snug">
          {step.title}
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed max-w-sm mb-3">
          {step.subtitle}
        </p>
        <ul className={`space-y-1.5 ${isEven ? 'md:ml-auto' : ''} max-w-sm`}>
          {step.bullets.map((bullet, i) => (
            <li
              key={i}
              className={`flex items-start gap-2 text-sm text-text-secondary ${isEven ? 'md:flex-row-reverse md:text-right' : ''}`}
            >
              <span className="inline-flex items-center justify-center size-4 rounded-full shrink-0 mt-0.5"
                style={{ backgroundColor: step.color }}
              >
                <CheckCircle2 className="size-3 text-white" />
              </span>
              <span className="leading-snug">{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Center spine */}
      <div className="relative flex flex-col items-center">
        {/* Node */}
        <div
          className="flow-node size-10 rounded-full flex items-center justify-center z-10 ring-4 ring-white shadow-md shrink-0 font-black text-white text-sm"
          style={{ backgroundColor: step.color }}
        >
          {step.step}
        </div>
        {/* Connector line */}
        {!isLast && (
          <div
            className="flow-line w-0.5 flex-1 mt-1"
            style={{ background: `linear-gradient(to bottom, ${step.color}60, ${FLOW_STEPS[index + 1].color}60)` }}
          />
        )}
      </div>

      {/* Badge card — opposite side */}
      <div className="flex-1 hidden md:flex items-start justify-center pt-2">
        <div
          className="rounded-xl px-4 py-3 text-xs font-medium leading-snug max-w-[200px]"
          style={{ backgroundColor: step.bg, color: step.color }}
        >
          {step.badge}
        </div>
      </div>
    </div>
  )
}

function TrustCard({ item, index }: { item: typeof TRUST_ITEMS[number]; index: number }) {
  const Icon = item.icon
  const statRef = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = statRef.current
    if (!el) return

    const numericValue = parseFloat(item.stat)
    if (isNaN(numericValue)) return

    const suffix = item.stat.replace(String(numericValue), '')

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          gsap.fromTo(
            { val: 0 },
            { val: numericValue },
            {
              duration: 1.4,
              ease: 'power2.out',
              delay: index * 0.15,
              onUpdate: function () {
                if (el) {
                  const current = this.targets()[0].val
                  el.textContent = (Number.isInteger(numericValue)
                    ? Math.round(current)
                    : current.toFixed(0)) + suffix
                }
              },
            }
          )
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [item.stat, index])

  return (
    <div
      className="trust-card rounded-2xl p-6 md:p-8 flex flex-col gap-4"
      style={{
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
      }}
    >
      <div
        className="size-12 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: item.bg }}
      >
        <Icon className="size-6" style={{ color: item.color }} />
      </div>

      <div>
        <div className="flex items-baseline gap-1.5 mb-0.5">
          <span
            ref={statRef}
            className="text-3xl font-black"
            style={{ color: item.color }}
          >
            {item.stat}
          </span>
          <span className="text-sm text-text-tertiary font-medium">{item.statLabel}</span>
        </div>
        <h3 className="text-base font-bold text-text-primary">{item.title}</h3>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed">
        {item.description}
      </p>

      {/* Accent bottom */}
      <div
        className="h-0.5 rounded-full mt-auto"
        style={{ background: `linear-gradient(90deg, ${item.color}, transparent)` }}
      />
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   Main section
   ══════════════════════════════════════════════════════ */

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const flowRef = useRef<HTMLDivElement>(null)
  const trustRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const flow = flowRef.current
    const trust = trustRef.current
    if (!section || !flow || !trust) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const steps = flow.querySelectorAll<HTMLElement>('.flow-step')
    const nodes = flow.querySelectorAll<HTMLElement>('.flow-node')
    const lines = flow.querySelectorAll<HTMLElement>('.flow-line')
    const trustCards = trust.querySelectorAll<HTMLElement>('.trust-card')

    gsap.set(steps, { x: (i) => (i % 2 === 0 ? -40 : 40), opacity: 0 })
    gsap.set(nodes, { scale: 0, opacity: 0 })
    gsap.set(lines, { scaleY: 0, transformOrigin: 'top center' })
    gsap.set(trustCards, { y: 50, opacity: 0 })

    gsap.to(steps, {
      x: 0,
      opacity: 1,
      duration: 0.7,
      stagger: 0.18,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: flow,
        start: 'top 75%',
        once: true,
      },
    })

    gsap.to(nodes, {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      stagger: 0.18,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: flow,
        start: 'top 75%',
        once: true,
      },
    })

    gsap.to(lines, {
      scaleY: 1,
      duration: 0.6,
      stagger: 0.18,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: flow,
        start: 'top 75%',
        once: true,
      },
    })

    gsap.to(trustCards, {
      y: 0,
      opacity: 1,
      duration: 0.65,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: trust,
        start: 'top 80%',
        once: true,
      },
    })
  }, [])

  return (
    <section
      ref={sectionRef}
      id="como-participar"
      className="px-4 md:px-8 py-16 md:py-24 overflow-hidden"
    >
      <div className="mx-auto max-w-[900px]">

        {/* ── Block A: Timeline ── */}
        <div className="text-center mb-12 md:mb-16">
          <Badge variant="subtle" className="mb-4">Paso a paso</Badge>
          <SplitText
            as="h2"
            className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight mb-3"
            type="words"
            stagger={0.05}
            duration={0.6}
          >
            ¿Cómo funciona exactamente?
          </SplitText>
          <p className="text-text-secondary max-w-lg mx-auto">
            De principio a fin, en 5 pasos simples.
          </p>
        </div>

        <div ref={flowRef} className="mb-20 md:mb-28">
          {FLOW_STEPS.map((step, index) => (
            <FlowStep
              key={step.id}
              step={step}
              index={index}
              isLast={index === FLOW_STEPS.length - 1}
            />
          ))}
        </div>

        {/* ── Block B: Trust ── */}
        <div className="text-center mb-10 md:mb-14">
          <Badge variant="gradient" className="mb-4">Transparencia</Badge>
          <SplitText
            as="h2"
            className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight mb-3"
            type="words"
            stagger={0.05}
            duration={0.6}
          >
            Por qué confiar en nosotros
          </SplitText>
          <p className="text-text-secondary max-w-lg mx-auto">
            Construimos cada parte del proceso pensando en tu confianza.
          </p>
        </div>

        <div
          ref={trustRef}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6"
        >
          {TRUST_ITEMS.map((item, i) => (
            <TrustCard key={item.id} item={item} index={i} />
          ))}
        </div>

      </div>
    </section>
  )
}
