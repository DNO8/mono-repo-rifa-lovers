import { Ticket, Heart, Radio, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { FAQItem } from '@/components/shared/faq-item'
import { FAQS } from '@/lib/constants'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import type { IconMap } from '@/types/ui.types'

const FAQ_ICONS: IconMap = {
  Ticket,
  Heart,
  Radio,
  Shield,
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
            <FAQItem key={faq.id} faq={faq} iconMap={FAQ_ICONS} />
          ))}
        </div>
      </div>
    </section>
  )
}
