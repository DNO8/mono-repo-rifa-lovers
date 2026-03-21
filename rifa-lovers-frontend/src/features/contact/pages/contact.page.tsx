import { Badge } from '@/components/ui/badge'
import { SplitText } from '@/components/shared/split-text'
import { SectionDivider } from '@/components/shared/section-divider'
import { ContactHeroSection } from '../sections/contact-hero-section'
import { ContactFaqSection } from '../sections/contact-faq-section'
import { ContactCommunitySection } from '../sections/contact-community-section'
import { ContactForm } from '../components/contact-form'

export default function ContactPage() {
  return (
    <>
      <ContactHeroSection />
      <SectionDivider />

      <section className="px-4 md:px-8 py-16 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center mb-12 md:mb-16">
            <Badge variant="subtle" className="mb-4">Soporte</Badge>
            <SplitText
              as="h2"
              className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight"
              type="words"
              stagger={0.05}
              duration={0.6}
            >
              Preguntas frecuentes y contacto
            </SplitText>
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
