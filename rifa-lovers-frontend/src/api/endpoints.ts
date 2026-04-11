export const ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    refresh: '/auth/refresh',
  },
  purchases: {
    my: '/purchases/my',
    create: '/purchases',
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
  packs: {
    list: '/packs',
    detail: (id: string) => `/packs/${id}`,
  },
  payments: {
    initiate: '/payments/initiate',
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
