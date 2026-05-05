import { Badge } from '@/components/ui/badge'
import { SectionDivider } from '@/components/shared/section-divider'
import { SEOHead } from '@/components/shared/seo/helmet-wrapper'
import { ContactHeroSection } from '../sections/contact-hero-section'
import { ContactFaqSection } from '../sections/contact-faq-section'
import { ContactCommunitySection } from '../sections/contact-community-section'
import { ContactForm } from '../components/contact-form'

export default function ContactPage() {
  return (
    <>
      <SEOHead
        title="Contacto"
        description="Contacta a RifaLovers. Resolvemos tus dudas sobre rifas online, sorteos y nuestra comunidad participativa. Soporte rápido y atención personalizada."
        canonical="/contacto"
      />
      <ContactHeroSection />
      <SectionDivider />

      <section className="px-4 md:px-8 py-16 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center mb-12 md:mb-16">
            <Badge variant="subtle" className="mb-4">Soporte</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
              Preguntas frecuentes y contacto
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <ContactFaqSection />
            <ContactForm />
          </div>
        </div>
      </section>

      <ContactCommunitySection />
    </>
  )
}
