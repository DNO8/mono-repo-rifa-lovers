import { BarChart, PieChart } from '@mui/x-charts'
import type { UserWithStats } from '@/api/admin.api'

interface UserChartsProps {
  users: UserWithStats[] | null
}

const brandColors = ['#7B3FE4', '#FF4DA6', '#FF8A3D', '#22C55E', '#3B82F6', '#F59E0B']

export function UserCharts({ users }: UserChartsProps) {
  if (!users || users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-text-tertiary text-sm">
        No hay usuarios para mostrar
      </div>
    )
  }

  // Status distribution
  const statusCounts: Record<string, number> = {}
  users.forEach((u) => {
    const key = u.status ?? 'unknown'
    statusCounts[key] = (statusCounts[key] ?? 0) + 1
  })

  const statusLabels: Record<string, string> = {
    active: 'Activos',
    blocked: 'Bloqueados',
    unknown: 'Desconocido',
  }

  const pieData = Object.entries(statusCounts).map(([key, value], idx) => ({
    id: idx,
    value,
    label: statusLabels[key] ?? key,
  }))

  // Role distribution
  const roleCounts: Record<string, number> = {}
  users.forEach((u) => {
    const key = u.role ?? 'unknown'
    roleCounts[key] = (roleCounts[key] ?? 0) + 1
  })

  const roleLabels: Record<string, string> = {
    admin: 'Admin',
    operator: 'Operador',
    customer: 'Cliente',
    unknown: 'Desconocido',
  }

  const roleData = Object.entries(roleCounts).map(([key, value], idx) => ({
    id: idx,
    value,
    label: roleLabels[key] ?? key,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">Usuarios por estado</h3>
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
          height={300}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">Usuarios por rol</h3>
        <BarChart
          dataset={roleData}
          xAxis={[{ scaleType: 'band', dataKey: 'label' }]}
          series={[{ dataKey: 'value', label: 'Cantidad', color: brandColors[0], barLabel: 'value' }]}
          height={300}
        />
      </div>
    </div>
  )
}
