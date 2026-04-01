import { useState } from 'react'
import { Ticket, Heart, Radio, Shield, MessageCircle, Mail, Phone, Send, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FAQItem } from '@/components/shared/faq-item'
import { FAQS } from '@/lib/constants'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import { SplitText } from '@/components/shared/split-text'
import type { IconMap } from '@/types/ui.types'

const FAQ_ICONS: IconMap = {
  Ticket,
  Heart,
  Radio,
  Shield,
}

export function FAQContactSection() {
  const sectionRef = useGsapScroll<HTMLElement>({ stagger: 0.1 })
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: wire to backend
    setFormData({ name: '', email: '', message: '' })
  }

  return (
    <section
      ref={sectionRef}
      id="faq"
      data-gsap-stagger
      className="px-4 md:px-8 py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <Badge variant="subtle" className="mb-4">Soporte</Badge>
          <SplitText
            as="h2"
            className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight"
            type="words"
            stagger={0.05}
            duration={0.6}
          >
            ¿Tienes dudas? Aquí te ayudamos
          </SplitText>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: FAQ */}
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-5">Preguntas frecuentes</h3>
            <div className="space-y-3">
              {FAQS.map((faq) => (
                <FAQItem key={faq.id} faq={faq} iconMap={FAQ_ICONS} />
              ))}
            </div>
          </div>

          {/* Right: Contact form */}
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Estamos aquí para ayudarte</h3>
            <p className="text-sm text-text-secondary mb-5">
              Escríbenos y te respondemos lo antes posible.
            </p>

            <Card variant="glass-light" className="p-5 md:p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Tu nombre"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-white text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">Correo electrónico</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    placeholder="tu@email.com"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-white text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">Mensaje</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                    placeholder="¿En qué podemos ayudarte?"
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                  />
                </div>
                <Button variant="primary" size="lg" className="w-full">
                  <Send className="size-4" />
                  Enviar mensaje
                </Button>
              </form>

              {/* Response time badge */}
              <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-text-tertiary">
                <Clock className="size-3" />
                Respondemos en menos de 24 horas
              </div>
            </Card>

            {/* Contact links */}
            <div className="flex flex-wrap gap-3 mt-5">
              <a
                href="https://wa.me/56900000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary transition-colors"
              >
                <MessageCircle className="size-3.5" />
                WhatsApp
              </a>
              <a
                href="mailto:soporte@rifalovers.cl"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary transition-colors"
              >
                <Mail className="size-3.5" />
                soporte@rifalovers.cl
              </a>
              <a
                href="tel:+56900000000"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary transition-colors"
              >
                <Phone className="size-3.5" />
                Soporte telefónico
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
