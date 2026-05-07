import {FaInstagram,FaTiktok} from 'react-icons/fa'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
        <div className="text-center mb-8">
          <Badge variant="gradient" className="mb-4">COMUNIDAD RIFALOVERS</Badge>
        </div>
        <Card variant="default" className="p-8 md:p-12 text-center gradient-rl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            Vive la experiencia junto a nosotros
          </h2>
          <p className="text-white/80 max-w-lg mx-auto mb-8">
            Síguenos y descubre campañas, lives, entregas reales y experiencias exclusivas para nuestra comunidad.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="secondary" size="lg" className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:border-white/40 hover:text-white">
              <a href={"https://www.instagram.com/rifalovers_cl"} target="_blank" className='inline-flex items-center gap-2'>
                <FaInstagram className="size-4" />
                Instagram
              </a>
            </Button>
            <Button variant="secondary" size="lg" className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:border-white/40 hover:text-white">
              <a href={"https://www.tiktok.com/@rifalovers_cl"} target="_blank" className='inline-flex items-center gap-2'>
                <FaTiktok className="size-4" />
                TikTok
              </a>
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}
