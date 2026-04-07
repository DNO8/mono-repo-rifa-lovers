export const ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  purchases: {
    my: '/purchases/my',
  },
  luckyPasses: {
    my: '/lucky-passes/my',
    mySummary: '/lucky-passes/my/summary',
  },
  raffles: {
    active: '/raffles/active',
    activeProgress: '/raffles/active/progress',
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
