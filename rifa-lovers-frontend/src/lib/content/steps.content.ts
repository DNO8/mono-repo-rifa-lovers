import type { Step } from '@/types/domain.types'

export const STEPS: Step[] = [
  {
    id: 'prize-1',
    number: '01',
    title: 'La comunidad desbloquea premios',
    description: 'Cada pack vendido acerca a la comunidad al siguiente hito. Mientras más personas participan, más premios se desbloquean para todos.',
    icon: 'ClipboardList',
    color: '#7B3FE4',
    bgColor: 'rgba(123, 63, 228, 0.1)',
  },
  {
    id: 'prize-2',
    number: '02',
    title: 'Siempre hay mínimo 1 premio garantizado',
    description: 'El primer hito es el más accesible y siempre se sortea. A medida que la comunidad avanza, se desbloquean premios cada vez más grandes.',
    icon: 'Gift',
    color: '#FF4DA6',
    bgColor: 'rgba(255, 77, 166, 0.1)',
  },
  {
    id: 'prize-3',
    number: '03',
    title: 'Solo se rifan los premios desbloqueados',
    description: 'Al llegar la fecha del sorteo, se rifan únicamente los premios que la comunidad logró desbloquear. Si hay 3 hitos alcanzados, se sortean 3 premios.',
    icon: 'Radio',
    color: '#FF4DA6',
    bgColor: 'rgba(255, 77, 166, 0.15)',
    isHighlighted: true,
  },
  {
    id: 'prize-4',
    number: '04',
    title: 'Sorteo en vivo y verificable',
    description: 'Cada premio se sortea en vivo ante toda la comunidad. Los ganadores se seleccionan de forma aleatoria y transparente, un premio a la vez.',
    icon: 'Award',
    color: '#FF8A3D',
    bgColor: 'rgba(255, 138, 61, 0.1)',
  },
]
