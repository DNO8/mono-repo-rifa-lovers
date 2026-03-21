import { SectionDivider } from '@/components/shared/section-divider'
import { AboutHeroSection } from '../sections/about-hero-section'
import { AboutValuesSection } from '../sections/about-values-section'
import { AboutTeamSection } from '../sections/about-team-section'

export default function AboutPage() {
  return (
    <>
      <AboutHeroSection />
      <SectionDivider />
      <AboutValuesSection />
      <AboutTeamSection />
    </>
  )
}
