import { HeroSection } from '../sections/hero-section'
import { LiveTickerSection } from '../sections/live-ticker-section'
import { StepsSection } from '../sections/steps-section'
import { ImpactSection } from '../sections/impact-section'
import { WinnersSection } from '../sections/winners-section'
import { TestimonialsSection } from '../sections/testimonials-section'
import { PricingSection } from '../sections/pricing-section'
import { FAQSection } from '../sections/faq-section'
import { CTASection } from '../sections/cta-section'

function SectionDivider() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 md:px-8">
      <div className="h-px bg-linear-to-r from-transparent via-border-light to-transparent" />
    </div>
  )
}

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
