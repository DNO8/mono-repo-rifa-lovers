import { useParams, Link } from 'react-router'
import { Trophy, ArrowLeft, Medal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { getDrawResults } from '@/api/draw.api'
import { useAsyncData } from '@/hooks/use-async-data'
import type { DrawResults } from '@/api/draw.api'

export default function WinnersPage() {
  const { id } = useParams<{ id: string }>()

  const { data: results, isLoading } = useAsyncData<DrawResults | null>(
    () => getDrawResults(id!),
    null,
    [id],
  )

  return (
    <div className="min-h-screen bg-bg-base px-4 py-12">
      <div className="mx-auto max-w-xl">
        <Link to="/">
          <Button variant="secondary" size="md" className="mb-8">
            <ArrowLeft className="size-4" />
            Volver al inicio
          </Button>
        </Link>

        <div className="text-center mb-10">
          <Badge variant="gradient" className="mb-4">
            <Trophy className="size-3" />
            Resultados del Sorteo
          </Badge>
          <h1 className="text-3xl font-extrabold text-text-primary">Ganadores</h1>
          {results && (
            <p className="text-sm text-text-tertiary mt-2">
              Sorteado el {new Date(results.drawnAt).toLocaleDateString('es-CL', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {!isLoading && !results && (
          <div className="text-center py-16">
            <Trophy className="size-12 text-text-tertiary mx-auto mb-4 opacity-40" />
            <p className="text-text-secondary">El sorteo aún no se ha realizado para esta rifa.</p>
          </div>
        )}

        {!isLoading && results && results.winners.length === 0 && (
          <div className="text-center py-16">
            <p className="text-text-secondary">No hay ganadores registrados.</p>
          </div>
        )}

        {!isLoading && results && results.winners.length > 0 && (
          <div className="space-y-4">
            {results.winners.map((winner, i) => (
              <div
                key={winner.luckyPassId}
                className="glass-medium rounded-2xl p-5 flex items-center gap-4"
              >
                <div className="shrink-0 flex flex-col items-center gap-1">
                  <Medal className={`size-8 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : 'text-amber-600'}`} />
                  <span className="text-xs font-bold text-text-tertiary">#{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text-primary truncate">{winner.prizeName}</p>
                  <p className="text-sm text-text-secondary truncate">
                    {winner.userName ?? 'Ganador anónimo'}
                  </p>
                  <p className="text-xs font-mono text-primary mt-1">
                    LuckyPass #{winner.passNumber}
                  </p>
                </div>
                <Trophy className="size-5 text-yellow-400 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
