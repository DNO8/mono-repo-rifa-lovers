import { Radio, Hand } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useSelectedRaffle } from '@/context/use-selected-raffle'

export function HeroLiveBadges() {
  const { raffle, progress } = useSelectedRaffle()
  const remaining = raffle && progress ? Math.max(0, raffle.goalPacks - progress.packsSold) : 0

  return (
    <>
      {/* Top-right badge */}
      <div className="absolute top-4 right-4 z-40">
        <Badge variant="gradient" className="text-[10px] px-2 py-0.5 gap-1 cursor-pointer">
          Interactúa con el premio final!
        </Badge>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 inset-x-0 z-40 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1 px-4 py-3 bg-linear-to-t from-black/50 to-transparent">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="size-2 rounded-full bg-error animate-pulse shrink-0" />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/90 truncate">
            Próximo sorteo: Viernes 9PM GMT-4
          </span>
        </div>
        <Badge className="bg-secondary/90 text-white text-[9px] sm:text-xs px-2 py-0.5 border-0 shrink-0">
          <Radio className="size-2.5" />
          Quedan {remaining.toLocaleString('es-CL')} cupos
        </Badge>
      </div>

      {/* Interaction hint */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 hidden sm:flex">
        <p className="flex items-center gap-1.5 text-[10px] sm:text-xs text-white/40">
          <Hand className="size-3.5" />
          Arrastra para rotar · toca los <span className="font-semibold">números</span> para explorar specs
        </p>
      </div>
    </>
  )
}
