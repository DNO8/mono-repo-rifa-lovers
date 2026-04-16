import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAdminKPIs, useAdminRaffles, useAdminUsers } from '@/features/admin/hooks/use-admin'
import { checkDrawAvailability, executeDraw } from '@/api/draw.api'
import type { DrawCheckResponse, DrawResults } from '@/api/draw.api'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DollarSign,
  Package,
  Users,
  Ticket,
  Trophy,
  ShoppingCart,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
  Plus,
  Pencil,
  Play,
  ChevronDown,
  Shield,
  Ban,
  UserCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { RaffleWithStats, CreateRaffleRequest, UpdateRaffleRequest, UpdateRaffleStatusRequest } from '@/api/admin.api'

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  icon: Icon,
  color = 'blue',
  suffix = '',
}: {
  title: string
  value: number
  icon: LucideIcon
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  suffix?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold mt-1">
              {value.toLocaleString('es-CL')}{suffix}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const RAFFLE_STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  draft:    { label: 'Borrador', cls: 'bg-gray-100 text-gray-700' },
  active:   { label: 'Activa',   cls: 'bg-green-100 text-green-700' },
  sold_out: { label: 'Agotada',  cls: 'bg-yellow-100 text-yellow-700' },
  closed:   { label: 'Cerrada',  cls: 'bg-red-100 text-red-700' },
  drawn:    { label: 'Sorteada', cls: 'bg-purple-100 text-purple-700' },
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft:    ['active'],
  active:   ['closed'],
  sold_out: ['closed'],
  closed:   ['active', 'drawn'],
  drawn:    [],
}

