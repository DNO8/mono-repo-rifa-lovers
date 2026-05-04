import { useState, useRef, useEffect } from 'react'
import { Trophy, Crown, Phone, Mail, MapPin, Loader2 } from 'lucide-react'
import { useAdminDrawResults } from '@/hooks/use-admin-draw-results'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar-custom'

interface WinnersDropdownProps {
  raffleId: string
  children: React.ReactNode
}

export function WinnersDropdown({ raffleId, children }: WinnersDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { results, isLoading } = useAdminDrawResults(open ? raffleId : undefined)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const winners = results?.winners ?? []

  return (
    <div ref={ref} className="relative inline-block">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen((v) => !v) }}
        className="inline-block p-1.5 rounded hover:bg-yellow-50 text-yellow-600 cursor-pointer"
        title="Ver ganadores"
      >
        {children}
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-[420px] max-w-[90vw] bg-white border border-border-light rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border-light flex items-center gap-2 bg-bg-muted">
            <Trophy className="size-4 text-yellow-500" />
            <h3 className="text-sm font-semibold text-text-primary">Ganadores</h3>
            <Badge variant="subtle" className="text-xs">
              {winners.length}
            </Badge>
          </div>

          <div className="p-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 gap-2 text-text-secondary">
                <Loader2 className="size-4 animate-spin" />
                <span className="text-sm">Cargando ganadores...</span>
              </div>
            ) : winners.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <Trophy className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay ganadores registrados</p>
              </div>
            ) : (
              <ScrollArea className="h-[340px] pr-2">
                <div className="space-y-3">
                  {winners.map((winner, index) => {
                    const displayName = winner.userName || winner.userEmail || 'Usuario desconocido'
                    const initials = winner.userName
                      ? winner.userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                      : winner.userEmail?.[0]?.toUpperCase() || '?'

                    return (
                      <div
                        key={winner.prizeId}
                        className="flex gap-3 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5"
                      >
                        <div className="relative shrink-0">
                          <Avatar className="size-9">
                            <AvatarFallback className="bg-yellow-500 text-black text-xs font-bold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1">
                            <Crown className="size-3 text-yellow-500" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-text-primary truncate">
                              {displayName}
                            </span>
                            <Badge variant="outline-primary" className="text-[10px] bg-yellow-500 text-black">
                              #{index + 1}
                            </Badge>
                          </div>

                          <div className="text-xs font-medium text-primary">
                            {winner.prizeName}
                          </div>

                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-secondary">
                            {winner.userEmail && (
                              <span className="flex items-center gap-1">
                                <Mail className="size-3" />
                                {winner.userEmail}
                              </span>
                            )}
                            {winner.userPhone != null && (
                              <span className="flex items-center gap-1">
                                <Phone className="size-3" />
                                {winner.userPhone}
                              </span>
                            )}
                            {winner.userAddress && (
                              <span className="flex items-center gap-1">
                                <MapPin className="size-3" />
                                {winner.userAddress}
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-text-tertiary">
                            Lucky Pass #{winner.passNumber || '?'}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
