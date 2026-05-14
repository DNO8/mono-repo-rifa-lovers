import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: number
  icon: LucideIcon
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  suffix?: string
}

export function KpiCard({ title, value, icon: Icon, color = 'blue', suffix = '' }: KpiCardProps) {
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
