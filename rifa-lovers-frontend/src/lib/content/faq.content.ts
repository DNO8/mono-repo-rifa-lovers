import type { FAQ } from '@/types/domain.types'

export const FAQS: FAQ[] = [
  {
    id: 'faq-1',
    question: '¿Cómo recibo mi LuckyPass?',
    answer:
      'Recibes tu LuckyPass al instante en tu correo electrónico y queda disponible en tu cuenta.',
    icon: 'Ticket',
  },
  {
    id: 'faq-2',
    question: '¿A dónde va el dinero?',
    answer:
      'Tu participación genera impacto real. Apoyamos causas verificadas y visibles para todos.',
    icon: 'Heart',
  },
  {
    id: 'faq-3',
    question: '¿Cuándo son los sorteos?',
    answer:
      'Todos los domingos a las 20:00 hrs. Te avisamos por email para que no te pierdas el sorteo en vivo.',
    icon: 'Radio',
  },
  {
    id: 'faq-4',
    question: '¿Es seguro participar?',
    answer:
      'Totalmente seguro y transparente. Pagos protegidos y sorteos en vivo verificables.',
    icon: 'Shield',
  },
]
