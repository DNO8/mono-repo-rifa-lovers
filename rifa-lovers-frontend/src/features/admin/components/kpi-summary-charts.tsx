import { BarChart, PieChart } from '@mui/x-charts'
import type { KpiData } from '@/api/admin.api'

interface KpiSummaryChartsProps {
  kpis: KpiData | null
}

const brandColors = ['#7B3FE4', '#FF4DA6', '#FF8A3D', '#22C55E', '#3B82F6', '#F59E0B', '#EF4444']

export function KpiSummaryCharts({ kpis }: KpiSummaryChartsProps) {
  if (!kpis) return null

  const barData = [
    { label: 'Ventas', value: kpis.totalSales },
    { label: 'Packs', value: kpis.packsSold },
    { label: 'Usuarios', value: kpis.activeUsers },
    { label: 'Rifas', value: kpis.activeRaffles },
    { label: 'Compras', value: kpis.totalPurchases },
    { label: 'Ganadores', value: kpis.winnersCount },
    { label: 'Lucky Pass', value: kpis.totalLuckyPasses },
  ]

  const pieData = [
    { id: 0, value: kpis.completedPurchases, label: 'Completadas' },
    { id: 1, value: kpis.pendingPurchases, label: 'Pendientes' },
    ...(kpis.totalPurchases > kpis.completedPurchases + kpis.pendingPurchases
      ? [{ id: 2, value: kpis.totalPurchases - kpis.completedPurchases - kpis.pendingPurchases, label: 'Otros' }]
      : []),
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">Métricas generales</h3>
        <BarChart
          dataset={barData}
          yAxis={[{ scaleType: 'band', dataKey: 'label' }]}
          series={[{ dataKey: 'value', label: 'Valor', color: brandColors[0], barLabel: 'value' }]}
          layout="horizontal"
          height={300}
          hideLegend
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">Estado de compras</h3>
        <PieChart
          series={[
            {
              data: pieData,
              arcLabel: (item) => `${item.value}`,
              arcLabelMinAngle: 20,
              innerRadius: 40,
              outerRadius: 100,
              paddingAngle: 2,
              cornerRadius: 4,
              highlightScope: { fade: 'global', highlight: 'item' },
            },
          ]}
          colors={brandColors}
          height={300}
          slotProps={{ legend: { direction: 'horizontal', position: { vertical: 'bottom', horizontal: 'center' } } }}
        />
      </div>
    </div>
  )
}
