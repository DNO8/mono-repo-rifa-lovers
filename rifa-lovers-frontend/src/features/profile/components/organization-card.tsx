import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { createOperatorOrganization } from '@/api/operator.api'

interface OrganizationCardProps {
  hasOrganization: boolean
  organizationName?: string | null
  onCreated?: () => void
}

export function OrganizationCard({ hasOrganization, organizationName, onCreated }: OrganizationCardProps) {
  const [orgName, setOrgName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgName.trim()) return
    setIsLoading(true)
    try {
      await createOperatorOrganization({ name: orgName.trim() })
      toast.success('Empresa creada correctamente')
      onCreated?.()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear la empresa')
    } finally {
      setIsLoading(false)
    }
  }

  if (hasOrganization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Empresa registrada: <strong className="text-text-primary">{organizationName || '—'}</strong>
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Configura tu empresa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Para acceder al panel de operador, primero debes registrar el nombre de tu empresa.
        </p>
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la empresa *</label>
            <input
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
              placeholder="Ej: Mi Empresa SPA"
            />
          </div>
          <Button type="submit" variant="primary" loading={isLoading}>
            Crear Empresa
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
