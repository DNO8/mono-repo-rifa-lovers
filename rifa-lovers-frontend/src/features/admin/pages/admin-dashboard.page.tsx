import { useState } from 'react'
import { useAdminKPIs, useAdminRaffles } from '@/hooks/use-admin'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
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
  Calendar
} from 'lucide-react'

function KpiCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue',
  suffix = '' 
}: { 
  title: string
  value: number
  icon: React.ElementType
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
              {value.toLocaleString()}{suffix}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
    draft: { variant: 'secondary', label: 'Borrador' },
    active: { variant: 'default', label: 'Activa' },
    sold_out: { variant: 'destructive', label: 'Agotada' },
    closed: { variant: 'outline', label: 'Cerrada' },
    drawn: { variant: 'default', label: 'Sorteada' },
  }

  const config = variants[status] || { variant: 'secondary', label: status }

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}

export function AdminDashboardPage() {
  const { kpis, isLoading: kpisLoading, error: kpisError } = useAdminKPIs()
  const { raffles, isLoading: rafflesLoading, error: rafflesError } = useAdminRaffles()
  const [activeTab, setActiveTab] = useState<'overview' | 'raffles'>('overview')

  if (kpisLoading || rafflesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (kpisError || rafflesError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error al cargar datos: {kpisError || rafflesError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Resumen
          </Button>
          <Button 
            variant={activeTab === 'raffles' ? 'default' : 'outline'}
            onClick={() => setActiveTab('raffles')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Rifas
          </Button>
        </div>
      </div>

      {activeTab === 'overview' && kpis && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard 
              title="Ventas Totales" 
              value={kpis.totalSales} 
              icon={DollarSign} 
              color="green"
              suffix=" CLP"
            />
            <KpiCard 
              title="Packs Vendidos" 
              value={kpis.packsSold} 
              icon={Package} 
              color="blue"
            />
            <KpiCard 
              title="Usuarios Activos" 
              value={kpis.activeUsers} 
              icon={Users} 
              color="purple"
            />
            <KpiCard 
              title="Rifas Activas" 
              value={kpis.activeRaffles} 
              icon={Calendar} 
              color="orange"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard 
              title="Total Compras" 
              value={kpis.totalPurchases} 
              icon={ShoppingCart} 
              color="blue"
            />
            <KpiCard 
              title="Pendientes" 
              value={kpis.pendingPurchases} 
              icon={Clock} 
              color="orange"
            />
            <KpiCard 
              title="Completadas" 
              value={kpis.completedPurchases} 
              icon={CheckCircle} 
              color="green"
            />
            <KpiCard 
              title="Ganadores" 
              value={kpis.winnersCount} 
              icon={Trophy} 
              color="purple"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>LuckyPasses Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Ticket className="w-8 h-8 text-primary" />
                <span className="text-4xl font-bold">{kpis.totalLuckyPasses.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'raffles' && (
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Rifas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Título</th>
                    <th className="text-left py-3 px-4">Estado</th>
                    <th className="text-right py-3 px-4">Progreso</th>
                    <th className="text-right py-3 px-4">Packs Vendidos</th>
                    <th className="text-right py-3 px-4">Meta</th>
                    <th className="text-right py-3 px-4">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {raffles.map((raffle) => (
                    <tr key={raffle.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{raffle.title || 'Sin título'}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(raffle.createdAt).toLocaleDateString('es-CL')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={raffle.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${raffle.progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-sm">{raffle.progressPercentage}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">{raffle.packsSold}</td>
                      <td className="py-3 px-4 text-right">{raffle.goalPacks}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        ${raffle.totalRevenue.toLocaleString()} CLP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
