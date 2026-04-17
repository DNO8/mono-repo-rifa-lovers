import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Waves } from 'lucide-react'
import type { CustomerDrawParticipant } from '@/types/streaming.types'

interface NumeroAguaModalProps {
  isOpen: boolean
  onClose: () => void
  participant?: CustomerDrawParticipant | null
  passNumber?: number | null
}

export function NumeroAguaModal({ isOpen, onClose, participant, passNumber }: NumeroAguaModalProps) {
  const displayName = participant?.firstName && participant?.lastName 
    ? `${participant.firstName} ${participant.lastName}`
    : participant?.firstName || participant?.email || 'Usuario desconocido'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-bg-card border-border text-white max-w-md">
        <DialogHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="size-6 text-blue-500" />
            <h2 className="text-xl font-bold">Número al Agua</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-text-secondary hover:text-white"
          >
            <X className="size-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500 mb-4">
              <Waves className="size-8 text-blue-500" />
            </div>
            
            <p className="text-lg font-medium mb-2">
              El ticket <span className="text-blue-400 font-bold">#{passNumber}</span> salió al agua
            </p>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge variant="subtle" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                {displayName}
              </Badge>
            </div>
            
            <p className="text-sm text-text-secondary">
              Este participante ya no estará en el sorteo
            </p>
          </div>

          <div className="flex justify-center pt-4">
            <Button onClick={onClose} className="bg-blue-500 hover:bg-blue-600">
              Continuar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
