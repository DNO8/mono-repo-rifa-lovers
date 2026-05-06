import { Link } from 'react-router'
import { SEOHead } from '@/components/shared/seo/helmet-wrapper'
import { ArrowLeft, FileText, Scale, Shield, Gift, Users, Truck, Lock, Gavel, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const SECTIONS = [
  {
    id: 'identificacion',
    icon: Scale,
    title: '1. Identificación del organizador',
    content:
      'RifaLovers SpA\nRUT: 78.213.688-7\nDomicilio: Huechuraba, Región Metropolitana, Chile.',
  },
  {
    id: 'sobre',
    icon: FileText,
    title: '2. Sobre RifaLovers',
    content:
      'RifaLovers es una plataforma de experiencias promocionales, activaciones comerciales y comunidad digital. La adquisición de productos físicos o digitales puede incluir beneficios promocionales asociados a campañas activas.',
  },
  {
    id: 'productos',
    icon: Gift,
    title: '3. Productos y beneficios promocionales',
    content:
      'Los usuarios podrán adquirir packs físicos y/o digitales ofrecidos por RifaLovers. Algunos productos podrán incluir LuckyPass promocionales asociados a campañas específicas. Los LuckyPass constituyen beneficios promocionales accesorios y no representan una compra independiente ni una apuesta.',
  },
  {
    id: 'participacion',
    icon: Users,
    title: '4. Participación en campañas',
    content:
      'La participación en campañas promocionales estará sujeta a: disponibilidad de stock; vigencia de cada campaña; aceptación de las bases legales respectivas; validación correcta del pago. Cada campaña podrá contar con reglas, hitos y premios específicos.',
  },
  {
    id: 'pagos',
    icon: Shield,
    title: '5. Pagos',
    content:
      'Los pagos podrán realizarse mediante Flow u otros medios habilitados por RifaLovers. La confirmación de participación quedará sujeta a validación efectiva del pago correspondiente.',
  },
  {
    id: 'entrega',
    icon: Truck,
    title: '6. Entrega de premios',
    content:
      'Los premios serán entregados conforme a las bases legales de cada campaña. RifaLovers podrá solicitar validación de identidad antes de efectuar cualquier entrega. En caso de imposibilidad de contacto con el ganador dentro del plazo informado, el premio podrá ser sorteado nuevamente.',
  },
  {
    id: 'transparencia',
    icon: Gavel,
    title: '7. Transparencia',
    content:
      'RifaLovers podrá realizar transmisiones en vivo, publicaciones audiovisuales y difusión de resultados con fines promocionales y de transparencia. Los participantes autorizan la utilización de su nombre e imagen relacionada con campañas y entregas de premios.',
  },
  {
    id: 'responsabilidad',
    icon: AlertCircle,
    title: '8. Responsabilidad del usuario',
    content:
      'El usuario declara entregar información real y válida. RifaLovers no será responsable por errores en datos ingresados por el participante que impidan contacto o entrega de beneficios.',
  },
  {
    id: 'modificaciones',
    icon: Lock,
    title: '9. Modificaciones',
    content:
      'RifaLovers podrá modificar campañas, beneficios, condiciones operativas o aspectos técnicos cuando existan razones fundadas, errores, contingencias técnicas o fuerza mayor. Toda modificación relevante será comunicada mediante canales oficiales.',
  },
  {
    id: 'limitacion',
    icon: Shield,
    title: '10. Limitación de responsabilidad',
    content:
      'RifaLovers no garantiza disponibilidad continua e ininterrumpida de plataformas digitales, pudiendo existir pausas por mantenimiento, mejoras o situaciones ajenas al control de la empresa.',
  },
  {
    id: 'propiedad',
    icon: Lock,
    title: '11. Propiedad intelectual',
    content:
      'Todo contenido, diseño, marca, logos, imágenes y material relacionado con RifaLovers pertenece a RifaLovers SpA o sus respectivos titulares. Queda prohibida su reproducción no autorizada.',
  },
  {
    id: 'contacto',
    icon: Users,
    title: '12. Contacto',
    content:
      'Para consultas, soporte o información oficial, los usuarios podrán comunicarse mediante los canales oficiales de RifaLovers.',
  },
  {
    id: 'aceptacion',
    icon: Scale,
    title: '13. Aceptación',
    content:
      'El acceso, navegación, compra o participación en campañas implica la aceptación íntegra de estos Términos y Condiciones.',
  },
]

export default function TerminosPage() {
  return (
    <>
      <SEOHead
        title="Términos y Condiciones"
        description="Términos y condiciones de RifaLovers. Regula el acceso, navegación, compra y participación en campañas promocionales."
        canonical="/terminos"
      />
    <div className="px-4 md:px-8 py-12 md:py-16">
      <div className="mx-auto max-w-[800px]">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors mb-8">
          <ArrowLeft className="size-4" />
          Volver al inicio
        </Link>

        {/* Header */}
        <div className="mb-10">
          <Badge variant="subtle" className="mb-4">Documento legal</Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight mb-3">
            Términos y Condiciones – RifaLovers
          </h1>
          <p className="text-text-secondary">
            Última actualización: Mayo 2026
          </p>
        </div>

        {/* Intro */}
        <div className="rounded-xl p-4 md:p-5 bg-primary/5 border border-primary/10 mb-8">
          <p className="text-sm text-text-secondary leading-relaxed">
            Bienvenido a RifaLovers. Los presentes Términos y Condiciones regulan el acceso, navegación, compra y participación en las campañas promocionales organizadas por RifaLovers SpA. Al utilizar nuestros canales digitales, adquirir productos o participar en campañas promocionales, el usuario acepta íntegramente estos términos.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <div key={section.id} id={section.id}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-8 rounded-lg bg-bg-muted flex items-center justify-center shrink-0">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-text-primary">{section.title}</h2>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed pl-11 whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 pt-8 border-t border-border-light text-center">
          <p className="text-sm text-text-secondary mb-4">
            ¿Tienes dudas sobre los términos y condiciones? Contáctanos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/contacto">
              <Button variant="outline-primary" size="sm">Contactar</Button>
            </Link>
            <Link to="/">
              <Button variant="primary" size="sm">Participar Ahora</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
