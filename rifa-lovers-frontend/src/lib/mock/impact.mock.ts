import type { Milestone, ImpactMetric } from '@/types/domain.types'

export const MILESTONES: Milestone[] = [
  {
    id: 'ms-1',
    title: '500 becas entregadas',
    description: 'A familias que hoy tienen apoyo real.',
    status: 'completed',
    icon: 'GraduationCap',
  },
  {
    id: 'ms-2',
    title: '10 iPads para escuelas',
    description: 'Faltan 3 iPads para completar la meta.',
    status: 'active',
    icon: 'Tablet',
  },
  {
    id: 'ms-3',
    title: 'Refugio Animal RL',
    description: 'Próxima meta de impacto social.',
    status: 'locked',
    icon: 'Heart',
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
