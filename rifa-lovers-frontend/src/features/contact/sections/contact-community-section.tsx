import { MessageCircle, Instagram } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useGsapScroll } from '@/hooks/use-gsap-scroll'

export function ContactCommunitySection() {
  const sectionRef = useGsapScroll<HTMLElement>({ stagger: 0.12 })

  return (
    <section
      ref={sectionRef}
      data-gsap-stagger
      className="px-4 md:px-8 py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1200px]">
        <Card variant="default" className="p-8 md:p-12 text-center gradient-rl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            Únete a nuestra comunidad
          </h2>
          <p className="text-white/80 max-w-lg mx-auto mb-8">
            Conéctate con otros participantes, entérate primero de los sorteos
            y comparte la experiencia RifaLovers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="secondary" size="lg" className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:border-white/40 hover:text-white">
              <MessageCircle className="size-4" />
              Discord
            </Button>
            <Button variant="secondary" size="lg" className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:border-white/40 hover:text-white">
              <Instagram className="size-4" />
              Instagram
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}
