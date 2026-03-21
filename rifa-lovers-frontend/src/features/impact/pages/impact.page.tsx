import { SectionDivider } from '@/components/shared/section-divider'
import { ImpactHeroSection } from '../sections/impact-hero-section'
import { ImpactStepsSection } from '../sections/impact-steps-section'
import { ImpactStatsSection } from '../sections/impact-stats-section'
import { ImpactMilestonesSection } from '../sections/impact-milestones-section'

export default function ImpactPage() {
  return (
    <>
      <ImpactHeroSection />
      <SectionDivider />
      <ImpactStepsSection />
      <ImpactStatsSection />
      <SectionDivider />
      <ImpactMilestonesSection />
    </>
  )
}
