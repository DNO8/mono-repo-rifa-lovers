import { useState, useRef } from 'react'
import { ApiError } from '@/api/clients/http-client'
import { hasDangerousHtml, sanitizeHtml } from '@/lib/html-sanitizer'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/stores/auth.store'
import { SEOHead } from '@/components/shared/seo/helmet-wrapper'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from '@/features/shared/components/kpi-card'
import { RaffleStatusBadge } from '@/features/shared/components/raffle-status-badge'
import { OperatorCharts } from '../components/operator-charts'
import {
  useOperatorOrg,
  useOperatorKPIs,
  useOperatorRaffles,
  useOperatorPacks,
  useOperatorNewsletter,
  useUploadRaffleCover,
} from '../hooks/use-operator'
import type { PackWithStats } from '@/api/operator.api'
import {
  TrendingUp,
  Calendar,
  Package,
  Mail,
  Plus,
  Pencil,
  Trash2,
  Send,
  Users,
  ArrowLeft,
  LogOut,
  Building2,
  ImagePlus,
  Link2,
  AlertTriangle,
  Sparkles,
  Rocket,
  Upload,
  X,
  Image,
  Eye,
} from 'lucide-react'
import { RaffleWizardModal } from '@/features/shared/components/raffle-wizard-modal'

type Tab = 'overview' | 'raffles' | 'packs' | 'newsletter'

// ─── Pack Form Modal ──────────────────────────────────────────────────────────

