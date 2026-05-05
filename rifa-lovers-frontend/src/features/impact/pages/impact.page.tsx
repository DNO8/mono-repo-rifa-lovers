import { SectionDivider } from '@/components/shared/section-divider'
import { SEOHead } from '@/components/shared/seo/helmet-wrapper'
import { ImpactHeroSection } from '../sections/impact-hero-section'
import { ImpactStepsSection } from '../sections/impact-steps-section'
import { ImpactStatsSection } from '../sections/impact-stats-section'
import { ImpactMilestonesSection } from '../sections/impact-milestones-section'

export default function ImpactPage() {
  return (
    <>
      <SEOHead
        title="Nuestro impacto social"
        description="Descubre el impacto real de RifaLovers. Cada rifa online contribuye a causas solidarias en Chile. Conoce cómo nuestra comunidad participativa transforma vidas."
        canonical="/impacto"
      />
      <ImpactHeroSection />
      <SectionDivider />
      <ImpactStepsSection />
      <ImpactStatsSection />
      <SectionDivider />
      <ImpactMilestonesSection />
    </>
  )
}
