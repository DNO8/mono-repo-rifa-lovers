import { Heart } from 'lucide-react'

interface SocialImpactBannerProps {
  paidCount?: number
}

export function SocialImpactBanner({
  paidCount = 0,
}: SocialImpactBannerProps) {
  const message = paidCount > 0
    ? `Has ayudado a ${paidCount} ${paidCount === 1 ? 'familia' : 'familias'} con tus compras.`
    : 'Tu primera compra ayudará a una familia. ¡Participa en una rifa!'

  return (
    <div className="gradient-rl rounded-2xl p-5 text-white">
      <div className="flex items-center gap-1.5 mb-2">
        <Heart className="size-3.5 opacity-80" />
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
          Tu impacto social:
        </span>
      </div>
      <p className="text-sm font-semibold leading-snug">{message}</p>
    </div>
  )
}
