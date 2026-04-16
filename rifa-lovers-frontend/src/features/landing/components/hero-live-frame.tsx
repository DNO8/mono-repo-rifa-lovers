import { Radio, Play } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useActiveRaffle } from '@/hooks/use-raffles'

export function HeroLiveFrame({ children }: { children: React.ReactNode }) {
  const { raffle, progress } = useActiveRaffle()
  const remaining = raffle && progress ? Math.max(0, raffle.goalPacks - progress.packsSold) : 0
  return (
    <div className="relative group">
      {/* Animated glowing border */}
      <div className="absolute -inset-[2px] rounded-2xl overflow-hidden">
        <div className="absolute inset-0 animate-border-spin bg-[conic-gradient(from_0deg,#7B3FE4,#FF4DA6,#FF8A3D,#7B3FE4)]" />
      </div>

      {/* Inner container */}
      <div className="relative rounded-2xl bg-bg-dark overflow-hidden">
        {/* Top bar — live overlay */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-end px-3 py-2 bg-linear-to-b from-black/60 to-transparent">
          <Badge variant="gradient" className="text-[10px] px-2 py-0.5 gap-1 cursor-pointer">
            Entrar al Live
            <Play className="size-2.5" />
          </Badge>
        </div>

        {/* 3D Model area */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Bottom bar — next draw info */}
        <div className="absolute bottom-0 inset-x-0 z-20 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1 px-3 py-2 bg-linear-to-t from-black/70 to-transparent">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="size-2 rounded-full bg-error animate-pulse shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/90 truncate">
              Próximo sorteo: Viernes 9PM GMT-4
            </span>
          </div>
          <Badge className="bg-secondary/90 text-white text-[9px] sm:text-[10px] px-2 py-0.5 border-0 shrink-0">
            <Radio className="size-2.5" />
            Quedan {remaining.toLocaleString('es-CL')} cupos
          </Badge>
        </div>
      </div>
    </div>
  )
}
