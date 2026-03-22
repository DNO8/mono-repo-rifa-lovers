import { Heart } from 'lucide-react'

interface SocialImpactBannerProps {
  message?: string
}

export function SocialImpactBanner({
  message = 'Has ayudado a 12 familias este mes.',
}: SocialImpactBannerProps) {
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
