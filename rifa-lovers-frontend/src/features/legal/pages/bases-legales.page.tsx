import { Link } from 'react-router'
import { ArrowLeft, FileText, Scale, Shield, Gift, Users, Truck, Lock, MapPin, Gavel } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const SECTIONS = [
  {
    id: 'organizador',
    icon: Scale,
    title: '1. Organizador',
    content:
      'La presente rifa es organizada por Rifa Lovers SpA, sociedad legalmente constituida en Chile, RUT [por confirmar], con domicilio en [dirección por confirmar]. La empresa cuenta con asesoría legal permanente de KRIM Consultores, representada por Katherynne Moreno Ortiz, Abogada Senior especializada en Derecho Corporativo, Inmobiliario y Data Compliance.',
  },
  {
    id: 'objeto',
    icon: Gift,
    title: '2. Objeto del sorteo',
    content:
      'El sorteo tiene como objetivo principal la entrega de premios tecnológicos y de consumo a los participantes, al mismo tiempo que se destina un porcentaje de los fondos recaudados a causas benéficas, en particular a la Fundación Niño y Cáncer. Los premios incluyen, entre otros: MacBook M5, smartphones, tablets y premios adicionales desbloqueados por la comunidad a través de la escala de hitos.',
  },
  {
    id: 'vigencia',
    icon: FileText,
    title: '3. Vigencia',
    content:
      'La rifa estará vigente desde la fecha de publicación de la misma en la plataforma www.rifalovers.cl hasta la fecha de cierre indicada en cada rifa activa. El sorteo se realizará en la fecha y hora publicadas en la plataforma, en formato de transmisión en vivo verificable.',
  },
  {
    id: 'participacion',
    icon: Users,
    title: '4. Participación',
    content:
      'Podrán participar todas las personas mayores de 18 años residentes en Chile. Para participar, el usuario deberá: (a) crear una cuenta gratuita en la plataforma, (b) adquirir uno o más packs de LuckyPass, y (c) completar el pago a través de los medios habilitados. Cada LuckyPass adquirido otorga un número único e irrepetible dentro de la rifa activa.',
  },
  {
    id: 'mecanica',
    icon: Shield,
    title: '5. Mecánica del sorteo',
    content:
      'El sorteo se realiza en vivo a través de la plataforma de streaming de Rifa Lovers. El proceso es 100% transparente y verificable: se utiliza un algoritmo de selección aleatoria ejecutado en tiempo real ante la audiencia. El sorteo puede contar con la presencia de un notario público para certificar la validez del proceso y los resultados.',
  },
  {
    id: 'premios',
    icon: Gift,
    title: '6. Premios',
    content:
      'Los premios serán los publicados en la plataforma para cada rifa activa. La cantidad y tipo de premios puede variar según el avance de la escala de hitos (milestones). Los premios no son canjeables por dinero en efectivo ni transferibles a terceros salvo indicación expresa del organizador.',
  },
  {
    id: 'ganadores',
    icon: Gavel,
    title: '7. Selección de ganadores',
    content:
      'Los ganadores serán seleccionados de forma aleatoria entre todos los LuckyPass activos al momento del sorteo. Un mismo participante puede ganar más de un premio si posee múltiples LuckyPass seleccionados. Los resultados serán publicados en la plataforma y comunicados directamente a los ganadores por correo electrónico.',
  },
  {
    id: 'entrega',
    icon: Truck,
    title: '8. Entrega de premios',
    content:
      'Los premios serán entregados a todo Chile sin costo adicional para el ganador. La entrega se realizará dentro de los 10 días hábiles siguientes a la confirmación del ganador. El ganador deberá proporcionar sus datos de envío completos y verificar su identidad.',
  },
  {
    id: 'responsabilidades',
    icon: Lock,
    title: '9. Responsabilidades',
    content:
      'El organizador no se hace responsable por problemas técnicos ajenos a la plataforma que impidan la participación. El participante es responsable de mantener actualizados sus datos de contacto. El organizador se reserva el derecho de descalificar a participantes que incurran en conductas fraudulentas.',
  },
  {
    id: 'datos',
    icon: Lock,
    title: '10. Protección de datos personales',
    content:
      'Los datos personales proporcionados por los participantes serán tratados conforme a la Ley N° 19.628 sobre Protección de la Vida Privada y la normativa vigente en Chile. Los datos se utilizarán exclusivamente para la gestión del sorteo, comunicación con los participantes y entrega de premios. Para más información, consulte nuestra Política de Privacidad.',
  },
  {
    id: 'jurisdiccion',
    icon: MapPin,
    title: '11. Jurisdicción',
    content:
      'Las presentes bases legales se rigen por la legislación chilena. Cualquier controversia será resuelta ante los tribunales ordinarios de justicia de Santiago de Chile.',
  },
]

export default function BasesLegalesPage() {
  return (
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
            Bases Legales del Sorteo
          </h1>
          <p className="text-text-secondary">
            Última actualización: {new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
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
  )
}
