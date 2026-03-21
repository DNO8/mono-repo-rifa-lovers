import { Eye, Heart, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import { SplitText } from '@/components/shared/split-text'

const VALUES = [
  {
    id: 'transparency',
    icon: Eye,
    title: 'Transparencia Total',
    description:
      'Sorteos en vivo, resultados verificables y cada peso destinado a impacto visible. Sin letra chica, sin trucos.',
    color: '#7B3FE4',
    bgColor: 'rgba(123, 63, 228, 0.1)',
  },
  {
    id: 'impact',
    icon: Heart,
    title: 'Impacto Real',
    description:
      'Cada participación genera cambios concretos: becas, tecnología para escuelas y apoyo a comunidades vulnerables.',
    color: '#FF4DA6',
    bgColor: 'rgba(255, 77, 166, 0.1)',
  },
  {
    id: 'community',
    icon: Users,
    title: 'Comunidad',
    description:
      'Más de 8.000 personas ya participan activamente. Juntos construimos algo más grande que un sorteo.',
    color: '#FF8A3D',
    bgColor: 'rgba(255, 138, 61, 0.1)',
  },
]

export function AboutValuesSection() {
  const sectionRef = useGsapScroll<HTMLElement>({ stagger: 0.15 })

  return (
    <section
      ref={sectionRef}
      data-gsap-stagger
      className="px-4 md:px-8 py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="text-center mb-12 md:mb-16">
          <Badge variant="subtle" className="mb-4">Nuestros valores</Badge>
          <SplitText
            as="h2"
            className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight"
            type="words"
            stagger={0.05}
            duration={0.6}
          >
            En qué creemos
          </SplitText>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VALUES.map((value) => {
            const IconComponent = value.icon
            return (
              <Card
                key={value.id}
                variant="glass"
                className="p-8 glass-hover cursor-pointer text-center"
              >
                <div
                  className="size-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ backgroundColor: value.bgColor }}
                >
                  <IconComponent className="size-7" style={{ color: value.color }} />
                </div>

                <h3 className="text-lg font-bold text-text-primary mb-2">{value.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{value.description}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
