import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw, X } from 'lucide-react'

interface ResetConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  hasWinners: boolean
  raffleTitle?: string
}

export function ResetConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  hasWinners,
  raffleTitle,
}: ResetConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-white">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-500/20">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <DialogTitle className="text-lg font-semibold text-white">
              ¿Reiniciar Sorteo?
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-300 text-sm leading-relaxed">
            {raffleTitle && (
              <span className="block mb-2 font-medium text-white">
                Rifa: {raffleTitle}
              </span>
            )}
            {hasWinners ? (
              <>
                Estás a punto de <strong className="text-red-400">reiniciar el sorteo</strong>. 
                Esto eliminará los ganadores actuales y permitirá volver a sortear.
                <br /><br />
                <span className="text-yellow-400 text-xs">
                  ⚠️ Esta acción no se puede deshacer.
                </span>
              </>
            ) : (
              <>
                Estás a punto de <strong className="text-yellow-400">reiniciar el sorteo</strong>.
                El sorteo volverá a su estado inicial.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto gap-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="w-full sm:w-auto gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <RotateCcw className="w-4 h-4" />
            Sí, Reiniciar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
