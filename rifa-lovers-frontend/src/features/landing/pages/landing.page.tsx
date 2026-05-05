import { SectionDivider } from '@/components/shared/section-divider'
import { SEOHead } from '@/components/shared/seo/helmet-wrapper'
import { SchemaOrg } from '@/components/shared/seo/schema-org'
import { DEFAULT_ORGANIZATION, DEFAULT_WEBSITE } from '@/components/shared/seo/schema-org-constants'
import { HeroSection } from '../sections/hero-section'
import { TrustBarSection } from '../sections/trust-bar-section'
import { ProgressFomoSection } from '../sections/progress-fomo-section'
import { LiveTickerSection } from '../sections/live-ticker-section'
import { CountdownSection } from '../sections/countdown-section'
import { StepsSection } from '../sections/steps-section'
import { HowItWorksSection } from '../sections/how-it-works-section'
import { WinnersSection } from '../sections/winners-section'
import { TestimonialsSection } from '../sections/testimonials-section'
import { PricingSection } from '../sections/pricing-section'
import { BackingSection } from '../sections/backing-section'
import { MilestoneTimeline } from '../components/ticket-selector'
import { CTASection } from '../sections/cta-section'


export default function LandingPage() {
  return (
    <>
      <SEOHead
        title="RifaLovers — Rifas online con impacto social en Chile"
        description="Participa en rifas online legales y transparentes en Chile. Gana premios increíbles y contribuye a causas solidarias con nuestra comunidad participativa."
        keywords="rifas online, sorteos Chile, rifas con causa social, comunidad participativa, sorteos legales Chile, rifas solidarias"
        ogUrl="/"
      />
      <SchemaOrg organization={DEFAULT_ORGANIZATION} website={DEFAULT_WEBSITE} />
      <HeroSection />
      <TrustBarSection />
      <ProgressFomoSection />
      <section className="px-4 md:px-8 py-4 md:py-14">
        <div className="mx-auto max-w-4xl">
          <MilestoneTimeline />
        </div>
      </section>
      <LiveTickerSection />
      <PricingSection />
      <CountdownSection />
      <SectionDivider />
      <StepsSection />
      <SectionDivider />
      <HowItWorksSection />
      <SectionDivider />
      <BackingSection />
      <SectionDivider />
      <WinnersSection />
      <SectionDivider />
      <TestimonialsSection />
      <CTASection />
    </>
  )
}