function PackFormModal({
  initial,
  onClose,
  onSubmit,
}: {
  initial?: Partial<PackWithStats>
  onClose: () => void
  onSubmit: (data: { name: string; price: number; luckyPassQuantity: number }) => Promise<void>
}) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    price: initial?.price?.toString() || '',
    luckyPassQuantity: initial?.luckyPassQuantity?.toString() || '1',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        name: form.name,
        price: parseInt(form.price, 10),
        luckyPassQuantity: parseInt(form.luckyPassQuantity, 10),
      })
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold">{initial?.id ? 'Editar Pack' : 'Nuevo Pack'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Pack Premium 5 numeros"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio (CLP) *</label>
            <input
              required
              type="number"
              min={0}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              placeholder="5000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de LuckyPasses *</label>
            <input
              required
              type="number"
              min={1}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={form.luckyPassQuantity}
              onChange={e => setForm(f => ({ ...f, luckyPassQuantity: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="flex-1" loading={saving}>
              {initial?.id ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Cover Upload Modal ───────────────────────────────────────────────────────

function CoverUploadModal({
  open,
  onClose,
  onSelectFile,
}: {
  open: boolean
  onClose: () => void
  onSelectFile: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text-primary">Subir portada</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-text-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 rounded-xl p-4 mb-5">
          <Image className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-text-primary">Recomendación de imagen</p>
            <p className="text-xs text-text-secondary mt-1">
              Resolución óptima: <span className="font-medium text-text-primary">1200 × 630 píxeles</span> (ratio 1.91:1)
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              Formatos: JPG, PNG o WebP. Tamaño máximo: 2 MB.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" className="flex-1" onClick={onSelectFile}>
            <Upload className="w-4 h-4 mr-1.5" />
            Seleccionar archivo
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({
  open,
  title,
  description,
  onClose,
  onConfirm,
}: {
  open: boolean
  title: string
  description: string
  onClose: () => void
  onConfirm: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">{title}</h3>
        </div>
        <p className="text-sm text-text-secondary mb-6">{description}</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" className="flex-1" onClick={onConfirm}>
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OperatorDashboardPage() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [selectedRaffleId, setSelectedRaffleId] = useState<string | null>(null)
  const [packModal, setPackModal] = useState<'create' | PackWithStats | null>(null)
  const [showRaffleModal, setShowRaffleModal] = useState(false)
  const [coverModalRaffleId, setCoverModalRaffleId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [deletePackTarget, setDeletePackTarget] = useState<PackWithStats | null>(null)

  // Org creation form state
  const [orgName, setOrgName] = useState('')
  const [orgSlug, setOrgSlug] = useState('')
  const [creatingOrg, setCreatingOrg] = useState(false)

  const { org, isLoading: isLoadingOrg, create: createOrg, refresh: refreshOrg } = useOperatorOrg()
  const { kpis } = useOperatorKPIs()
  const { raffles, create: createRaffle, refresh: refreshRaffles, updateStatus: updateRaffleStatus } = useOperatorRaffles()
  const { packs, create: createPack, update: updatePack, remove: deletePack } = useOperatorPacks(selectedRaffleId || '')
  const { campaigns, send: sendCampaign } = useOperatorNewsletter()
  const { upload: uploadCover, isUploading: isUploadingCover } = useUploadRaffleCover()

  const hasOrg = !!org

  // Newsletter form state
  const [newsletterSubject, setNewsletterSubject] = useState('')
  const [newsletterBody, setNewsletterBody] = useState('')
  const [sendingNewsletter, setSendingNewsletter] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgName.trim()) return
    setCreatingOrg(true)
    try {
      await createOrg({ name: orgName.trim(), slug: orgSlug.trim() || undefined })
      toast.success('Organizacion creada exitosamente')
      setOrgName('')
      setOrgSlug('')
      await refreshOrg()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear la organizacion')
    } finally {
      setCreatingOrg(false)
    }
  }


  const handleSendNewsletter = async () => {
    if (!newsletterSubject.trim() || !newsletterBody.trim()) return
    if (hasDangerousHtml(newsletterBody)) {
      toast.error('El mensaje contiene código no permitido (scripts, iframes, etc.). Revisa el contenido.')
      return
    }
    setSendingNewsletter(true)
    try {
      const result = await sendCampaign({ subject: newsletterSubject.trim(), body: sanitizeHtml(newsletterBody.trim()) })
      toast.success(result.message)
      setNewsletterSubject('')
      setNewsletterBody('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al enviar')
    } finally {
      setSendingNewsletter(false)
    }
  }

  return (
    <>
      <SEOHead title="Panel de Operador" noindex />
      <div className="px-3 py-4 sm:p-6 space-y-4 sm:space-y-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary" />
              Panel de Operador
            </h1>
            {org && (
              <p className="text-sm text-text-secondary mt-1">{org.name}</p>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none items-center">
            {(['overview', 'raffles', 'packs', 'newsletter'] as Tab[]).map(tab => {
              const isDisabled = !hasOrg && tab !== 'overview'
              return (
                <Button
                  key={tab}
                  variant={activeTab === tab ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => !isDisabled && setActiveTab(tab)}
                  disabled={isDisabled}
                  className={`shrink-0 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isDisabled ? 'Completa tu perfil de empresa primero' : undefined}
                >
                  {tab === 'overview' && <TrendingUp className="w-4 h-4 mr-1.5" />}
                  {tab === 'raffles' && <Calendar className="w-4 h-4 mr-1.5" />}
                  {tab === 'packs' && <Package className="w-4 h-4 mr-1.5" />}
                  {tab === 'newsletter' && <Mail className="w-4 h-4 mr-1.5" />}
                  {tab === 'overview' ? 'Resumen' : tab === 'raffles' ? 'Rifas' : tab === 'packs' ? 'Packs' : 'Newsletter'}
                </Button>
              )
            })}
            <Button variant="outline-primary" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Dashboard
            </Button>
            <Button variant="outline-primary" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1.5" />
              Salir
            </Button>
          </div>
        </div>

        {/* ── Onboarding Banner (when no org) ── */}
        {!hasOrg && !isLoadingOrg && (
          <div className="rounded-2xl bg-linear-to-r from-primary to-secondary p-6 sm:p-8 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="shrink-0 bg-white/20 rounded-xl p-3">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold mb-1">Completa tu perfil de empresa</h2>
                <p className="text-white/90 text-sm sm:text-base mb-4">
                  Debes crear tu organizacion para comenzar a gestionar rifas, packs y enviar newsletters.
                </p>
                <form onSubmit={handleCreateOrg} className="flex flex-col sm:flex-row gap-3 max-w-xl">
                  <input
                    required
                    placeholder="Nombre de tu empresa *"
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                  />
                  <input
                    placeholder="Slug (opcional)"
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                    value={orgSlug}
                    onChange={e => setOrgSlug(e.target.value)}
                  />
                  <Button
                    type="submit"
                    variant="outline-primary"
                    size="sm"
                    loading={creatingOrg}
                    className="shrink-0 bg-white text-primary hover:bg-white/90 border-white"
                  >
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Crear Organizacion
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── Overview ── */}
        {activeTab === 'overview' && hasOrg && kpis && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <KpiCard title="Ventas Totales" value={kpis.totalSales} icon={TrendingUp} color="green" suffix=" CLP" />
              <KpiCard title="Packs Vendidos" value={kpis.packsSold} icon={Package} color="blue" />
              <KpiCard title="Rifas Activas" value={kpis.activeRaffles} icon={Calendar} color="orange" />
              <KpiCard title="Compras" value={kpis.totalPurchases} icon={Users} color="purple" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <KpiCard title="Pendientes" value={kpis.pendingPurchases} icon={Calendar} color="orange" />
              <KpiCard title="Completadas" value={kpis.completedPurchases} icon={TrendingUp} color="green" />
              <KpiCard title="LuckyPasses" value={kpis.totalLuckyPasses} icon={Package} color="blue" />
              <KpiCard title="Ganadores" value={kpis.winnersCount} icon={Users} color="purple" />
            </div>
            <OperatorCharts kpis={kpis} raffles={raffles} />
          </div>
        )}

        {/* ── Rifas ── */}
        {activeTab === 'raffles' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestion de Rifas</CardTitle>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowRaffleModal(true)}
                  disabled={!hasOrg}
                  title={!hasOrg ? 'Completa tu perfil de empresa primero' : undefined}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Nueva Rifa
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="py-3 px-4">Titulo</th>
                      <th className="py-3 px-4">Portada</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4">Packs Vendidos</th>
                      <th className="py-3 px-4">Ingresos</th>
                      <th className="py-3 px-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {raffles.map((raffle) => (
                      <tr key={raffle.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{raffle.title || 'Sin titulo'}</div>
                          <div className="text-xs text-gray-400">Meta: {raffle.goalPacks} packs</div>
                        </td>
                        <td className="py-3 px-4">
                          {raffle.coverImageUrl ? (
                            <img src={raffle.coverImageUrl} alt="" className="w-12 h-8 object-cover rounded" />
                          ) : (
                            <span className="text-xs text-gray-400">Sin portada</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <RaffleStatusBadge status={raffle.status} />
                        </td>
                        <td className="py-3 px-4">{raffle.packsSold}</td>
                        <td className="py-3 px-4">${raffle.totalRevenue.toLocaleString('es-CL')}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              className="p-1.5 rounded hover:bg-purple-50 text-purple-500"
                              title="Subir portada"
                              onClick={() => setCoverModalRaffleId(raffle.id)}
                            >
                              <ImagePlus className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 rounded hover:bg-blue-50 text-blue-500"
                              title="Copiar link"
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/raffle/${raffle.id}`)
                                toast.success('Link copiado al portapapeles')
                              }}
                            >
                              <Link2 className="w-4 h-4" />
                            </button>
                            {raffle.status === 'draft' && (
                              <button
                                className="p-1.5 rounded hover:bg-green-50 text-green-500"
                                title="Publicar rifa"
                                onClick={async () => {
                                  try {
                                    await updateRaffleStatus(raffle.id, { status: 'active' })
                                    toast.success('Rifa publicada exitosamente')
                                    refreshRaffles()
                                  } catch {
                                    toast.error('Error al publicar la rifa')
                                  }
                                }}
                              >
                                <Rocket className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              className="p-1.5 rounded hover:bg-blue-50 text-blue-500"
                              title="Ver packs"
                              onClick={() => { setSelectedRaffleId(raffle.id); setActiveTab('packs') }}
                            >
                              <Package className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {raffles.length === 0 && (
                      <tr><td colSpan={6} className="py-12 text-center text-gray-400">No hay rifas registradas</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Packs ── */}
        {activeTab === 'packs' && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <label className="block text-sm font-medium text-text-primary mb-2">Selecciona una rifa</label>
                <select
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={selectedRaffleId ?? ''}
                  onChange={(e) => setSelectedRaffleId(e.target.value || null)}
                >
                  <option value="">-- Elige una rifa --</option>
                  {raffles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title || 'Sin título'}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {selectedRaffleId && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Packs de la Rifa</CardTitle>
                    <Button variant="primary" size="sm" onClick={() => setPackModal('create')}>
                      <Plus className="w-4 h-4 mr-1.5" />
                      Nuevo Pack
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-gray-500">
                          <th className="py-3 px-4">Nombre</th>
                          <th className="py-3 px-4">Precio</th>
                          <th className="py-3 px-4">LuckyPasses</th>
                          <th className="py-3 px-4">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {packs.map((pack) => (
                          <tr key={pack.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{pack.name || 'Sin nombre'}</td>
                            <td className="py-3 px-4">${pack.price.toLocaleString('es-CL')}</td>
                            <td className="py-3 px-4">{pack.luckyPassQuantity}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  className="p-1.5 rounded hover:bg-blue-50 text-blue-500"
                                  title="Editar"
                                  onClick={() => setPackModal(pack)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-1.5 rounded hover:bg-red-50 text-red-500"
                                  title="Eliminar"
                                  onClick={() => setDeletePackTarget(pack)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {packs.length === 0 && (
                          <tr><td colSpan={4} className="py-12 text-center text-gray-400">No hay packs</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {packModal && (
              <PackFormModal
                initial={packModal === 'create' ? undefined : packModal}
                onClose={() => setPackModal(null)}
                onSubmit={async (data) => {
                  if (packModal === 'create') {
                    await createPack(data)
                    toast.success('Pack creado')
                  } else {
                    await updatePack(packModal.id, data)
                    toast.success('Pack actualizado')
                  }
                }}
              />
            )}
          </div>
        )}

        {/* ── Raffle Modal ── */}
        {showRaffleModal && (
          <RaffleWizardModal
            onClose={() => setShowRaffleModal(false)}
            onSuccess={() => {
              toast.success('Rifa creada exitosamente')
              refreshRaffles()
            }}
            createRaffle={createRaffle}
          />
        )}

        {/* ── Newsletter ── */}
        {activeTab === 'newsletter' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Enviar Newsletter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={newsletterSubject}
                    onChange={e => setNewsletterSubject(e.target.value)}
                    placeholder="Novedades de tu rifa..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                  <textarea
                    rows={6}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    value={newsletterBody}
                    onChange={e => setNewsletterBody(e.target.value)}
                    placeholder="Escribe el contenido del correo..."
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowPreview(true)}
                    disabled={!newsletterSubject.trim() || !newsletterBody.trim()}
                    className="w-full sm:w-auto"
                  >
                    <Eye className="w-4 h-4 mr-1.5" />
                    Vista previa
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSendNewsletter}
                    loading={sendingNewsletter}
                    disabled={!newsletterSubject.trim() || !newsletterBody.trim()}
                    className="w-full sm:w-auto"
                  >
                    <Send className="w-4 h-4 mr-1.5" />
                    Enviar Campana
                  </Button>
                </div>
              </CardContent>
            </Card>

            {showPreview && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Vista previa del correo</span>
                    <button
                      className="p-1 rounded hover:bg-gray-100 text-gray-500"
                      onClick={() => setShowPreview(false)}
                      title="Cerrar vista previa"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <iframe
                    title="Vista previa newsletter"
                    srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;padding:16px;color:#333}</style></head><body>${sanitizeHtml(newsletterBody)}</body></html>`}
                    className="w-full h-96 border rounded-lg bg-white"
                    sandbox=""
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Historial de Campanas</CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="py-3 px-4">Asunto</th>
                        <th className="py-3 px-4">Destinatarios</th>
                        <th className="py-3 px-4">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((camp) => (
                        <tr key={camp.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{camp.subject}</td>
                          <td className="py-3 px-4">{camp.recipientCount}</td>
                          <td className="py-3 px-4 text-gray-500">
                            {new Date(camp.createdAt).toLocaleDateString('es-CL')}
                          </td>
                        </tr>
                      ))}
                      {campaigns.length === 0 && (
                        <tr><td colSpan={3} className="py-12 text-center text-gray-400">No has enviado campanas aun</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Hidden file input triggered by cover modal */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (!file || !coverModalRaffleId) return
          try {
            await uploadCover(coverModalRaffleId, file)
            toast.success('Portada actualizada')
            refreshRaffles()
          } catch {
            toast.error('Error al subir la portada')
          }
          e.target.value = ''
          setCoverModalRaffleId(null)
        }}
        disabled={isUploadingCover}
      />

      {/* Cover upload modal */}
      <CoverUploadModal
        open={!!coverModalRaffleId}
        onClose={() => setCoverModalRaffleId(null)}
        onSelectFile={() => fileInputRef.current?.click()}
      />

      {/* Delete pack confirmation modal */}
      <DeleteConfirmModal
        open={!!deletePackTarget}
        title="Eliminar pack"
        description={`¿Estás seguro de que deseas eliminar "${deletePackTarget?.name ?? 'este pack'}"? Esta acción no se puede deshacer.`}
        onClose={() => setDeletePackTarget(null)}
        onConfirm={async () => {
          if (!deletePackTarget) return
          try {
            await deletePack(deletePackTarget.id)
            toast.success('Pack eliminado correctamente')
          } catch (err) {
            const msg = err instanceof ApiError ? err.getUserMessage() : 'Error al eliminar el pack'
            toast.error(msg)
          } finally {
            setDeletePackTarget(null)
          }
        }}
      />
    </>
  )
}
