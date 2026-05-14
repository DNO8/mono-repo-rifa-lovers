import { BarChart, PieChart } from '@mui/x-charts'
import type { OperatorKpiData } from '@/api/operator.api'
import type { RaffleWithStats } from '@/api/admin.api'

interface OperatorChartsProps {
  kpis: OperatorKpiData | null
  raffles: RaffleWithStats[] | null
}

const brandColors = ['#7B3FE4', '#FF4DA6', '#FF8A3D', '#22C55E', '#3B82F6', '#F59E0B', '#EF4444']

export function OperatorCharts({ kpis, raffles }: OperatorChartsProps) {
  if (!kpis) return null

  const barData = [
    { label: 'Ventas', value: kpis.totalSales },
    { label: 'Packs', value: kpis.packsSold },
    { label: 'Compras', value: kpis.totalPurchases },
    { label: 'Lucky Pass', value: kpis.totalLuckyPasses },
    { label: 'Ganadores', value: kpis.winnersCount },
  ]

  const pieData = [
    { id: 0, value: kpis.completedPurchases, label: 'Completadas' },
    { id: 1, value: kpis.pendingPurchases, label: 'Pendientes' },
    ...(kpis.failedPurchases > 0
      ? [{ id: 2, value: kpis.failedPurchases, label: 'Fallidas' }]
      : []),
  ]

  const raffleBarData = raffles?.map((r) => ({
    label: r.title ?? 'Sin título',
    value: r.totalRevenue,
  })) ?? []

  const statusCounts: Record<string, number> = {}
  raffles?.forEach((r) => {
    const key = r.status ?? 'unknown'
    statusCounts[key] = (statusCounts[key] ?? 0) + 1
  })

  const statusLabels: Record<string, string> = {
    draft: 'Borrador',
    active: 'Activa',
    sold_out: 'Agotada',
    closed: 'Cerrada',
    drawn: 'Sorteada',
    unknown: 'Desconocido',
  }

  const statusPieData = Object.entries(statusCounts).map(([key, value], idx) => ({
    id: idx,
    value,
    label: statusLabels[key] ?? key,
  }))

  return (
    <div className="space-y-6">
      {/* KPI Bar Chart */}
      <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">Métricas generales</h3>
        <BarChart
          dataset={barData}
          yAxis={[{ scaleType: 'band', dataKey: 'label' }]}
          series={[{ dataKey: 'value', label: 'Valor', color: brandColors[0], barLabel: 'value' }]}
          layout="horizontal"
          height={280}
          hideLegend
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purchase Status Pie */}
        <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Estado de compras</h3>
          <PieChart
            series={[
              {
                data: pieData,
                arcLabel: (item) => `${item.value}`,
                arcLabelMinAngle: 20,
                innerRadius: 40,
                outerRadius: 90,
                paddingAngle: 2,
                cornerRadius: 4,
              },
            ]}
            colors={brandColors}
            height={280}
            slotProps={{
              legend: {
                direction: 'horizontal',
                position: { vertical: 'bottom', horizontal: 'center' },
              },
            }}
          />
        </div>

        {/* Raffle Status Pie */}
        {statusPieData.length > 0 && (
          <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-text-secondary mb-3">Estado de rifas</h3>
            <PieChart
              series={[
                {
                  data: statusPieData,
                  arcLabel: (item) => `${item.value}`,
                  arcLabelMinAngle: 20,
                  innerRadius: 40,
                  outerRadius: 90,
                  paddingAngle: 2,
                  cornerRadius: 4,
                },
              ]}
              colors={brandColors}
              height={280}
              slotProps={{
                legend: {
                  direction: 'horizontal',
                  position: { vertical: 'bottom', horizontal: 'center' },
                },
              }}
            />
          </div>
        )}
      </div>

      {/* Revenue by Raffle */}
      {raffleBarData.length > 0 && (
        <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Ingresos por rifa</h3>
          <BarChart
            dataset={raffleBarData}
            yAxis={[{ scaleType: 'band', dataKey: 'label' }]}
            series={[{ dataKey: 'value', label: 'Ingresos (CLP)', color: brandColors[2], barLabel: 'value' }]}
            layout="horizontal"
            height={raffleBarData.length > 5 ? 400 : 280}
            hideLegend
          />
        </div>
      )}
    </div>
  )
}
