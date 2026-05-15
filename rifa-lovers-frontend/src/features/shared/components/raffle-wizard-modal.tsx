import { useState, useRef, type Dispatch, type SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import { toastError } from '@/lib/errors'
import { toUTC } from '@/lib/utils'
import type { CreateRaffleRequest, RaffleWithStats } from '@/api/admin.api'
import {
  createRafflePack,
  uploadRaffleCover,
} from '@/api/operator.api'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Plus,
  Trash2,
  ImagePlus,
  X,
  Loader2,
  FileText,
  Package,
  Eye,
  Award,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface WizardData {
  title: string
  description: string
  coverImage: File | null
  coverImagePreview: string | null
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  packs: PackFormItem[]
  goalPacks: string
  maxTicketNumber: string
  prizes: PrizeFormItem[]
}

interface PackFormItem {
  id: string
  name: string
  price: string
  luckyPassQuantity: string
  isFeatured: boolean
  isPreSale: boolean
}

interface PrizeFormItem {
  name: string
  description: string
  valueEstimated: string
  quantity: string
}

const STEPS = [
  { label: 'Información', icon: FileText },
  { label: 'Packs', icon: Package },
  { label: 'Premios', icon: Award },
  { label: 'Revisión', icon: Eye },
]

const generateId = () => Math.random().toString(36).slice(2, 9)

function getInitialState(): WizardData {
  return {
    title: '',
    description: '',
    coverImage: null,
    coverImagePreview: null,
    startDate: '',
    startTime: '00:00',
    endDate: '',
    endTime: '23:59',
    packs: [{
      id: generateId(),
      name: '',
      price: '',
      luckyPassQuantity: '1',
      isFeatured: false,
      isPreSale: false,
    }],
    goalPacks: '5000',
    maxTicketNumber: '30000',
    prizes: [{ name: '', description: '', valueEstimated: '', quantity: '1' }],
  }
}

// ─── Stepper (outside main component) ───────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 mb-6 px-2">
      {STEPS.map((s, idx) => {
        const Icon = s.icon
        const isActive = idx === step
        const isDone = idx < step
        return (
          <div key={idx} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-full transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold ring-1 ring-primary/30'
                  : isDone
                    ? 'bg-success/10 text-success'
                    : 'bg-bg-muted text-text-tertiary'
              }`}
            >
              {isDone ? <CheckCircle2 className="size-4" /> : <Icon className="size-4" />}
              <span className="text-xs md:text-sm hidden sm:inline">{s.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-px w-4 md:w-8 ${isDone ? 'bg-success/40' : 'bg-border-light'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 1: Basic Info ─────────────────────────────────────────────────────

function StepBasicInfo({ data, setData }: { data: WizardData; setData: Dispatch<SetStateAction<WizardData>> }) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toastError(new Error('La imagen no debe superar los 5MB'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setData(prev => ({ ...prev, coverImage: file, coverImagePreview: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setData(prev => ({ ...prev, coverImage: null, coverImagePreview: null }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Titulo *</label>
        <input
          required
          className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          value={data.title}
          onChange={e => setData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Ej: Rifa Benefica de Verano"
          maxLength={200}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Descripcion</label>
        <textarea
          rows={3}
          className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          value={data.description}
          onChange={e => setData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe la rifa y su proposito..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Imagen de portada</label>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        {data.coverImagePreview ? (
          <div className="relative rounded-xl overflow-hidden border border-border-light aspect-video max-h-[200px]">
            <img src={data.coverImagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80">
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-border-light rounded-xl py-8 flex flex-col items-center gap-2 text-text-tertiary hover:border-primary/40 hover:text-primary transition-colors"
          >
            <ImagePlus className="size-8" />
            <span className="text-sm">Arrastra o haz click para subir una imagen</span>
            <span className="text-xs text-text-tertiary">Max. 5MB - JPG, PNG, WEBP</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Inicio</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={data.startDate}
              onChange={e => setData(prev => ({ ...prev, startDate: e.target.value }))}
            />
            <input
              type="time"
              className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={data.startTime}
              onChange={e => setData(prev => ({ ...prev, startTime: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Cierre</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={data.endDate}
              onChange={e => setData(prev => ({ ...prev, endDate: e.target.value }))}
            />
            <input
              type="time"
              className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={data.endTime}
              onChange={e => setData(prev => ({ ...prev, endTime: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step 2: Packs ──────────────────────────────────────────────────────────

function StepPacks({ data, setData }: { data: WizardData; setData: Dispatch<SetStateAction<WizardData>> }) {
  const addPack = () => {
    setData(prev => ({
      ...prev,
      packs: [...prev.packs, { id: generateId(), name: '', price: '', luckyPassQuantity: '1', isFeatured: false, isPreSale: false }],
    }))
  }

  const updatePack = (id: string, updates: Partial<PackFormItem>) => {
    setData(prev => ({ ...prev, packs: prev.packs.map(p => (p.id === id ? { ...p, ...updates } : p)) }))
  }

  const removePack = (id: string) => {
    setData(prev => (prev.packs.length <= 1 ? prev : { ...prev, packs: prev.packs.filter(p => p.id !== id) }))
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">Define los packs que los participantes podran comprar. Minimo uno.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.packs.map((pack, idx) => (
          <div key={pack.id} className="border border-border-light rounded-xl p-4 bg-white space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-tertiary uppercase">Pack {idx + 1}</span>
              {data.packs.length > 1 && (
                <button type="button" onClick={() => removePack(pack.id)} className="text-text-tertiary hover:text-danger transition-colors">
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary block mb-1">Nombre *</label>
              <input
                required
                className="w-full border border-border-light rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={pack.name}
                onChange={e => updatePack(pack.id, { name: e.target.value })}
                placeholder="Ej: Pack Basico"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Precio (CLP) *</label>
                <input
                  type="number"
                  min={0}
                  className="w-full border border-border-light rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={pack.price}
                  onChange={e => updatePack(pack.id, { price: e.target.value })}
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">LuckyPasses *</label>
                <input
                  type="number"
                  min={1}
                  className="w-full border border-border-light rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={pack.luckyPassQuantity}
                  onChange={e => updatePack(pack.id, { luckyPassQuantity: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={pack.isFeatured} onChange={e => updatePack(pack.id, { isFeatured: e.target.checked })} className="size-4 rounded accent-primary" />
                <span className="text-xs text-text-secondary">Destacado</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={pack.isPreSale} onChange={e => updatePack(pack.id, { isPreSale: e.target.checked })} className="size-4 rounded accent-primary" />
                <span className="text-xs text-text-secondary">Preventa</span>
              </label>
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={addPack} className="w-full">
        <Plus className="size-4 mr-1" />
        Agregar pack
      </Button>
    </div>
  )
}

// ─── Step 3: Prizes ─────────────────────────────────────────────────────────

function StepPrizes({ data, setData }: { data: WizardData; setData: Dispatch<SetStateAction<WizardData>> }) {
  const addPrize = () => {
    setData(prev => ({ ...prev, prizes: [...prev.prizes, { name: '', description: '', valueEstimated: '', quantity: '1' }] }))
  }

  const updatePrize = (idx: number, updates: Partial<PrizeFormItem>) => {
    setData(prev => ({ ...prev, prizes: prev.prizes.map((p, i) => (i === idx ? { ...p, ...updates } : p)) }))
  }

  const removePrize = (idx: number) => {
    setData(prev => (prev.prizes.length <= 1 ? prev : { ...prev, prizes: prev.prizes.filter((_, i) => i !== idx) }))
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Meta (packs) *</label>
          <input
            type="number"
            min={1}
            className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={data.goalPacks}
            onChange={e => setData(prev => ({ ...prev, goalPacks: e.target.value }))}
            placeholder="5000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Max. tickets</label>
          <input
            type="number"
            min={1}
            className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={data.maxTicketNumber}
            onChange={e => setData(prev => ({ ...prev, maxTicketNumber: e.target.value }))}
            placeholder="30000"
          />
        </div>
      </div>

      <div className="border-t border-border-light pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary">Premios</h3>
          <button type="button" className="text-xs text-primary font-medium hover:underline" onClick={addPrize}>
            + Agregar premio
          </button>
        </div>
        <div className="space-y-3">
          {data.prizes.map((prize, idx) => (
            <div key={idx} className="border border-border-light rounded-xl p-4 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-tertiary">Premio {idx + 1}</span>
                {data.prizes.length > 1 && (
                  <button type="button" onClick={() => removePrize(idx)} className="text-text-tertiary hover:text-danger transition-colors">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
              <input
                required
                className="w-full border border-border-light rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={prize.name}
                onChange={e => updatePrize(idx, { name: e.target.value })}
                placeholder="Nombre del premio"
              />
              <input
                className="w-full border border-border-light rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={prize.description}
                onChange={e => updatePrize(idx, { description: e.target.value })}
                placeholder="Descripcion (opcional)"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={0}
                  className="w-full border border-border-light rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={prize.valueEstimated}
                  onChange={e => updatePrize(idx, { valueEstimated: e.target.value })}
                  placeholder="Valor estimado ($)"
                />
                <input
                  type="number"
                  min={1}
                  className="w-full border border-border-light rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={prize.quantity}
                  onChange={e => updatePrize(idx, { quantity: e.target.value })}
                  placeholder="Cantidad (default 1)"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Step 4: Review ─────────────────────────────────────────────────────────

function StepReview({ data }: { data: WizardData }) {
  const validPacks = data.packs.filter(p => p.name.trim() && p.price && parseInt(p.price, 10) >= 0)
  const validPrizes = data.prizes.filter(p => p.name.trim())

  return (
    <div className="space-y-5">
      <div className="bg-bg-muted/50 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <FileText className="size-4 text-primary" />
          Informacion basica
        </h3>
        <div className="space-y-1 text-sm">
          <p><span className="text-text-tertiary">Titulo:</span> <span className="text-text-primary font-medium">{data.title}</span></p>
          {data.description && <p><span className="text-text-tertiary">Descripcion:</span> {data.description}</p>}
          {data.coverImagePreview && (
            <div className="mt-2 rounded-lg overflow-hidden border border-border-light aspect-video max-h-[120px]">
              <img src={data.coverImagePreview} alt="Cover" className="w-full h-full object-cover" />
            </div>
          )}
          {data.startDate && <p><span className="text-text-tertiary">Inicio:</span> {data.startDate} {data.startTime}</p>}
          {data.endDate && <p><span className="text-text-tertiary">Cierre:</span> {data.endDate} {data.endTime}</p>}
        </div>
      </div>

      <div className="bg-bg-muted/50 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Package className="size-4 text-primary" />
          Packs ({validPacks.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {validPacks.map(p => (
            <div key={p.id} className="bg-white border border-border-light rounded-lg p-3 text-sm">
              <p className="font-medium text-text-primary">{p.name}</p>
              <p className="text-text-secondary text-xs">${parseInt(p.price || '0', 10).toLocaleString('es-CL')} - {p.luckyPassQuantity} LuckyPass</p>
              {p.isFeatured && <span className="inline-block mt-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Destacado</span>}
              {p.isPreSale && <span className="inline-block mt-1 text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full ml-1">Preventa</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-bg-muted/50 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Award className="size-4 text-primary" />
          Premios ({validPrizes.length})
        </h3>
        <div className="space-y-2">
          {validPrizes.map((p, idx) => (
            <div key={idx} className="bg-white border border-border-light rounded-lg p-3 text-sm">
              <p className="font-medium text-text-primary">{p.name}</p>
              {p.description && <p className="text-text-secondary text-xs">{p.description}</p>}
              {p.valueEstimated && <p className="text-text-tertiary text-xs">Valor estimado: ${parseInt(p.valueEstimated, 10).toLocaleString('es-CL')}</p>}
            </div>
          ))}
        </div>
        <div className="flex gap-4 text-xs text-text-secondary pt-1">
          <span>Meta: <strong className="text-text-primary">{parseInt(data.goalPacks || '0', 10).toLocaleString('es-CL')} packs</strong></span>
          <span>Tickets max: <strong className="text-text-primary">{parseInt(data.maxTicketNumber || '0', 10).toLocaleString('es-CL')}</strong></span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface RaffleWizardModalProps {
  onClose: () => void
  onSuccess: () => void
  createRaffle: (data: CreateRaffleRequest) => Promise<RaffleWithStats>
}

export function RaffleWizardModal({ onClose, onSuccess, createRaffle }: RaffleWizardModalProps) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<WizardData>(getInitialState)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitProgress, setSubmitProgress] = useState('')
  const [partialRaffleId, setPartialRaffleId] = useState<string | null>(null)

  const validateStep = (): boolean => {
    switch (step) {
      case 0: {
        if (!data.title.trim()) {
          toastError(new Error('El titulo es obligatorio'))
          return false
        }
        if (data.endDate && data.startDate) {
          const start = new Date(`${data.startDate}T${data.startTime}`)
          const end = new Date(`${data.endDate}T${data.endTime}`)
          if (end <= start) {
            toastError(new Error('La fecha de cierre debe ser posterior a la de inicio'))
            return false
          }
        }
        if (data.startDate) {
          const start = new Date(`${data.startDate}T${data.startTime}`)
          const now = new Date()
          if (start < now) {
            toastError(new Error('La fecha de inicio debe ser posterior a la fecha actual'))
            return false
          }
        }
        return true
      }
      case 1: {
        const validPacks = data.packs.filter(
          p => p.name.trim() && p.price && parseInt(p.price, 10) >= 0 && p.luckyPassQuantity && parseInt(p.luckyPassQuantity, 10) >= 1
        )
        if (validPacks.length === 0) {
          toastError(new Error('Debes agregar al menos un pack valido'))
          return false
        }
        return true
      }
      case 2: {
        const validPrizes = data.prizes.filter(p => p.name.trim())
        if (validPrizes.length === 0) {
          toastError(new Error('Debes incluir al menos un premio con nombre'))
          return false
        }
        if (!data.goalPacks || parseInt(data.goalPacks, 10) < 1) {
          toastError(new Error('La meta de packs es obligatoria'))
          return false
        }
        return true
      }
      default:
        return true
    }
  }

  const nextStep = () => { if (validateStep()) setStep(s => Math.min(s + 1, STEPS.length - 1)) }
  const prevStep = () => setStep(s => Math.max(s - 1, 0))

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError(null)
    let raffleId = partialRaffleId
    try {
      if (!raffleId) {
        setSubmitProgress('Creando rifa...')
        const raffleData: CreateRaffleRequest = {
          title: data.title.trim(),
          description: data.description.trim() || undefined,
          goalPacks: parseInt(data.goalPacks, 10),
          maxTicketNumber: parseInt(data.maxTicketNumber, 10) || 30000,
          startDate: toUTC(data.startDate, data.startTime),
          endDate: toUTC(data.endDate, data.endTime),
          status: 'draft',
          prizes: data.prizes
            .filter(p => p.name.trim())
            .map(p => ({
              name: p.name.trim(),
              description: p.description.trim() || undefined,
              valueEstimated: p.valueEstimated ? parseFloat(p.valueEstimated) : undefined,
              quantity: p.quantity ? parseInt(p.quantity, 10) : undefined,
            })),
        }
        const raffle = await createRaffle(raffleData)
        raffleId = raffle.id
        setPartialRaffleId(raffle.id)
      }

      const validPacks = data.packs.filter(p => p.name.trim() && p.price && parseFloat(p.price) >= 0)
      for (let i = 0; i < validPacks.length; i++) {
        setSubmitProgress(`Creando pack ${i + 1} de ${validPacks.length}...`)
        const p = validPacks[i]
        await createRafflePack(raffleId!, {
          name: p.name.trim(),
          price: parseFloat(p.price),
          luckyPassQuantity: parseInt(p.luckyPassQuantity, 10) || 1,
          isFeatured: p.isFeatured,
          isPreSale: p.isPreSale,
        })
      }

      if (data.coverImage) {
        setSubmitProgress('Subiendo imagen de portada...')
        await uploadRaffleCover(raffleId!, data.coverImage)
      }

      setPartialRaffleId(null)
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear la rifa'
      if (raffleId) {
        setSubmitError(`${msg}. La rifa fue creada. Puedes reintentar para completar packs o imagen.`)
      } else {
        setSubmitError(msg)
      }
      toastError(err, undefined, msg)
    } finally {
      setSubmitting(false)
      setSubmitProgress('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start md:items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white w-full min-h-screen md:min-h-0 md:rounded-2xl md:shadow-2xl md:max-w-3xl md:mx-4 md:my-8 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-4 md:px-6 pt-5 pb-3 border-b border-border-light shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg md:text-xl font-bold text-text-primary">Nueva Rifa</h2>
            <button type="button" onClick={onClose} className="text-text-tertiary hover:text-text-primary transition-colors p-1" disabled={submitting}>
              <X className="size-5" />
            </button>
          </div>
          <StepIndicator step={step} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 min-h-0">
          {step === 0 && <StepBasicInfo data={data} setData={setData} />}
          {step === 1 && <StepPacks data={data} setData={setData} />}
          {step === 2 && <StepPrizes data={data} setData={setData} />}
          {step === 3 && (
            <>
              <StepReview data={data} />
              {submitError && (
                <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 text-sm text-danger mt-4">
                  <p className="font-medium">Error al crear la rifa</p>
                  <p className="text-xs">{submitError}</p>
                </div>
              )}
              {submitting && submitProgress && (
                <div className="flex items-center gap-2 text-sm text-primary mt-4">
                  <Loader2 className="size-4 animate-spin" />
                  {submitProgress}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-4 border-t border-border-light shrink-0 bg-white">
          <div className="flex items-center gap-3">
            {step > 0 ? (
              <Button type="button" variant="secondary" onClick={prevStep} disabled={submitting} className="flex items-center gap-1">
                <ChevronLeft className="size-4" />
                <span className="hidden sm:inline">Anterior</span>
              </Button>
            ) : (
              <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>Cancelar</Button>
            )}
            <div className="flex-1" />
            {step < STEPS.length - 1 ? (
              <Button type="button" variant="primary" onClick={nextStep} className="flex items-center gap-1">
                <span className="hidden sm:inline">Siguiente</span>
                <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button type="button" variant="primary" onClick={handleSubmit} loading={submitting} className="flex items-center gap-1">
                <CheckCircle2 className="size-4" />
                {partialRaffleId ? 'Reintentar' : 'Crear Rifa'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
