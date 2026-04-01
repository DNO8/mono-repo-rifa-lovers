import { SectionDivider } from '@/components/shared/section-divider'
import { HeroSection } from '../sections/hero-section'
import { LiveTickerSection } from '../sections/live-ticker-section'
import { CountdownSection } from '../sections/countdown-section'
import { StepsSection } from '../sections/steps-section'
import { WinnersSection } from '../sections/winners-section'
import { TestimonialsSection } from '../sections/testimonials-section'
import { PricingSection } from '../sections/pricing-section'

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <LiveTickerSection />
      <CountdownSection />
      <SectionDivider />
      <StepsSection />
      <SectionDivider />
      <WinnersSection />
      <SectionDivider />
      <TestimonialsSection />
      <SectionDivider />
      <PricingSection />
    </>
  )
}
