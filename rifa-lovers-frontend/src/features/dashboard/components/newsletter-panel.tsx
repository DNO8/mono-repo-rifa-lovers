import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { useAsyncData } from '@/hooks/use-async-data'
import {
  getNewsletterSubscribers,
  getNewsletterCampaigns,
  sendNewsletterCampaign,
} from '@/api/newsletter.api'
import {
  Mail,
  Send,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

export function NewsletterPanel() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendResult, setSendResult] = useState<{
    success: boolean
    message: string
    recipientCount?: number
    errors?: string[]
  } | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showSubscribers, setShowSubscribers] = useState(false)
  const [showCampaigns, setShowCampaigns] = useState(false)

  const {
    data: subscribersData,
    isLoading: isLoadingSubscribers,
    refresh: refreshSubscribers,
  } = useAsyncData(getNewsletterSubscribers, { subscribers: [], activeCount: 0, totalCount: 0 })

  const {
    data: campaigns,
    isLoading: isLoadingCampaigns,
    refresh: refreshCampaigns,
  } = useAsyncData(getNewsletterCampaigns, [])

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return
    setIsSending(true)
    setSendResult(null)
    try {
      const result = await sendNewsletterCampaign({ subject: subject.trim(), body: body.trim() })
      setSendResult({
        success: true,
        message: `Campaña enviada a ${result.recipientCount} suscriptores`,
        recipientCount: result.recipientCount,
        errors: result.errors,
      })
      refreshCampaigns()
      refreshSubscribers()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al enviar la campaña'
      setSendResult({ success: false, message: msg })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg gradient-rl">
          <Mail className="size-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">Newsletter</h2>
          <p className="text-sm text-text-secondary">
            Envía correos masivos a tus suscriptores
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="p-4 text-center glass-light">
          <div className="text-2xl font-bold text-primary">{subscribersData.activeCount}</div>
          <div className="text-xs text-text-secondary mt-1 flex items-center justify-center gap-1">
            <Users className="size-3" />
            Suscriptores activos
          </div>
        </Card>
        <Card className="p-4 text-center glass-light">
          <div className="text-2xl font-bold text-text-primary">{subscribersData.totalCount}</div>
          <div className="text-xs text-text-secondary mt-1">Total suscriptores</div>
        </Card>
        <Card className="p-4 text-center glass-light">
          <div className="text-2xl font-bold text-text-primary">{campaigns.length}</div>
          <div className="text-xs text-text-secondary mt-1">Campañas enviadas</div>
        </Card>
      </div>

      {/* Compose */}
      <Card className="p-5 glass-light">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
          <Send className="size-4" />
          Nueva campaña
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Asunto</label>
            <input
              type="text"
              value={subject}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
              placeholder="Ej: ¡Nuevos ganadores anunciados!"
              className="w-full rounded-xl border border-border-light bg-bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Mensaje (HTML permitido)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Escribe el contenido del correo..."
              rows={6}
              className="w-full rounded-xl border border-border-light bg-bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleSend}
              disabled={isSending || !subject.trim() || !body.trim()}
              className="gap-2"
            >
              {isSending ? <Spinner size="sm" /> : <Send className="size-4" />}
              {isSending ? 'Enviando...' : 'Enviar campaña'}
            </Button>

            <Button
              variant="outline-primary"
              size="md"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Eye className="size-4" />
              {showPreview ? 'Ocultar vista previa' : 'Vista previa'}
            </Button>
          </div>

          {sendResult && (
            <div
              className={`rounded-xl px-4 py-3 text-sm flex items-start gap-2 ${
                sendResult.success
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {sendResult.success ? (
                <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="size-4 mt-0.5 shrink-0" />
              )}
              <div>
                <p className="font-medium">{sendResult.message}</p>
                {sendResult.errors && sendResult.errors.length > 0 && (
                  <p className="text-xs mt-1 opacity-80">
                    Errores en: {sendResult.errors.join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="mt-4 border border-border-light rounded-xl overflow-hidden bg-white">
            <div className="bg-bg-purple-soft px-4 py-2 border-b border-border-light">
              <span className="text-xs font-semibold text-text-secondary">Vista previa</span>
            </div>
            <div className="p-4">
              <div
                className="prose prose-sm max-w-none text-text-primary"
                dangerouslySetInnerHTML={{
                  __html: `<h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111827;">${subject || '(Sin asunto)'}</h2>${body || '<p style="color:#9ca3af;">Escribe el contenido para ver la vista previa...</p>'}`,
                }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Subscribers list */}
      <Card className="glass-light overflow-hidden">
        <button
          onClick={() => setShowSubscribers(!showSubscribers)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-bg-purple-soft/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Users className="size-4 text-text-secondary" />
            <span className="font-semibold text-text-primary">Suscriptores</span>
            <Badge variant="subtle" className="text-[10px]">{subscribersData.totalCount}</Badge>
          </div>
          {showSubscribers ? <ChevronUp className="size-4 text-text-tertiary" /> : <ChevronDown className="size-4 text-text-tertiary" />}
        </button>

        {showSubscribers && (
          <div className="px-5 pb-5">
            {isLoadingSubscribers ? (
              <div className="flex justify-center py-6">
                <Spinner size="sm" />
              </div>
            ) : subscribersData.subscribers.length === 0 ? (
              <p className="text-sm text-text-tertiary text-center py-4">No hay suscriptores aún</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {subscribersData.subscribers.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-bg-white border border-border-light"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">{sub.email}</p>
                      {sub.name && <p className="text-xs text-text-tertiary">{sub.name}</p>}
                    </div>
                    <Badge
                      variant={sub.isActive ? 'success' : 'subtle'}
                      className="text-[10px]"
                    >
                      {sub.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Campaigns history */}
      <Card className="glass-light overflow-hidden">
        <button
          onClick={() => setShowCampaigns(!showCampaigns)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-bg-purple-soft/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-text-secondary" />
            <span className="font-semibold text-text-primary">Historial de campañas</span>
            <Badge variant="subtle" className="text-[10px]">{campaigns.length}</Badge>
          </div>
          {showCampaigns ? <ChevronUp className="size-4 text-text-tertiary" /> : <ChevronDown className="size-4 text-text-tertiary" />}
        </button>

        {showCampaigns && (
          <div className="px-5 pb-5">
            {isLoadingCampaigns ? (
              <div className="flex justify-center py-6">
                <Spinner size="sm" />
              </div>
            ) : campaigns.length === 0 ? (
              <p className="text-sm text-text-tertiary text-center py-4">Aún no se han enviado campañas</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {campaigns.map((camp) => (
                  <div
                    key={camp.id}
                    className="flex items-start justify-between px-3 py-2.5 rounded-lg bg-bg-white border border-border-light"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{camp.subject}</p>
                      <p className="text-xs text-text-tertiary flex items-center gap-1 mt-0.5">
                        <Clock className="size-3" />
                        {camp.sentAt
                          ? new Date(camp.sentAt).toLocaleDateString('es-CL')
                          : 'Borrador'}
                      </p>
                    </div>
                    <Badge variant="gradient" className="text-[10px] shrink-0">
                      {camp.recipientCount} enviados
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
