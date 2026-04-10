import { SectionDivider } from '@/components/shared/section-divider'
import { HeroSection } from '../sections/hero-section'
import { LiveTickerSection } from '../sections/live-ticker-section'
import { CountdownSection } from '../sections/countdown-section'
import { StepsSection } from '../sections/steps-section'
import { WinnersSection } from '../sections/winners-section'
import { TestimonialsSection } from '../sections/testimonials-section'
import { PricingSection } from '../sections/pricing-section'
import { MilestoneTimeline } from '../components/ticket-selector'

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <section className="px-4 md:px-8 py-10 md:py-14">
        <div className="mx-auto max-w-4xl">
          <MilestoneTimeline />
        </div>
      </section>
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
