export const ENDPOINTS = {

  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
  },

  users: {
    me: '/users/me',
  },

  purchases: {
    my: '/purchases/my',
    create: '/purchases',
    detail: (id: string) => `/purchases/${id}`,
  },

  luckyPasses: {
    my: '/lucky-passes/my',
    mySummary: '/lucky-passes/my/summary',
    checkAvailability: (raffleId: string, ticketNumber: number) =>
      `/lucky-passes/check-availability?raffleId=${raffleId}&ticketNumber=${ticketNumber}`,
  },

  raffles: {
    active: '/raffles/active',
    activeProgress: '/raffles/active/progress',
    detail: (id: string) => `/raffles/${id}`,
    draw: {
      results: (raffleId: string) => `/raffles/${raffleId}/winners`,
      check: (raffleId: string) => `/admin/raffles/${raffleId}/draw/check`,
      execute: (raffleId: string) => `/admin/raffles/${raffleId}/draw`,
    },
  },

  admin: {
    raffles: '/admin/raffles',
    raffle: (id: string) => `/admin/raffles/${id}`,
    raffleStatus: (id: string) => `/admin/raffles/${id}/status`,
    kpis: '/admin/kpis',
    users: '/admin/users',
    userRole: (id: string) => `/admin/users/${id}/role`,
    userBlock: (id: string) => `/admin/users/${id}/block`,
  },

  packs: {
    list: '/packs',
    detail: (id: string) => `/packs/${id}`,
  },

  payments: {
    initiate: '/payments/initiate',
  },

  testimonials: {
    create: '/testimonials',
    byRaffle: (raffleId: string) => `/raffles/${raffleId}/testimonials`,
    adminAll: '/admin/testimonials',
    adminPublish: (id: string) => `/admin/testimonials/${id}/publish`,
  },

  contact: '/contact',

} as const

