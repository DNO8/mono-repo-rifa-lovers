import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar-custom'
import { Crown, X, User } from 'lucide-react'
import type { CustomerDrawParticipant } from '@/types/streaming.types'

interface ParticipantesListProps {
  participants: CustomerDrawParticipant[]
  winners: Array<{
    userId: string
    firstName: string | null
    lastName: string | null
    email: string | null
  }>
  discarded: Array<{
    userId: string
    firstName: string | null
    lastName: string | null
    email: string | null
  }>
}

export function ParticipantesList({ participants, winners, discarded }: ParticipantesListProps) {
  const isWinner = (userId: string) => winners.some(w => w.userId === userId)
  const isDiscarded = (userId: string) => discarded.some(d => d.userId === userId)

  const getParticipantStatus = (userId: string) => {
    if (isWinner(userId)) return 'winner'
    if (isDiscarded(userId)) return 'discarded'
    return 'active'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'winner':
        return (
          <Badge variant="outline-primary" className="bg-yellow-500 text-black">
            <Crown className="size-3 mr-1" />
            Ganador
          </Badge>
        )
      case 'discarded':
        return (
          <Badge variant="subtle" className="bg-blue-500">
            <X className="size-3 mr-1" />
            Agua
          </Badge>
        )
      default:
        return (
          <Badge variant="outline-primary" className="border-green-500 text-green-500">
            Activo
          </Badge>
        )
    }
  }

  const sortedParticipants = [...participants].sort((a, b) => {
    const statusA = getParticipantStatus(a.userId)
    const statusB = getParticipantStatus(b.userId)
    
    // Order: active -> discarded -> winner
    const priority = { active: 0, discarded: 1, winner: 2 }
    return priority[statusA] - priority[statusB]
  })

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-2">
        {sortedParticipants.map((participant) => {
          const status = getParticipantStatus(participant.userId)
          const displayName = participant.firstName && participant.lastName 
            ? `${participant.firstName} ${participant.lastName}`
            : participant.firstName || participant.email || 'Usuario desconocido'
          
          return (
            <div
              key={participant.userId}
              className={`
                flex items-center gap-3 p-3 rounded-lg border transition-all
                ${status === 'winner' ? 'bg-yellow-500/10 border-yellow-500/50' : ''}
                ${status === 'discarded' ? 'bg-blue-500/10 border-blue-500/50' : ''}
                ${status === 'active' ? 'bg-bg-card border-border' : ''}
              `}
            >
              <Avatar className="size-8">
                <div className="flex items-center justify-center w-full h-full bg-primary text-white text-sm font-medium">
                  {participant.firstName && participant.lastName 
                    ? `${participant.firstName[0]}${participant.lastName[0]}`.toUpperCase()
                    : participant.firstName?.[0]?.toUpperCase() || participant.email?.[0]?.toUpperCase() || '?'
                  }
                </div>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white truncate">
                    {displayName}
                  </span>
                  {status === 'winner' && <Crown className="size-4 text-yellow-500" />}
                  {status === 'discarded' && <X className="size-4 text-blue-500" />}
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(status)}
                  <span className="text-xs text-text-secondary">
                    {participant.luckyPassIds.length} ticket{participant.luckyPassIds.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
        
        {participants.length === 0 && (
          <div className="text-center py-8 text-text-secondary">
            <User className="size-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay participantes</p>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
