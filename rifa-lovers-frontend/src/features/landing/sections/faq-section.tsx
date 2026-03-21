import { useState, type ComponentType, type SVGProps } from 'react'
import { ChevronDown, Ticket, Heart, Radio, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { FAQS } from '@/lib/constants'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import { cn } from '@/lib/utils'

const FAQ_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>> = {
  Ticket,
  Heart,
  Radio,
  Shield,
}

function FAQItem({ question, answer, icon }: { question: string; answer: string; icon: string }) {
  const [open, setOpen] = useState(false)
  const IconComponent = FAQ_ICONS[icon]

  return (
    <div
      className={cn(
        'rounded-xl border transition-all cursor-pointer',
        open
          ? 'bg-white border-primary/20 shadow-md'
          : 'bg-white/60 border-border-light hover:border-primary/10 hover:shadow-sm'
      )}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center gap-3 p-5">
        {IconComponent && (
          <div className="size-9 rounded-lg bg-bg-purple-soft flex items-center justify-center shrink-0">
            <IconComponent className="size-4 text-primary" />
          </div>
        )}
        <span className="flex-1 font-semibold text-text-primary text-[15px]">{question}</span>
        <ChevronDown
          className={cn(
            'size-5 text-text-tertiary transition-transform duration-300',
            open && 'rotate-180 text-primary'
          )}
        />
      </div>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-out',
          open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <p className="px-5 pb-5 pl-17 text-sm text-text-secondary leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  )
}

export function FAQSection() {
  const sectionRef = useGsapScroll<HTMLElement>({ stagger: 0.1 })

  return (
    <section
      ref={sectionRef}
      id="faq"
      data-gsap-stagger
      className="px-4 md:px-8 py-16 md:py-24"
    >
      <div className="mx-auto max-w-[720px]">
        <div className="text-center mb-10">
          <Badge variant="subtle" className="mb-4">Preguntas frecuentes</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
            ¿Tienes <span className="gradient-text">dudas?</span>
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq) => (
            <FAQItem key={faq.id} question={faq.question} answer={faq.answer} icon={faq.icon} />
          ))}
        </div>
      </div>
    </section>
  )
}
