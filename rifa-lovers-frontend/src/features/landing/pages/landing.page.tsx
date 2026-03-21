import { SectionDivider } from '@/components/shared/section-divider'
import { HeroSection } from '../sections/hero-section'
import { LiveTickerSection } from '../sections/live-ticker-section'
import { StepsSection } from '../sections/steps-section'
import { ImpactSection } from '../sections/impact-section'
import { WinnersSection } from '../sections/winners-section'
import { TestimonialsSection } from '../sections/testimonials-section'
import { PricingSection } from '../sections/pricing-section'
import { FAQSection } from '../sections/faq-section'
import { CTASection } from '../sections/cta-section'

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <LiveTickerSection />
      <SectionDivider />
      <StepsSection />
      <SectionDivider />
      <WinnersSection />
      <SectionDivider />
      <ImpactSection />
      <SectionDivider />
      <TestimonialsSection />
      <SectionDivider />
      <PricingSection />
      <SectionDivider />
      <FAQSection />
      <CTASection />
    </>
  )
}
