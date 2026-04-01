import type { Milestone, ImpactMetric } from '@/types/domain.types'

export const MILESTONES: Milestone[] = [
  {
    id: 'ms-1',
    threshold: 500,
    emoji: '🛒',
    name: 'Carrito Lleno',
    title: '🛒 Carrito Lleno',
    description: 'Giftcard supermercado $100.000',
    status: 'completed',
    icon: '/icons/cart.svg',
  },
  {
    id: 'ms-2',
    threshold: 1000,
    emoji: '💸',
    name: 'Respiro RifaLovers',
    title: '💸 Respiro RifaLovers',
    description: '$250.000 en vivo (transferencia)',
    status: 'active',
    icon: '/icons/breath.svg',
  },
  {
    id: 'ms-3',
    threshold: 2500,
    emoji: '🌊',
    name: 'Escapada RifaLovers',
    title: '🌊 Escapada RifaLovers',
    description: 'Hotel + cena + experiencia',
    status: 'locked',
    icon: '/icons/scape.svg',
  },
  {
    id: 'ms-4',
    threshold: 3500,
    emoji: '💸',
    name: 'Respiro RifaLovers',
    title: '💸 Respiro RifaLovers',
    description: '$250.000 (reimpulso)',
    status: 'locked',
    icon: '/icons/breath.svg',
  },
  {
    id: 'ms-5',
    threshold: 5000,
    emoji: '🔓',
    name: 'Gran Desbloqueo RifaLovers',
    title: '🔓 Activación del Gran Desbloqueo',
    description: 'MacBook Air M5',
    status: 'locked',
    icon: '/icons/big_prize.svg',
  },
]

export const IMPACT_METRICS: ImpactMetric[] = [
  {
    id: 'metric-donations',
    label: 'ya entregados en impacto real',
    value: '+$24.5M',
    numericValue: 24,
    prefix: '+$',
    suffix: ',5M',
  },
  {
    id: 'metric-community',
    label: 'personas ya están participando',
    value: '+8.000',
    numericValue: 8000,
    prefix: '+',
  },
  {
    id: 'metric-smiles',
    label: 'Sonrisas generadas',
    value: '+8.421',
    numericValue: 8421,
    prefix: '+',
  },
]

export const SMILE_COUNT = 8421