function RaffleStatusBadge({ status }: { status: string }) {
  const cfg = RAFFLE_STATUS_CONFIG[status] || { label: status, cls: 'bg-gray-100 text-gray-700' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

// ─── Raffle Form Modal ────────────────────────────────────────────────────────

function RaffleFormModal({
  initial,
  onClose,
  onSubmit,
}: {
  initial?: Partial<RaffleWithStats>
  onClose: () => void
  onSubmit: (data: CreateRaffleRequest | UpdateRaffleRequest) => Promise<void>
}) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    goalPacks: initial?.goalPacks?.toString() || '',
    startDate: initial?.startDate ? initial.startDate.slice(0, 10) : '',
    endDate: initial?.endDate ? initial.endDate.slice(0, 10) : '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        title: form.title,
        description: form.description || undefined,
        goalPacks: parseInt(form.goalPacks, 10),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold">{initial?.id ? 'Editar Rifa' : 'Nueva Rifa'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
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
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inicio</label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cierre</label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
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

// ─── Draw Modal ───────────────────────────────────────────────────────────────

function DrawModal({ raffleId, onClose }: { raffleId: string; onClose: () => void }) {
  const [check, setCheck] = useState<DrawCheckResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [result, setResult] = useState<DrawResults | null>(null)

  useEffect(() => {
    checkDrawAvailability(raffleId)
      .then(setCheck)
      .catch(() => setCheck({ canDraw: false, reason: 'Error al verificar', prizesCount: 0, activePassesCount: 0 }))
      .finally(() => setLoading(false))
  }, [raffleId])

  const handleDraw = async () => {
    setExecuting(true)
    try {
      const res = await executeDraw(raffleId)
      setResult(res)
      toast.success(`¡Sorteo completado! ${res.winners.length} ganadores asignados`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al ejecutar sorteo')
    } finally {
      setExecuting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            {result ? 'Resultados del Sorteo' : 'Ejecutar Sorteo'}
          </h2>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Phase 1: checking */}
          {!result && (
            <>
              {loading ? (
                <div className="flex justify-center py-6"><Spinner size="lg" /></div>
              ) : check ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{check.prizesCount}</p>
                      <p className="text-xs text-gray-500 mt-1">Premios desbloqueados</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{check.activePassesCount}</p>
                      <p className="text-xs text-gray-500 mt-1">LuckyPasses activos</p>
                    </div>
                  </div>
                  {!check.canDraw && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700">{check.reason}</p>
                    </div>
                  )}
                </>
              ) : null}
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={onClose} disabled={executing}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  disabled={!check?.canDraw || executing}
                  loading={executing}
                  onClick={handleDraw}
                >
                  Sortear ahora
                </Button>
              </div>
            </>
          )}

          {/* Phase 2: results */}
          {result && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="font-bold text-green-700">{result.winners.length} ganador{result.winners.length !== 1 ? 'es' : ''} seleccionado{result.winners.length !== 1 ? 's' : ''}</p>
                <p className="text-xs text-green-600 mt-1">{new Date(result.drawnAt).toLocaleString('es-CL')}</p>
              </div>
              <div className="space-y-3">
                {result.winners.map((w, i) => (
                  <div key={w.luckyPassId} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center shrink-0 text-sm font-bold text-yellow-700">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{w.prizeName}</p>
                      <p className="text-xs text-gray-500">{w.userName ?? 'Usuario'} · {w.userEmail ?? '—'}</p>
                      <p className="text-xs text-primary font-mono mt-0.5">LuckyPass #{w.passNumber}</p>
                    </div>
                    <Trophy className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
              <Button variant="primary" className="w-full" onClick={onClose}>
                Cerrar
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'raffles' | 'users'

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const { kpis, isLoading: kpisLoading } = useAdminKPIs()
  const { raffles, isLoading: rafflesLoading, create, update, updateStatus, refresh: refreshRaffles } = useAdminRaffles()
  const { users, total: usersTotal, isLoading: usersLoading, updateRole, updateStatus: updateUserStatus } = useAdminUsers()

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [raffleModal, setRaffleModal] = useState<'create' | RaffleWithStats | null>(null)
  const [drawRaffleId, setDrawRaffleId] = useState<string | null>(null)
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null)

  const isLoading = kpisLoading || rafflesLoading || usersLoading

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  const handleStatusChange = async (raffleId: string, newStatus: string) => {
    try {
      await updateStatus(raffleId, { status: newStatus as UpdateRaffleStatusRequest['status'] })
      setStatusDropdown(null)
      toast.success(`Estado actualizado a ${RAFFLE_STATUS_CONFIG[newStatus]?.label}`)
      refreshRaffles()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar estado')
    }
  }

  return (
    <div className="px-3 py-4 sm:p-6 space-y-4 sm:space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Panel de Administración</h1>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['overview', 'raffles', 'users'] as Tab[]).map(tab => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className="shrink-0"
            >
              {tab === 'overview' && <TrendingUp className="w-4 h-4 mr-1.5" />}
              {tab === 'raffles' && <Calendar className="w-4 h-4 mr-1.5" />}
              {tab === 'users' && <Users className="w-4 h-4 mr-1.5" />}
              {tab === 'overview' ? 'Resumen' : tab === 'raffles' ? 'Rifas' : 'Usuarios'}
            </Button>
          ))}
        </div>
      </div>

      {/* ── Overview ── */}
      {activeTab === 'overview' && kpis && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <KpiCard title="Ventas Totales" value={kpis.totalSales} icon={DollarSign} color="green" suffix=" CLP" />
            <KpiCard title="Packs Vendidos" value={kpis.packsSold} icon={Package} color="blue" />
            <KpiCard title="Usuarios Activos" value={kpis.activeUsers} icon={Users} color="purple" />
            <KpiCard title="Rifas Activas" value={kpis.activeRaffles} icon={Calendar} color="orange" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <KpiCard title="Total Compras" value={kpis.totalPurchases} icon={ShoppingCart} color="blue" />
            <KpiCard title="Pendientes" value={kpis.pendingPurchases} icon={Clock} color="orange" />
            <KpiCard title="Completadas" value={kpis.completedPurchases} icon={CheckCircle} color="green" />
            <KpiCard title="Ganadores" value={kpis.winnersCount} icon={Trophy} color="purple" />
          </div>
          <Card>
            <CardHeader><CardTitle>LuckyPasses Totales</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Ticket className="w-8 h-8 text-primary" />
                <span className="text-4xl font-bold">{kpis.totalLuckyPasses.toLocaleString('es-CL')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Rifas ── */}
      {activeTab === 'raffles' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Gestión de Rifas</CardTitle>
              <Button variant="primary" size="sm" onClick={() => setRaffleModal('create')}>
                <Plus className="w-4 h-4 mr-1.5" />
                Nueva rifa
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* Mobile: cards */}
            <div className="sm:hidden divide-y">
              {raffles.map((raffle) => {
                const transitions = VALID_TRANSITIONS[raffle.status] || []
                return (
                  <div key={raffle.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{raffle.title || 'Sin título'}</p>
                        <p className="text-xs text-gray-400">{new Date(raffle.createdAt).toLocaleDateString('es-CL')}</p>
                      </div>
                      <RaffleStatusBadge status={raffle.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${raffle.progressPercentage}%` }} />
                      </div>
                      <span className="text-xs text-gray-600 shrink-0">{raffle.progressPercentage}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Packs: <strong className="text-gray-800">{raffle.packsSold}</strong> / {raffle.goalPacks}</span>
                      <span>Ingresos: <strong className="text-gray-800">${raffle.totalRevenue.toLocaleString('es-CL')}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        className="flex-1 py-1.5 text-xs border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1"
                        onClick={() => setRaffleModal(raffle)}
                      >
                        <Pencil className="w-3 h-3" /> Editar
                      </button>
                      {transitions.length > 0 && (
                        <div className="relative flex-1">
                          <button
                            className="w-full py-1.5 text-xs border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1"
                            onClick={() => setStatusDropdown(statusDropdown === raffle.id ? null : raffle.id)}
                          >
                            <ChevronDown className="w-3 h-3" /> Estado
                          </button>
                          {statusDropdown === raffle.id && (
                            <div className="absolute left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[140px]">
                              {transitions.map(t => (
                                <button
                                  key={t}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                                  onClick={() => handleStatusChange(raffle.id, t)}
                                >
                                  → {RAFFLE_STATUS_CONFIG[t]?.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {raffle.status === 'closed' && (
                        <button
                          className="flex-1 py-1.5 text-xs border border-yellow-200 rounded-lg hover:bg-yellow-50 text-yellow-700 flex items-center justify-center gap-1"
                          onClick={() => setDrawRaffleId(raffle.id)}
                        >
                          <Play className="w-3 h-3" /> Sortear
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              {raffles.length === 0 && (
                <p className="py-12 text-center text-gray-400 text-sm">No hay rifas creadas</p>
              )}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-3 px-4 font-medium">Título</th>
                    <th className="py-3 px-4 font-medium">Estado</th>
                    <th className="py-3 px-4 font-medium text-right">Progreso</th>
                    <th className="py-3 px-4 font-medium text-right">Packs</th>
                    <th className="py-3 px-4 font-medium text-right">Meta</th>
                    <th className="py-3 px-4 font-medium text-right">Ingresos</th>
                    <th className="py-3 px-4 font-medium text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {raffles.map((raffle) => {
                    const transitions = VALID_TRANSITIONS[raffle.status] || []
                    return (
                      <tr key={raffle.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{raffle.title || 'Sin título'}</div>
                          <div className="text-xs text-gray-400">{new Date(raffle.createdAt).toLocaleDateString('es-CL')}</div>
                        </td>
                        <td className="py-3 px-4"><RaffleStatusBadge status={raffle.status} /></td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${raffle.progressPercentage}%` }} />
                            </div>
                            <span className="text-xs text-gray-600">{raffle.progressPercentage}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">{raffle.packsSold}</td>
                        <td className="py-3 px-4 text-right text-gray-500">{raffle.goalPacks}</td>
                        <td className="py-3 px-4 text-right font-medium">${raffle.totalRevenue.toLocaleString('es-CL')}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="Editar" onClick={() => setRaffleModal(raffle)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            {transitions.length > 0 && (
                              <div className="relative">
                                <button
                                  className="p-1.5 rounded hover:bg-gray-100 text-gray-500 flex items-center gap-0.5"
                                  title="Cambiar estado"
                                  onClick={() => setStatusDropdown(statusDropdown === raffle.id ? null : raffle.id)}
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                {statusDropdown === raffle.id && (
                                  <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[140px]">
                                    {transitions.map(t => (
                                      <button key={t} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => handleStatusChange(raffle.id, t)}>
                                        → {RAFFLE_STATUS_CONFIG[t]?.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            {raffle.status === 'closed' && (
                              <button className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600" title="Ejecutar sorteo" onClick={() => setDrawRaffleId(raffle.id)}>
                                <Play className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {raffles.length === 0 && (
                    <tr><td colSpan={7} className="py-12 text-center text-gray-400">No hay rifas creadas</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Usuarios ── */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Gestión de Usuarios</CardTitle>
              <span className="text-sm text-gray-500">{usersTotal} usuarios en total</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* Mobile: cards */}
            <div className="sm:hidden divide-y">
              {users.map((user) => (
                <div key={user.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{user.firstName || ''} {user.lastName || ''}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'operator' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{user.role}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{user.status === 'active' ? 'Activo' : 'Bloqueado'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Compras: <strong className="text-gray-800">{user._count.purchases}</strong></span>
                    <span>LuckyPasses: <strong className="text-gray-800">{user._count.luckyPasses}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    {user.role === 'customer' && (
                      <button
                        className="flex-1 py-1.5 text-xs border border-blue-200 rounded-lg hover:bg-blue-50 text-blue-600 flex items-center justify-center gap-1"
                        onClick={async () => { try { await updateRole(user.id, { role: 'operator' }); toast.success('Rol actualizado a operador') } catch { toast.error('Error al actualizar rol') } }}
                      >
                        <Shield className="w-3 h-3" /> Hacer operador
                      </button>
                    )}
                    {user.role === 'operator' && (
                      <button
                        className="flex-1 py-1.5 text-xs border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1"
                        onClick={async () => { try { await updateRole(user.id, { role: 'customer' }); toast.success('Rol actualizado a customer') } catch { toast.error('Error al actualizar rol') } }}
                      >
                        <UserCheck className="w-3 h-3" /> Bajar a customer
                      </button>
                    )}
                    <button
                      className={`flex-1 py-1.5 text-xs border rounded-lg flex items-center justify-center gap-1 ${
                        user.status === 'active' ? 'border-red-200 hover:bg-red-50 text-red-600' : 'border-green-200 hover:bg-green-50 text-green-600'
                      }`}
                      onClick={async () => {
                        try {
                          const newStatus = user.status === 'active' ? 'blocked' : 'active'
                          await updateUserStatus(user.id, { status: newStatus })
                          toast.success(`Usuario ${newStatus === 'active' ? 'desbloqueado' : 'bloqueado'}`)
                        } catch { toast.error('Error al cambiar estado') }
                      }}
                    >
                      <Ban className="w-3 h-3" />
                      {user.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                    </button>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <p className="py-12 text-center text-gray-400 text-sm">No hay usuarios</p>
              )}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block">
              <table className="w-full min-w-[500px] text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-3 px-4 font-medium">Usuario</th>
                    <th className="py-3 px-4 font-medium">Rol</th>
                    <th className="py-3 px-4 font-medium">Estado</th>
                    <th className="py-3 px-4 font-medium text-right">Compras</th>
                    <th className="py-3 px-4 font-medium text-right">LPs</th>
                    <th className="py-3 px-4 font-medium text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{user.firstName || ''} {user.lastName || ''}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'operator' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{user.role}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>{user.status === 'active' ? 'Activo' : 'Bloqueado'}</span>
                      </td>
                      <td className="py-3 px-4 text-right">{user._count.purchases}</td>
                      <td className="py-3 px-4 text-right">{user._count.luckyPasses}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {user.role === 'customer' && (
                            <button className="p-1.5 rounded hover:bg-blue-50 text-blue-500" title="Promover a operador"
                              onClick={async () => { try { await updateRole(user.id, { role: 'operator' }); toast.success('Rol actualizado a operador') } catch { toast.error('Error al actualizar rol') } }}>
                              <Shield className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {user.role === 'operator' && (
                            <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="Degradar a customer"
                              onClick={async () => { try { await updateRole(user.id, { role: 'customer' }); toast.success('Rol actualizado a customer') } catch { toast.error('Error al actualizar rol') } }}>
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            className={`p-1.5 rounded ${user.status === 'active' ? 'hover:bg-red-50 text-red-500' : 'hover:bg-green-50 text-green-500'}`}
                            title={user.status === 'active' ? 'Bloquear usuario' : 'Desbloquear usuario'}
                            onClick={async () => {
                              try {
                                const newStatus = user.status === 'active' ? 'blocked' : 'active'
                                await updateUserStatus(user.id, { status: newStatus })
                                toast.success(`Usuario ${newStatus === 'active' ? 'desbloqueado' : 'bloqueado'}`)
                              } catch { toast.error('Error al cambiar estado') }
                            }}
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={6} className="py-12 text-center text-gray-400">No hay usuarios</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Modales ── */}
      {raffleModal && raffleModal !== 'create' && (
        <RaffleFormModal
          initial={raffleModal}
          onClose={() => setRaffleModal(null)}
          onSubmit={(data) => update(raffleModal.id, data as UpdateRaffleRequest).then(() => refreshRaffles())}
        />
      )}
      {raffleModal === 'create' && (
        <RaffleFormModal
          onClose={() => setRaffleModal(null)}
          onSubmit={(data) => create(data as CreateRaffleRequest).then(() => {})}
        />
      )}
      {drawRaffleId && (
        <DrawModal raffleId={drawRaffleId} onClose={() => { setDrawRaffleId(null); refreshRaffles() }} />
      )}

      {/* Cerrar dropdown al hacer click fuera */}
      {statusDropdown && (
        <div className="fixed inset-0 z-5" onClick={() => setStatusDropdown(null)} />
      )}
    </div>
  )
}
