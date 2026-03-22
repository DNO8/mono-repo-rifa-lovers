import type { Step } from '@/types/domain.types'

export const STEPS: Step[] = [
  {
    id: 'step-1',
    number: '01',
    title: 'Regístrate y elige tus tickets',
    description: 'Crea tu cuenta, selecciona tus tickets y comienza a participar en segundos.',
    icon: 'ClipboardList',
    color: '#7B3FE4',
    bgColor: 'rgba(123, 63, 228, 0.1)',
  },
  {
    id: 'step-2',
    number: '02',
    title: 'Participa y suma oportunidades',
    description: 'Cada ticket te acerca a ganar y genera impacto real.',
    icon: 'Gift',
    color: '#FF4DA6',
    bgColor: 'rgba(255, 77, 166, 0.1)',
  },
  {
    id: 'step-3',
    number: '03',
    title: 'Vive el sorteo en vivo',
    description: 'Sorteos transparentes, en tiempo real y sin trucos.',
    icon: 'Radio',
    color: '#FF4DA6',
    bgColor: 'rgba(255, 77, 166, 0.15)',
    isHighlighted: true,
  },
  {
    id: 'step-4',
    number: '04',
    title: 'Gana y genera impacto',
    description: 'Recibe tu premio y ve cómo tu participación cambia vidas.',
    icon: 'Award',
    color: '#FF8A3D',
    bgColor: 'rgba(255, 138, 61, 0.1)',
  },
]
