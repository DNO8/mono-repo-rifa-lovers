import { useNavigate } from 'react-router'
import { ArrowLeft, ArrowRight, Gift, Heart, Sparkles, CheckCircle } from 'lucide-react'
import { Link } from 'react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useActiveRaffle } from '@/hooks/use-raffles'
import { usePacks } from '@/hooks/use-packs'
import { useAuthStore } from '@/stores/auth.store'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'react-toastify'

interface PackMomCardProps {
  name: string
  price: number
  originalPrice: number
  tickets: number
  giftName: string
  giftUrl: string
  giftDescription: string
  popular?: boolean
  packId?: string
  raffleId?: string
  isAuthenticated: boolean
  navigate: ReturnType<typeof useNavigate>
}

function PackMomCard({
  name,
  price,
  originalPrice,
  tickets,
  giftName,
  giftUrl,
  giftDescription,
  popular = false,
  packId,
  raffleId,
  isAuthenticated,
  navigate,
}: PackMomCardProps) {
  const handleBuy = () => {
    console.log('Button clicked - packId:', packId, 'raffleId:', raffleId)
    if (!packId || !raffleId) {
      toast.error('No se puede procesar la compra. Pack o rifa no disponibles.')
      return
    }
    const checkoutUrl = `/checkout?raffle=${raffleId}&packId=${packId}`
    if (isAuthenticated) {
      navigate(checkoutUrl)
    } else {
      navigate(`/login?redirect=${encodeURIComponent(checkoutUrl)}`)
    }
  }

  return (
    <Card
      variant={popular ? 'glass' : 'glass-light'}
      className="relative p-6 md:p-8 glass-hover flex flex-col"
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="gradient">
            <Sparkles className="size-3" />
            Más Elegido
          </Badge>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-text-primary mb-1">{name}</h3>
        <p className="text-sm text-text-secondary">
          LuckyPass + Regalo exclusivo SYS
        </p>
      </div>

      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-3">
          <span className="text-2xl text-text-tertiary line-through">
            ${originalPrice.toLocaleString('es-CL')}
          </span>
          <span className="text-5xl md:text-6xl font-extrabold text-text-primary">
            ${price.toLocaleString('es-CL')}
          </span>
        </div>
        <p className="text-text-secondary mt-1 text-sm">IVA incluido</p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-2 text-sm text-text-secondary">
          <CheckCircle className="size-4 text-success shrink-0 mt-0.5" />
          <span>
            <strong className="text-text-primary">{tickets} LuckyPass</strong> para participar en la rifa
          </span>
        </div>
        <div className="flex items-start gap-2 text-sm text-text-secondary">
          <Gift className="size-4 text-primary shrink-0 mt-0.5" />
          <span>
            <strong className="text-text-primary">Regalo:</strong>{' '}
            <a
              href={giftUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {giftName}
            </a>
          </span>
        </div>
        <div className="flex items-start gap-2 text-sm text-text-secondary">
          <Heart className="size-4 text-secondary shrink-0 mt-0.5" />
          <span>{giftDescription}</span>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <Button
          variant={popular ? 'primary' : 'secondary'}
          size="lg"
          className="w-full cursor-pointer"
          onClick={handleBuy}
        >
          Activar {name}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </Card>
  )
}

export default function PackMomPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { raffle, isLoading: raffleLoading } = useActiveRaffle()
  const { packs, isLoading: packsLoading } = usePacks()

  const isLoading = raffleLoading || packsLoading

  const momPack = packs.find((p) => p.name?.toUpperCase() === 'MOM HOME EXPERIENCE')
  const momPremiumPack = packs.find(
    (p) => p.name?.toUpperCase() === 'MOM SKIN RITUAL'
  )


  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 py-12 md:py-20">
      <div className="mx-auto max-w-[1000px]">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="size-4" />
          Volver al inicio
        </Link>

        {/* Hero */}
        <div className="text-center mb-12">
          <Badge variant="gradient" className="mb-4">
            <Heart className="size-3" />
            Alianza Exclusiva
          </Badge>
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary tracking-tight">
              Pack{' '}
              <span className="gradient-text">Mom</span>
            </h1>
            <img
              src="/partners/logo-sys.svg"
              alt="Laboratorio SYS"
              className="h-10 md:h-14 inline-block"
            />
          </div>
          <p className="text-lg text-text-secondary max-w-lg mx-auto">
            Participa en la rifa y recibe un pack de regalo exclusivo de Laboratorio SYS.
            Tu LuckyPass + cuidado real.
          </p>
        </div>

        {/* Pack Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
          <PackMomCard
            name="Mom Home Experience"
            price={momPack?.price ?? 19900}
            originalPrice={23800}
            tickets={momPack?.luckyPassQuantity ?? 1}
            giftName="Pack Home Experience"
            giftUrl="https://www.laboratoriosys.cl/"
            giftDescription="Cochecito aromático, Mikado frutos rojos 50ml, Crema de manos castaña, Jabón líquido hidratante de regalo."
            packId={momPack?.id}
            raffleId={raffle?.id}
            isAuthenticated={isAuthenticated}
            navigate={navigate}
          />
          <PackMomCard
            name="Mom Skin Ritual"
            price={momPremiumPack?.price ?? 39800}
            originalPrice={46800}
            tickets={momPremiumPack?.luckyPassQuantity ?? 3}
            giftName="Pack Skin Ritual"
            giftUrl="https://www.laboratoriosys.cl/"
            giftDescription="Crema facial Labnatur, Serum facial Labnatur, Crema de manos Labnatur, Bálsamo labial de regalo."
            popular
            packId={momPremiumPack?.id}
            raffleId={raffle?.id}
            isAuthenticated={isAuthenticated}
            navigate={navigate}
          />
        </div>

        {/* Trust */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
            <CheckCircle className="size-4 text-success" />
            Pago 100% seguro con Flow
          </div>
        </div>
      </div>
    </div>
  )
}
