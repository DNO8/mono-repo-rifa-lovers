import { SectionDivider } from '@/components/shared/section-divider'
import { SEOHead } from '@/components/shared/seo/helmet-wrapper'
import { AboutHeroSection } from '../sections/about-hero-section'
import { AboutValuesSection } from '../sections/about-values-section'
import { AboutTeamSection } from '../sections/about-team-section'

export default function AboutPage() {
  return (
    <>
      <SEOHead
        title="Sobre nosotros"
        description="Conoce a RifaLovers. Somos una empresa SpA legalmente constituida en Chile dedicada a rifas online transparentes con impacto social. Respaldados por KRIM Consultores e Innovaxchain."
        canonical="/nosotros"
      />
      <AboutHeroSection />
      <SectionDivider />
      <AboutValuesSection />
      <AboutTeamSection />
    </>
  )
}
