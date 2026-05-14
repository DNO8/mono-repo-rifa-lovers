const RAFFLE_STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  draft:    { label: 'Borrador', cls: 'bg-gray-100 text-gray-700' },
  active:   { label: 'Activa',   cls: 'bg-green-100 text-green-700' },
  sold_out: { label: 'Agotada',  cls: 'bg-yellow-100 text-yellow-700' },
  closed:   { label: 'Cerrada',  cls: 'bg-red-100 text-red-700' },
  drawn:    { label: 'Sorteada', cls: 'bg-purple-100 text-purple-700' },
}

export function RaffleStatusBadge({ status }: { status: string }) {
  const cfg = RAFFLE_STATUS_CONFIG[status] || { label: status, cls: 'bg-gray-100 text-gray-700' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}
