import { Link } from 'react-router'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'
import { SplitText } from '@/components/shared/split-text'

export function CTASection() {
  const sectionRef = useGsapScroll<HTMLElement>()

  return (
    <section
      ref={sectionRef}
      className="px-4 md:px-8 py-16 md:py-24"
    >
      <div className="mx-auto max-w-[800px] text-center glass-medium rounded-2xl p-10 md:p-14">
        <div className="inline-flex items-center gap-2 mb-5 text-primary">
          <Sparkles className="size-5" />
          <span className="text-sm font-bold uppercase tracking-wider">No esperes más</span>
        </div>

        <SplitText
          as="h2"
          className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight mb-4"
          type="words"
          stagger={0.06}
          duration={0.7}
          y={25}
        >
          Tu próximo LuckyPass puede cambiar todo.
        </SplitText>

        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          Cada LuckyPass es una oportunidad para ganar y una acción real de impacto social.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/#pricing">
            <Button variant="primary" size="lg">
              Participar Ahora
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="lg">
              Ver sorteos activos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
