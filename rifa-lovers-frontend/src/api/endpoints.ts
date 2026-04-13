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

  checkout: {

    createOrder: '/checkout/create-order',

  },

  dashboard: {

    summary: '/dashboard/summary',

    impact: '/dashboard/impact',

  },

  contact: '/contact',

} as const

