import { useEffect, useState } from 'react'
import { Timer, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useActiveRaffle } from '@/hooks/use-raffles'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calcTimeLeft(targetMs: number): TimeLeft {
  const diff = Math.max(0, targetMs - Date.now())
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <span className="block text-4xl sm:text-5xl md:text-6xl font-extrabold text-text-primary tracking-tight leading-none">
        {value}
      </span>
      <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-tertiary mt-1">
        {label}
      </span>
    </div>
  )
}

function Dot() {
  return (
    <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-tertiary select-none leading-none">
      ·
    </span>
  )
}

export function CountdownSection() {
  const { raffle, isLoading } = useActiveRaffle()
  const [time, setTime] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  const targetMs = raffle?.endDate ? new Date(raffle.endDate).getTime() : null

  useEffect(() => {
    if (targetMs === null) return
    const tick = () => setTime(calcTimeLeft(targetMs))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetMs])

  return (
    <section className="py-8 md:py-12 px-4 md:px-8 border-y border-border-light bg-bg-white/60">
      <div className="mx-auto max-w-[900px]">
        <p className="text-center text-sm text-text-secondary mb-5">
          <Timer className="size-3.5 inline mr-1 -mt-0.5" />
          Faltan para el próximo sorteo en vivo
        </p>

        {/* Timer blocks */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 md:gap-8 mb-5">
          <TimeBlock value={isLoading || targetMs === null ? '--' : pad(time.days)} label="Días" />
          <Dot />
          <TimeBlock value={isLoading || targetMs === null ? '--' : pad(time.hours)} label="Horas" />
          <Dot />
          <TimeBlock value={isLoading || targetMs === null ? '--' : pad(time.minutes)} label="Minutos" />
          <Dot />
          <TimeBlock value={isLoading || targetMs === null ? '--' : pad(time.seconds)} label="Segundos" />
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              <span className="text-base">🧑🏻</span>
              <span className="text-base">👩🏽</span>
              <span className="text-base">🧑🏼</span>
              <span className="text-base">👩🏻</span>
            </div>
            <span className="text-xs text-text-tertiary">
              <Users className="size-3 inline mr-0.5" />
              Miles de personas ya participando en tiempo real
            </span>
          </div>
          <Badge variant="gradient" className="text-xs px-3 py-1 gap-1 shrink-0">
            Últimos LuckyPass disponibles
          </Badge>
        </div>
      </div>
    </section>
  )
}
