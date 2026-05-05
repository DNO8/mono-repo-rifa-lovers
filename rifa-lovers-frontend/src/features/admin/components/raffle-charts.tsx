import { BarChart, PieChart } from '@mui/x-charts'
import type { RaffleWithStats } from '@/api/admin.api'

interface RaffleChartsProps {
  raffles: RaffleWithStats[] | null
}

const brandColors = ['#7B3FE4', '#FF4DA6', '#FF8A3D', '#22C55E', '#3B82F6', '#F59E0B', '#EF4444']

export function RaffleCharts({ raffles }: RaffleChartsProps) {
  if (!raffles || raffles.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-text-tertiary text-sm">
        No hay rifas para mostrar
      </div>
    )
  }

  // Revenue by raffle
  const barData = raffles.map((r) => ({
    label: r.title ?? 'Sin título',
    value: r.totalRevenue,
  }))

  // Status distribution
  const statusCounts: Record<string, number> = {}
  raffles.forEach((r) => {
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

  const pieData = Object.entries(statusCounts).map(([key, value], idx) => ({
    id: idx,
    value,
    label: statusLabels[key] ?? key,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">Ingresos por rifa</h3>
        <BarChart
          dataset={barData}
          yAxis={[{ scaleType: 'band', dataKey: 'label' }]}
          series={[{ dataKey: 'value', label: 'Ingresos (CLP)', color: brandColors[0], barLabel: 'value' }]}
          layout="horizontal"
          height={350}
          hideLegend
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">Estado de rifas</h3>
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
            },
          ]}
          colors={brandColors}
          height={350}
          slotProps={{
            legend: {
              direction: 'horizontal',
              position: { vertical: 'bottom', horizontal: 'center' },
            },
          }}
        />
      </div>
    </div>
  )
}
