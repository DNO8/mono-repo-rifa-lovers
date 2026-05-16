export const ENDPOINTS = {

  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    resendConfirmation: '/auth/resend-confirmation',
  },

  users: {
    me: '/users/me',
    update: '/users/me',
  },

  purchases: {
    my: '/purchases/my',
    create: '/purchases',
    detail: (id: string) => `/purchases/${id}`,
    recentStream: '/purchases/recent/stream',
  },

  luckyPasses: {
    my: '/lucky-passes/my',
    mySummary: '/lucky-passes/my/summary',
    checkAvailability: (raffleId: string, ticketNumber: number) =>
      `/lucky-passes/check-availability?raffleId=${raffleId}&ticketNumber=${ticketNumber}`,
  },

  raffles: {
    active: '/raffles/active',
    public: '/raffles/public',
    activeProgress: '/raffles/active/progress',
    detail: (id: string) => `/raffles/${id}`,
    packs: (id: string) => `/raffles/${id}/packs`,
    progress: (id: string) => `/raffles/${id}/progress`,
    draw: {
      results: (raffleId: string) => `/raffles/${raffleId}/winners`,
      adminResults: (raffleId: string) => `/admin/raffles/${raffleId}/winners`,
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

  operator: {
    organization: '/operator/organization',
    kpis: '/operator/kpis',
    raffles: '/operator/raffles',
    raffle: (id: string) => `/operator/raffles/${id}`,
    raffleStatus: (id: string) => `/operator/raffles/${id}/status`,
    uploadCover: (id: string) => `/operator/raffles/${id}/upload-cover`,
    packs: (raffleId: string) => raffleId ? `/operator/raffles/${raffleId}/packs` : '/operator/raffles/packs',
    pack: (id: string) => `/operator/packs/${id}`,
    participants: (raffleId: string) => raffleId ? `/operator/raffles/${raffleId}/participants` : '/operator/raffles/participants',
    drawStatus: (raffleId: string) => raffleId ? `/operator/raffles/${raffleId}/draw/status` : '/operator/raffles/draw/status',
    drawExecute: (raffleId: string) => raffleId ? `/operator/raffles/${raffleId}/draw` : '/operator/raffles/draw',
    newsletterCampaigns: '/operator/newsletter/campaigns',
    newsletterSend: '/operator/newsletter/send',
  },

  packs: {
    list: '/packs',
    detail: (id: string) => `/packs/${id}`,
  },

  payments: {
    initiate: '/payments/initiate',
    verifyFlowStatus: '/payments/verify-flow-status',
    retry: '/payments/retry',
  },

  testimonials: {
    create: '/testimonials',
    byRaffle: (raffleId: string) => `/raffles/${raffleId}/testimonials`,
    adminAll: '/admin/testimonials',
    adminPublish: (id: string) => `/admin/testimonials/${id}/publish`,
  },

  contact: '/contact',

  newsletter: {
    subscribe: '/newsletter/subscribe',
    unsubscribe: '/newsletter/unsubscribe',
    check: '/newsletter/check',
    subscribers: '/newsletter/subscribers',
    campaigns: '/newsletter/campaigns',
    send: '/newsletter/send',
  },

  ticketReservations: {
    reserve: '/ticket-reservations',
    mine: '/ticket-reservations/mine',
    byPurchase: (purchaseId: string) => `/ticket-reservations/purchase/${purchaseId}`,
    release: (purchaseId: string) => `/ticket-reservations/${purchaseId}`,
  },

} as const

