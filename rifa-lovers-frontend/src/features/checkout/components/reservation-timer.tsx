import { useEffect, useState } from 'react'
import { Clock, AlertTriangle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReservationTimerProps {
  expiresAt: string
  onExpired: () => void
}

function getSecondsLeft(expiresAt: string): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function ReservationTimer({ expiresAt, onExpired }: ReservationTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsLeft(expiresAt))

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getSecondsLeft(expiresAt)
      setSecondsLeft(remaining)
      if (remaining === 0) {
        clearInterval(interval)
        onExpired()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onExpired])

  const isWarning = secondsLeft <= 180 && secondsLeft > 60
  const isCritical = secondsLeft <= 60

  const Icon = isCritical ? XCircle : isWarning ? AlertTriangle : Clock

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
        isCritical
          ? 'border-destructive/40 bg-destructive/10 text-destructive'
          : isWarning
          ? 'border-warning/40 bg-warning/10 text-warning'
          : 'border-primary/30 bg-primary/5 text-primary',
      )}
      role="timer"
      aria-live="polite"
    >
      <Icon
        className={cn(
          'size-4 shrink-0',
          isCritical && 'animate-pulse',
        )}
      />
      <span className="flex-1">
        Números reservados para ti — tiempo restante:
      </span>
      <span
        className={cn(
          'tabular-nums font-bold text-base',
          isCritical && 'animate-pulse',
        )}
      >
        {formatTime(secondsLeft)}
      </span>
    </div>
  )
}
