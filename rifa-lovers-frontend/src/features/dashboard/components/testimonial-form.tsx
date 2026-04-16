import { useState } from 'react'
import type { FormEvent } from 'react'
import { Star, CheckCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { createTestimonial } from '@/api/testimonials.api'
import { cn } from '@/lib/utils'

interface TestimonialFormProps {
  raffleId: string
  luckyPassId: string
}

export function TestimonialForm({ raffleId, luckyPassId }: TestimonialFormProps) {
  const [text, setText] = useState('')
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) {
      toast.error('Escribe algo antes de enviar')
      return
    }
    setSubmitting(true)
    try {
      await createTestimonial({ raffleId, luckyPassId, text, rating })
      setSubmitted(true)
      toast.success('Testimonio enviado. Lo revisaremos pronto.')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al enviar')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle className="size-10 text-green-500" />
        <p className="font-semibold text-green-800">Testimonio enviado</p>
        <p className="text-xs text-yellow-700/70">Será revisado antes de publicarse.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                'size-6 transition-colors',
                star <= (hoveredRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-yellow-200 fill-yellow-100'
              )}
            />
          </button>
        ))}
        <span className="ml-2 text-xs text-yellow-700 font-medium">{rating}/5</span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Cuenta tu experiencia como ganador..."
        rows={3}
        maxLength={500}
        className="w-full rounded-xl border border-yellow-200 bg-white/80 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-yellow-300 resize-none"
      />

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-yellow-600/60">{text.length}/500</span>
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={submitting}
          disabled={submitting || !text.trim()}
        >
          Enviar testimonio
        </Button>
      </div>
    </form>
  )
}
