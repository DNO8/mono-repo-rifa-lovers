export const ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  raffles: {
    active: '/raffles/active',
    detail: (id: string) => `/raffles/${id}`,
  },
  checkout: {
    createOrder: '/checkout/create-order',
  },
  dashboard: {
    summary: '/dashboard/summary',
    impact: '/dashboard/impact',
  },
  contact: '/contact',
} as const
