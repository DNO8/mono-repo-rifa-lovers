import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar-custom'
import { Crown, Trophy } from 'lucide-react'

interface GanadoresListProps {
  winners: Array<{
    userId: string
    email: string | null
    firstName: string | null
    lastName: string | null
    prizeId: string
    prizeName: string
    luckyPassId: string
  }>
}

export function GanadoresList({ winners }: GanadoresListProps) {
  if (winners.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary">
        <Trophy className="size-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay ganadores aún</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-3">
        {winners.map((winner, index) => {
          const displayName = winner.firstName && winner.lastName 
            ? `${winner.firstName} ${winner.lastName}`
            : winner.firstName || winner.email || 'Usuario desconocido'
          
          return (
            <div
              key={winner.prizeId}
              className="flex items-center gap-3 p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 animate-in slide-in-from-right duration-500"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="relative">
                <Avatar className="size-10">
                  <AvatarFallback className="bg-yellow-500 text-black text-sm font-bold">
                    {winner.firstName && winner.lastName 
                      ? `${winner.firstName[0]}${winner.lastName[0]}`.toUpperCase()
                      : winner.firstName?.[0]?.toUpperCase() || winner.email?.[0]?.toUpperCase() || '?'
                    }
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -right-1">
                  <Crown className="size-4 text-yellow-500" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-yellow-400 truncate">
                    {displayName}
                  </span>
                  <Badge variant="outline-primary" className="bg-yellow-500 text-black text-xs">
                    #{index + 1}
                  </Badge>
                </div>
                
                <div className="text-xs text-text-secondary mb-1">
                  {winner.email}
                </div>
                
                <div className="flex items-center gap-1">
                  <Trophy className="size-3 text-yellow-500" />
                  <span className="text-xs font-medium text-yellow-400">
                    {winner.prizeName}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {winners.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
          <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
            <Trophy className="size-4" />
            ¡Sorteo Exitoso!
          </div>
          <p className="text-xs text-text-secondary mt-1">
            {winners.length} premio{winners.length !== 1 ? 's' : ''} asignado{winners.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </ScrollArea>
  )
}
