import type { Testimonial, Winner } from '@/types/domain.types'

export const SHOW_WINNERS = false
export const SHOW_TESTIMONIALS = false

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    name: 'Carolina M.',
    avatar: '👩🏻',
    location: 'Santiago',
    text: '¡No lo podía creer! Activé 3 LuckyPass y gané el iPhone. Lo mejor es saber que parte de mi compra fue a una causa real.',
    rating: 5,
    isWinner: true,
    prizeName: 'iPhone 15 Pro',
  },
  {
    id: 't-2',
    name: 'Andrés P.',
    avatar: '👨🏽',
    location: 'Valparaíso',
    text: 'Me encanta la transparencia. El sorteo en vivo me dio mucha confianza. Ya llevo 4 rifas participando.',
    rating: 5,
  },
  {
    id: 't-3',
    name: 'Valentina R.',
    avatar: '👩🏼',
    location: 'Concepción',
    text: 'Participé por primera vez y quedé enganchada. Es fácil, rápido y sabes que tu plata hace algo bueno.',
    rating: 4,
  },
  {
    id: 't-4',
    name: 'Felipe G.',
    avatar: '👨🏻',
    location: 'Temuco',
    text: '¡Gané la PS5! El proceso fue super transparente y el premio llegó en 3 días. 100% recomendado.',
    rating: 5,
    isWinner: true,
    prizeName: 'PlayStation 5',
  },
  {
    id: 't-5',
    name: 'Sofía L.',
    avatar: '👩🏽',
    location: 'Antofagasta',
    text: 'Lo que más me gusta es el impacto social. Saber que mi LuckyPass ayuda a entregar becas es increíble.',
    rating: 5,
  },
  {
    id: 't-6',
    name: 'Matías D.',
    avatar: '👨🏼',
    location: 'La Serena',
    text: 'El sorteo en vivo es lo mejor. Todo transparente, sin trampas. Seguiré participando cada semana.',
    rating: 5,
  },
]

export const WINNERS: Winner[] = [
  {
    id: 'w-1',
    name: 'Carolina M.',
    avatar: '👩🏻',
    prize: 'iPhone 15 Pro',
    prizeEmoji: '📱',
    date: 'Hace 2 semanas',
    raffleName: 'Rifa Tech Premium',
  },
  {
    id: 'w-2',
    name: 'Felipe G.',
    avatar: '👨🏻',
    prize: 'PlayStation 5',
    prizeEmoji: '🎮',
    date: 'Hace 1 mes',
    raffleName: 'Rifa Gamer',
  },
  {
    id: 'w-3',
    name: 'Daniela S.',
    avatar: '👩🏽',
    prize: 'MacBook Air M3',
    prizeEmoji: '💻',
    date: 'Hace 1 mes',
    raffleName: 'Rifa Apple',
  },
  {
    id: 'w-4',
    name: 'Roberto K.',
    avatar: '👨🏽',
    prize: 'AirPods Pro',
    prizeEmoji: '🎧',
    date: 'Hace 6 semanas',
    raffleName: 'Rifa Mini',
  },
  {
    id: 'w-5',
    name: 'Isidora F.',
    avatar: '👩🏼',
    prize: 'Nintendo Switch OLED',
    prizeEmoji: '🕹️',
    date: 'Hace 2 meses',
    raffleName: 'Rifa Gamer 2',
  },
]
