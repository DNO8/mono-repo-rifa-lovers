import { SEOHead } from '@/components/shared/seo/helmet-wrapper'
import { TicketHistory, type HistoryItem } from '../components/ticket-history'
import { usePurchases } from '@/hooks/use-purchases'
import { retryPayment } from '@/api/purchases.api'
import { toast } from 'react-toastify'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import type { Purchase } from '@/types/domain.types'

const mapStatus = (status: string): 'confirmado' | 'pendiente' | 'fallido' => {
  switch (status) {
    case 'paid':
      return 'confirmado'
    case 'pending':
      return 'pendiente'
    default:
      return 'fallido'
  }
}

const transformPurchasesToHistory = (purchases: Purchase[], onRetry?: (id: string) => void): HistoryItem[] => {
  return purchases.map((p) => ({
    id: p.id,
    name: p.raffleName || 'Rifa sin nombre',
    status: mapStatus(p.status),
    tickets: p.luckyPassCount || 0,
    amount: p.totalAmount,
    purchaseId: p.id,
    onRetry,
  }))
}

export default function MisComprasPage() {
  const navigate = useNavigate()
  const { purchases, isLoading } = usePurchases()

  const handleRetry = async (purchaseId: string) => {
    try {
      const result = await retryPayment(purchaseId)
      toast.success('Redirigiendo a Flow para completar el pago...')
      window.location.assign(result.paymentUrl)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al reintentar el pago'
      toast.error(msg)
    }
  }

  const historyItems = transformPurchasesToHistory(purchases, handleRetry)

  return (
    <>
      <SEOHead title="Mis Compras" noindex />
      <div className="px-4 md:px-8 py-8 md:py-12">
        <div className="mx-auto max-w-[800px]">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Volver al dashboard
          </button>

          <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">Mis Compras</h1>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <TicketHistory items={historyItems} />
          )}
        </div>
      </div>
    </>
  )
}
