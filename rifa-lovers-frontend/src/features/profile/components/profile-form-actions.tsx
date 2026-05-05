import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProfileFormActionsProps {
  isLoading: boolean
  onCancel: () => void
}

export function ProfileFormActions({ isLoading, onCancel }: ProfileFormActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
      <Button
        type="button"
        variant="outline-primary"
        className="w-full sm:w-auto justify-center"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        variant="primary"
        className="w-full sm:w-auto justify-center"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Guardando...
          </span>
        ) : (
          <>
            <Save className="size-4 mr-1.5" />
            Guardar cambios
          </>
        )}
      </Button>
    </div>
  )
}
