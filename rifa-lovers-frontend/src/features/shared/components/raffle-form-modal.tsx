import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toastError } from '@/lib/errors'
import { toUTC, parseInitialDateTime } from '@/lib/utils'
import type { RaffleWithStats } from '@/api/admin.api'

interface RaffleFormModalProps {
  initial?: Partial<RaffleWithStats>
  onClose: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<void>
}

export function RaffleFormModal({ initial, onClose, onSubmit }: RaffleFormModalProps) {
  const initialStart = parseInitialDateTime(initial?.startDate)
  const initialEnd = parseInitialDateTime(initial?.endDate)

  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    goalPacks: initial?.goalPacks?.toString() || '',
    maxTicketNumber: initial?.goalPacks ? '30000' : '30000',
    startDate: initialStart.date,
    startTime: initialStart.time || '00:00',
    endDate: initialEnd.date,
    endTime: initialEnd.time || '23:59',
  })
  const [prizes, setPrizes] = useState<{ name: string; description: string }[]>([
    { name: '', description: '' },
  ])
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const filteredPrizes = prizes
        .map(p => ({ name: p.name.trim(), description: p.description.trim() || undefined }))
        .filter(p => p.name.length > 0)

      if (filteredPrizes.length === 0) {
        throw new Error('Debe incluir al menos un premio con nombre')
      }

      await onSubmit({
        title: form.title,
        description: form.description || undefined,
        goalPacks: parseInt(form.goalPacks, 10),
        maxTicketNumber: parseInt(form.maxTicketNumber, 10) || 30000,
        startDate: toUTC(form.startDate, form.startTime),
        endDate: toUTC(form.endDate, form.endTime),
        prizes: filteredPrizes,
      })
      onClose()
    } catch (err: unknown) {
      toastError(err, undefined, 'Error al guardar los cambios. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold">{initial?.id ? 'Editar Rifa' : 'Nueva Rifa'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titulo *</label>
            <input
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Ej: Rifa Benefica de Verano"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
            <textarea
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe la rifa y su proposito..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta (packs) *</label>
            <input
              required
              type="number"
              min={1}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={form.goalPacks}
              onChange={e => setForm(f => ({ ...f, goalPacks: e.target.value }))}
              placeholder="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numero maximo de tickets</label>
            <input
              type="number"
              min={1}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={form.maxTicketNumber}
              onChange={e => setForm(f => ({ ...f, maxTicketNumber: e.target.value }))}
              placeholder="30000"
            />
          </div>
          {/* Premios */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Premios *</label>
              <button
                type="button"
                className="text-xs text-primary font-medium hover:underline"
                onClick={() => setPrizes(prev => [...prev, { name: '', description: '' }])}
              >
                + Agregar premio
              </button>
            </div>
            {prizes.map((prize, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <input
                    required
                    placeholder={`Nombre del premio ${idx + 1}`}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={prize.name}
                    onChange={e => setPrizes(prev => prev.map((p, i) => i === idx ? { ...p, name: e.target.value } : p))}
                  />
                  <input
                    placeholder="Descripcion (opcional)"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={prize.description}
                    onChange={e => setPrizes(prev => prev.map((p, i) => i === idx ? { ...p, description: e.target.value } : p))}
                  />
                </div>
                {prizes.length > 1 && (
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700 text-sm mt-2"
                    onClick={() => setPrizes(prev => prev.filter((_, i) => i !== idx))}
                  >
                    &#10005;
                  </button>
                )}
              </div>
            ))}
          </div>
          {/* Start Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inicio (Chile)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
              />
              <input
                type="time"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={form.startTime}
                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
              />
            </div>
          </div>
          {/* End Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cierre (Chile)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
              />
              <input
                type="time"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={form.endTime}
                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="flex-1" loading={saving}>
              {initial?.id ? 'Guardar cambios' : 'Crear rifa'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
