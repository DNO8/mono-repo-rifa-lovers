import { Ticket, Heart, Radio, Shield } from 'lucide-react'
import { FAQItem } from '@/components/shared/faq-item'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import { FAQS } from '@/lib/constants'
import type { IconMap } from '@/types/ui.types'

const FAQ_ICONS: IconMap = {
  Ticket,
  Heart,
  Radio,
  Shield,
}

export function ContactFaqSection() {
  const sectionRef = useGsapScroll<HTMLElement>({ stagger: 0.1 })

  return (
    <section ref={sectionRef} data-gsap-stagger>
      <div className="space-y-3">
        {FAQS.map((faq) => (
          <FAQItem key={faq.id} faq={faq} iconMap={FAQ_ICONS} />
        ))}
      </div>
    </section>
  )
}
