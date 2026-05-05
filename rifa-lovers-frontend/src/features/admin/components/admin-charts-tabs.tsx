import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { KpiSummaryCharts } from './kpi-summary-charts'
import { RaffleCharts } from './raffle-charts'
import { UserCharts } from './user-charts'
import type { KpiData, RaffleWithStats, UserWithStats } from '@/api/admin.api'

const tabs = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'rifas', label: 'Rifas' },
  { id: 'usuarios', label: 'Usuarios' },
] as const

interface AdminChartsTabsProps {
  kpis: KpiData | null
  raffles: RaffleWithStats[] | null
  users: UserWithStats[] | null
  isLoading: boolean
}

export function AdminChartsTabs({ kpis, raffles, users, isLoading }: AdminChartsTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('resumen')

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center gap-2 mb-6 border-b border-border-light/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab.id
                ? 'text-primary border-primary'
                : 'text-text-tertiary border-transparent hover:text-text-secondary',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <span className="size-8 border-2 border-border-light border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && activeTab === 'resumen' && <KpiSummaryCharts kpis={kpis} />}
      {!isLoading && activeTab === 'rifas' && <RaffleCharts raffles={raffles} />}
      {!isLoading && activeTab === 'usuarios' && <UserCharts users={users} />}
    </Card>
  )
}
