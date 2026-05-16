import { useState } from 'react'
import { Gift, ChevronRight, Lock, RefreshCw, Clock, XCircle, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface HistoryItem {
  id: string
  name: string
  status: 'confirmado' | 'pendiente' | 'fallido'
  tickets: number
  amount?: number
  purchaseId?: string
  onRetry?: (purchaseId: string) => void
}

interface TicketHistoryProps {
  items: HistoryItem[]
  onItemClick?: (item: HistoryItem) => void
  limit?: number
  viewMoreHref?: string
}

const statusConfig = {
  confirmado: { label: 'Confirmado', icon: Gift, badge: 'success' as const, className: 'bg-success/10 text-success' },
  pendiente: { label: 'Pendiente', icon: Clock, badge: 'subtle' as const, className: 'bg-yellow-50 text-yellow-600 border border-yellow-200' },
  fallido: { label: 'Expirada', icon: XCircle, badge: 'muted' as const, className: 'bg-red-50 text-red-500 border border-red-200' },
}

export function TicketHistory({ items, onItemClick, limit, viewMoreHref }: TicketHistoryProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const hasMore = limit !== undefined && items.length > limit
  const visibleItems = hasMore ? items.slice(0, limit) : items

  return (
    <div className="glass-medium rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-text-primary">Mis Compras</h2>
      </div>

      <div className="space-y-1">
        {items.length === 0 && (
          <p className="text-sm text-text-tertiary text-center py-4">No tienes compras registradas</p>
        )}
        {visibleItems.map((item) => {
          const config = statusConfig[item.status]
          const StatusIcon = config.icon
          const isPending = item.status === 'pendiente'
          const isFailed = item.status === 'fallido'
          const isClickable = item.status === 'confirmado'
          const isExpanded = expandedIds.has(item.id)

          return (
            <div key={item.id}>
              {/* Mobile / Tablet (<=1023px): layout inline como antes */}
              <div
                className={`flex lg:hidden items-center gap-3 rounded-xl px-3 py-3 transition-colors ${isClickable ? 'hover:bg-bg-purple-soft/50 cursor-pointer' : ''}`}
                onClick={() => isClickable && onItemClick?.(item)}
              >
                <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
                  isPending ? 'bg-yellow-50' : isFailed ? 'bg-red-50' : 'bg-linear-to-br from-primary/20 to-secondary/20'
                }`}>
                  <StatusIcon className={`size-4 ${isPending ? 'text-yellow-500' : isFailed ? 'text-red-400' : 'text-primary'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{item.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      variant={config.badge}
                      className={`text-[10px] px-1.5 py-0 ${config.className}`}
                    >
                      {config.label}
                    </Badge>
                    {!isFailed && item.tickets > 0 && (
                      <span className="text-xs text-text-tertiary">{item.tickets} LuckyPass</span>
                    )}
                    {isPending && item.amount !== undefined && (
                      <span className="text-xs text-text-tertiary">
                        ${item.amount.toLocaleString('es-CL')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  {isPending && item.purchaseId && item.onRetry ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        item.onRetry?.(item.purchaseId!)
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 rounded-lg px-2.5 py-1.5 transition-colors"
                    >
                      <RefreshCw className="size-3" />
                      Pagar
                    </button>
                  ) : isFailed ? (
                    <Lock className="size-4 text-text-tertiary" />
                  ) : (
                    <ChevronRight className="size-4 text-text-tertiary" />
                  )}
                </div>
              </div>

              {/* Desktop (>=1024px): accordion con boton expandir */}
              <div className="hidden lg:block">
                <div
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${isClickable ? 'hover:bg-bg-purple-soft/50 cursor-pointer' : ''}`}
                  onClick={() => isClickable && onItemClick?.(item)}
                >
                  <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
                    isPending ? 'bg-yellow-50' : isFailed ? 'bg-red-50' : 'bg-linear-to-br from-primary/20 to-secondary/20'
                  }`}>
                    <StatusIcon className={`size-4 ${isPending ? 'text-yellow-500' : isFailed ? 'text-red-400' : 'text-primary'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{item.name}</p>
                    <Badge
                      variant={config.badge}
                      className={`text-[10px] px-1.5 py-0 mt-0.5 ${config.className}`}
                    >
                      {config.label}
                    </Badge>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); toggleExpand(item.id) }}
                    className="shrink-0 flex items-center justify-center size-8 rounded-lg hover:bg-bg-purple-soft/50 transition-colors"
                    title={isExpanded ? 'Colapsar' : 'Expandir'}
                  >
                    {isExpanded ? <ChevronUp className="size-4 text-text-tertiary" /> : <ChevronDown className="size-4 text-text-tertiary" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-3 pb-3 pl-[52px]">
                    <div className="flex items-center gap-3 flex-wrap">
                      {!isFailed && item.tickets > 0 && (
                        <span className="text-xs text-text-tertiary">{item.tickets} LuckyPass</span>
                      )}
                      {isPending && item.amount !== undefined && (
                        <span className="text-xs text-text-tertiary">${item.amount.toLocaleString('es-CL')}</span>
                      )}
                      {isPending && item.purchaseId && item.onRetry ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); item.onRetry?.(item.purchaseId!) }}
                          className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 rounded-lg px-2.5 py-1.5 transition-colors"
                        >
                          <RefreshCw className="size-3" />
                          Pagar
                        </button>
                      ) : isFailed ? (
                        <span className="flex items-center gap-1 text-xs text-text-tertiary">
                          <Lock className="size-3.5" /> Compra expirada
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-text-tertiary">
                          <ChevronRight className="size-3.5" /> Ver detalles
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {hasMore && viewMoreHref && (
          <a
            href={viewMoreHref}
            className="flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 mt-2 py-2 transition-colors"
          >
            Ver todas las compras
            <ArrowRight className="size-3.5" />
          </a>
        )}
      </div>
    </div>
  )
}
