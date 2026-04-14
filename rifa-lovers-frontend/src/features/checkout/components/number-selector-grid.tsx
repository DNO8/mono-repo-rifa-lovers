import { useEffect, useRef, useState, useCallback } from 'react'
import { Shuffle, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { checkTicketAvailability } from '@/api/purchases.api'
import { cn } from '@/lib/utils'

type SlotStatus = 'idle' | 'checking' | 'available' | 'taken' | 'duplicate'

interface SlotState {
  value: number | ''
  status: SlotStatus
}

interface NumberSelectorGridProps {
  count: number
  maxNumber: number
  raffleId: string
  onChange: (numbers: (number | '')[]) => void
  onValidityChange: (allValid: boolean) => void
}

export function NumberSelectorGrid({
  count,
  maxNumber,
  raffleId,
  onChange,
  onValidityChange,
}: NumberSelectorGridProps) {
  const [slots, setSlots] = useState<SlotState[]>(() =>
    Array.from({ length: count }, () => ({ value: '' as number | '', status: 'idle' as SlotStatus })),
  )
  const debounceTimers = useRef<(ReturnType<typeof setTimeout> | null)[]>(
    Array.from({ length: count }, () => null),
  )

  // Resize slots array if count changes
  useEffect(() => {
    setSlots((prev) => {
      if (prev.length === count) return prev
      const next = Array.from({ length: count }, (_, i) =>
        prev[i] ?? ({ value: '', status: 'idle' } as SlotState),
      )
      return next
    })
    debounceTimers.current = Array.from({ length: count }, (_, i) => debounceTimers.current[i] ?? null)
  }, [count])

  // Notify parent whenever slots change
  useEffect(() => {
    onChange(slots.map((s) => s.value))

    const filledSlots = slots.filter((s) => s.value !== '')
    // Empty slots → backend assigns sequentially (always allowed)
    // Filled slots → all must be available (not taken / checking / duplicate)
    const allAvailable = filledSlots.every((s) => s.status === 'available')
    onValidityChange(allAvailable)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots])

  const checkSlot = useCallback(
    async (index: number, value: number, currentSlots: SlotState[]) => {
      // Check duplicate within own inputs
      const otherValues = currentSlots
        .filter((_, i) => i !== index)
        .map((s) => s.value)
      if (otherValues.includes(value)) {
        setSlots((prev) => {
          const next = [...prev]
          next[index] = { value, status: 'duplicate' }
          return next
        })
        return
      }

      setSlots((prev) => {
        const next = [...prev]
        next[index] = { value, status: 'checking' }
        return next
      })

      try {
        const { available } = await checkTicketAvailability(raffleId, value)
        setSlots((prev) => {
          const next = [...prev]
          // Re-check duplicate after async (another slot may have been set meanwhile)
          const otherVals = next.filter((_, i) => i !== index).map((s) => s.value)
          const status: SlotStatus = otherVals.includes(value)
            ? 'duplicate'
            : available
            ? 'available'
            : 'taken'
          next[index] = { value, status }
          return next
        })
      } catch {
        setSlots((prev) => {
          const next = [...prev]
          next[index] = { value, status: 'idle' }
          return next
        })
      }
    },
    [raffleId],
  )

  const handleChange = (index: number, raw: string) => {
    if (debounceTimers.current[index]) clearTimeout(debounceTimers.current[index]!)

    if (raw === '') {
      setSlots((prev) => {
        const next = [...prev]
        next[index] = { value: '', status: 'idle' }
        return next
      })
      return
    }

    const num = parseInt(raw, 10)
    if (isNaN(num) || num < 1 || num > maxNumber) return

    setSlots((prev) => {
      const next = [...prev]
      next[index] = { value: num, status: 'checking' }
      return next
    })

    debounceTimers.current[index] = setTimeout(() => {
      setSlots((current) => {
        checkSlot(index, num, current)
        return current
      })
    }, 400)
  }

  const handleRandom = (index: number) => {
    if (debounceTimers.current[index]) clearTimeout(debounceTimers.current[index]!)

    const used = slots.filter((_, i) => i !== index).map((s) => s.value).filter((v) => v !== '')
    let num: number
    let attempts = 0
    do {
      num = Math.floor(Math.random() * maxNumber) + 1
      attempts++
    } while (used.includes(num) && attempts < 50)

    setSlots((prev) => {
      const next = [...prev]
      next[index] = { value: num, status: 'checking' }
      return next
    })

    debounceTimers.current[index] = setTimeout(() => {
      setSlots((current) => {
        checkSlot(index, num, current)
        return current
      })
    }, 400)
  }

  const handleRandomAll = () => {
    const used: number[] = []
    const newSlots: SlotState[] = slots.map(() => {
      let num: number
      let attempts = 0
      do {
        num = Math.floor(Math.random() * maxNumber) + 1
        attempts++
      } while (used.includes(num) && attempts < 100)
      used.push(num)
      return { value: num, status: 'checking' as SlotStatus }
    })
    setSlots(newSlots)

    newSlots.forEach((slot, index) => {
      if (debounceTimers.current[index]) clearTimeout(debounceTimers.current[index]!)
      debounceTimers.current[index] = setTimeout(() => {
        setSlots((current) => {
          checkSlot(index, slot.value as number, current)
          return current
        })
      }, 400 + index * 100)
    })
  }

  const statusIcon = (status: SlotStatus) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="size-4 text-text-tertiary animate-spin" />
      case 'available':
        return <CheckCircle className="size-4 text-success" />
      case 'taken':
        return <XCircle className="size-4 text-destructive" />
      case 'duplicate':
        return <XCircle className="size-4 text-warning" />
      default:
        return null
    }
  }

  const statusLabel = (status: SlotStatus, value: number | '') => {
    if (value === '') return null
    switch (status) {
      case 'checking': return <span className="text-xs text-text-tertiary">Verificando…</span>
      case 'available': return <span className="text-xs text-success font-medium">#{String(value).padStart(5, '0')} disponible</span>
      case 'taken': return <span className="text-xs text-destructive font-medium">#{String(value).padStart(5, '0')} ya está tomado</span>
      case 'duplicate': return <span className="text-xs text-warning font-medium">Número repetido</span>
      default: return <span className="text-xs text-text-tertiary">#{String(value).padStart(5, '0')}</span>
    }
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-text-primary">
          Elige tus {count} número{count > 1 ? 's' : ''} de la suerte
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRandomAll}
          className="text-xs gap-1.5 h-7 px-2.5"
          type="button"
        >
          <Shuffle className="size-3" />
          Todos al azar
        </Button>
      </div>

      {/* Slots */}
      {slots.map((slot, index) => (
        <div key={index} className="space-y-1">
          <div className="flex gap-2 items-center">
            <span className="text-xs text-text-tertiary w-5 shrink-0 text-right">#{index + 1}</span>
            <div className="relative flex-1">
              <input
                type="number"
                min={1}
                max={maxNumber}
                value={slot.value}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder={`Ej: ${Math.floor(Math.random() * maxNumber) + 1}`}
                className={cn(
                  'w-full h-11 px-4 pr-10 rounded-xl border bg-white text-text-primary text-base font-bold',
                  'placeholder:text-text-tertiary placeholder:font-normal',
                  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors',
                  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                  slot.status === 'available' && 'border-success/50 focus:ring-success/20 focus:border-success',
                  slot.status === 'taken' && 'border-destructive/50 focus:ring-destructive/20 focus:border-destructive',
                  slot.status === 'duplicate' && 'border-warning/50',
                  slot.status === 'idle' || slot.status === 'checking' ? 'border-border' : '',
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {statusIcon(slot.status)}
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleRandom(index)}
              className="shrink-0 h-11 px-3"
              type="button"
            >
              <Shuffle className="size-3.5" />
            </Button>
          </div>
          <div className="pl-8">
            {statusLabel(slot.status, slot.value)}
          </div>
        </div>
      ))}

      <p className="text-xs text-text-tertiary pt-1">
        Rango: 1 — {maxNumber.toLocaleString('es-CL')} · Puedes dejar en blanco para asignación automática
      </p>
    </div>
  )
}
