import { Link } from 'react-router'
import { SEOHead } from '@/components/shared/seo/helmet-wrapper'
import { ArrowLeft, FileText, Scale, Shield, Gift, Users, Truck, Lock, Gavel } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const SECTIONS = [
  {
    id: 'organizador',
    icon: Scale,
    title: '1. Organizador',
    content:
      'La presente campaña promocional es organizada por RifaLovers SpA.',
  },
  {
    id: 'nombre',
    icon: FileText,
    title: '2. Nombre de la campaña',
    content:
      '"Pack Mom RifaLovers – Edición Lanzamiento".',
  },
  {
    id: 'vigencia',
    icon: FileText,
    title: '3. Vigencia',
    content:
      'La campaña estará vigente hasta completar un máximo de 300 packs vendidos o hasta la fecha que RifaLovers informe oficialmente en sus canales digitales.',
  },
  {
    id: 'mecanica',
    icon: Shield,
    title: '4. Mecánica de la campaña',
    content:
      'Las personas que adquieran un Pack Mom participante durante la vigencia de la campaña recibirán uno o 3 LuckyPass promocional (según pack adquirido) asociado a esta activación. La campaña contempla hitos progresivos de desbloqueo de premios según la cantidad de packs efectivamente vendidos.',
  },
  {
    id: 'premios',
    icon: Gift,
    title: '5. Premios y hitos',
    content:
      'La campaña contempla la entrega de las siguientes Gift Cards: Al alcanzar 100 packs vendidos: 🎁 1 Gift Card de $100.000 CLP. Al alcanzar 200 packs vendidos: 🎁 1 Gift Card de $100.000 CLP. Al alcanzar 300 packs vendidos: 🎁 1 Gift Card de $100.000 CLP. Cada premio será sorteado únicamente una vez alcanzado el respectivo hito de ventas.',
  },
  {
    id: 'sorteos',
    icon: Gavel,
    title: '6. Sorteos',
    content:
      'Cada sorteo será realizado en vivo mediante las plataformas oficiales de RifaLovers. La fecha y hora de cada live serán informadas previamente a través de redes sociales y canales oficiales.',
  },
  {
    id: 'participantes',
    icon: Users,
    title: '7. Participantes y ganadores',
    content:
      'Participarán en cada sorteo todos los LuckyPass válidamente emitidos hasta el momento del cierre del respectivo hito. Cada participante podrá ganar solo una vez durante la campaña.',
  },
  {
    id: 'entrega',
    icon: Truck,
    title: '8. Entrega de premios',
    content:
      'Los ganadores serán contactados vía WhatsApp, correo electrónico o redes sociales. Los premios podrán ser entregados mediante transferencia bancaria, gift card digital o mecanismo equivalente definido por RifaLovers. Para hacer efectiva la entrega, el ganador deberá acreditar su identidad dentro de un plazo máximo de 7 días corridos desde el contacto oficial. En caso de no respuesta, RifaLovers podrá efectuar un nuevo sorteo.',
  },
  {
    id: 'transparencia',
    icon: Shield,
    title: '9. Transparencia y difusión',
    content:
      'Los sorteos y entregas podrán ser grabados y difundidos por RifaLovers con fines promocionales, de transparencia y generación de contenido. Los participantes autorizan el uso de nombre, imagen y registro audiovisual relacionado con la entrega del premio.',
  },
  {
    id: 'modificaciones',
    icon: Lock,
    title: '10. Modificaciones',
    content:
      'RifaLovers podrá modificar aspectos operativos de la campaña por razones técnicas, fuerza mayor o situaciones que afecten el correcto funcionamiento de la promoción. Toda modificación será informada oportunamente mediante los canales oficiales.',
  },
  {
    id: 'aceptacion',
    icon: Scale,
    title: '11. Aceptación de las bases',
    content:
      'La participación en esta campaña implica el conocimiento y aceptación íntegra de las presentes bases legales.',
  },
]

export default function BasesLegalesPage() {
  return (
    <>
      <SEOHead
        title="Bases legales"
        description="Bases legales de los sorteos y rifas online de RifaLovers. Sorteos legales y transparentes en Chile con asesoría jurídica profesional."
        canonical="/bases-legales"
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
            Bases Legales – Campaña Promocional RifaLovers
          </h1>
          <p className="text-text-secondary">
            Pack Mom RifaLovers – Edición Lanzamiento
          </p>
        </div>

        {/* Legal notice */}
        <div className="rounded-xl p-4 md:p-5 bg-primary/5 border border-primary/10 mb-8">
          <div className="flex items-start gap-3">
            <Scale className="size-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-text-primary text-sm mb-1">Asesoría legal</p>
              <p className="text-sm text-text-secondary">
                Estas bases legales han sido revisadas y aprobadas por <strong>Katherynne Moreno Ortiz</strong>,
                Abogada Senior de <strong>KRIM Consultores</strong>, especializada en Derecho Corporativo,
                Inmobiliario y Data Compliance.
              </p>
            </div>
          </div>
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
                <p className="text-sm text-text-secondary leading-relaxed pl-11">
                  {section.content}
                </p>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 pt-8 border-t border-border-light text-center">
          <p className="text-sm text-text-secondary mb-4">
            ¿Tienes dudas sobre las bases legales? Contáctanos.
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
