/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import { PageWithSuspense } from './route-wrappers'
import { ProtectedRoute } from './protected-route'
import { RouteErrorBoundary } from '@/components/shared/chunk-error-boundary'
import { LandingPageSkeleton } from '@/components/skeletons/landing-skeleton'
import { ImpactPageSkeleton } from '@/components/skeletons/impact-skeleton'
import { AboutPageSkeleton } from '@/components/skeletons/about-skeleton'
import { ContactPageSkeleton } from '@/components/skeletons/contact-skeleton'
import { AuthPageSkeleton } from '@/components/skeletons/auth-skeleton'
import { DashboardPageSkeleton } from '@/components/skeletons/dashboard-skeleton'
import { CheckoutPageSkeleton } from '@/components/skeletons/checkout-skeleton'
import { RaffleDetailPageSkeleton } from '@/components/skeletons/raffle-detail-skeleton'
import { StreamingPageSkeleton } from '@/components/skeletons/streaming-skeleton'

const LazyLandingPage = lazy(() => import('@/features/landing/pages/landing.page'))
const LazyImpactPage = lazy(() => import('@/features/impact/pages/impact.page'))
const LazyAboutPage = lazy(() => import('@/features/about/pages/about.page'))
const LazyContactPage = lazy(() => import('@/features/contact/pages/contact.page'))
const LazyLoginPage = lazy(() => import('@/features/auth/pages/login.page'))
const LazyRegisterPage = lazy(() => import('@/features/auth/pages/register.page'))
const LazyForgotPasswordPage = lazy(() => import('@/features/auth/pages/forgot-password.page'))
const LazyResetPasswordPage = lazy(() => import('@/features/auth/pages/reset-password.page'))
const LazyConfirmPage = lazy(() => import('@/features/auth/pages/confirm.page'))
const LazyVerifyEmailPage = lazy(() => import('@/features/auth/pages/verify-email.page'))
const LazyDashboardPage = lazy(() => import('@/features/dashboard/pages/dashboard.page'))
const LazyCheckoutPage = lazy(() => import('@/features/checkout/pages/checkout.page'))
const LazyRaffleDetailPage = lazy(() => import('@/features/dashboard/pages/raffle-detail.page'))
const LazyPaymentReturnPage = lazy(() => import('@/features/checkout/pages/payment-return.page'))
const LazyPackMomPage = lazy(() => import('@/features/pack-mom/pages/pack-mom.page'))
const LazyAdminDashboardPage = lazy(() => import('@/features/admin/pages/admin-dashboard.page').then(m => ({ default: m.AdminDashboardPage })))
const LazyNotFoundPage = lazy(() => import('@/features/errors/pages/not-found.page'))
const LazyWinnersPage = lazy(() => import('@/features/raffles/pages/winners.page'))
const LazyStreamingPage = lazy(() => import('@/features/streaming/pages/streaming.page'))
const LazyBasesLegalesPage = lazy(() => import('@/features/legal/pages/bases-legales.page'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PageWithSuspense fallback={<LandingPageSkeleton />}>
        <LazyLandingPage />
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/impacto',
    element: (
      <PageWithSuspense fallback={<ImpactPageSkeleton />}>
        <LazyImpactPage />
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/nosotros',
    element: (
      <PageWithSuspense fallback={<AboutPageSkeleton />}>
        <LazyAboutPage />
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/contacto',
    element: (
      <PageWithSuspense fallback={<ContactPageSkeleton />}>
        <LazyContactPage />
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/login',
    element: (
      <PageWithSuspense fallback={<AuthPageSkeleton />}>
        <LazyLoginPage />
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/registro',
    element: (
      <PageWithSuspense fallback={<AuthPageSkeleton />}>
        <LazyRegisterPage />
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/recuperar-contrasena',
    element: (
      <PageWithSuspense fallback={<AuthPageSkeleton />}>
        <LazyForgotPasswordPage />
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/reset-password',
    element: (
      <PageWithSuspense fallback={<AuthPageSkeleton />}>
        <LazyResetPasswordPage />
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/auth/confirm',
    element: (
      <PageWithSuspense fallback={<AuthPageSkeleton />}>
        <LazyConfirmPage />
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/verificar-correo',
    element: (
      <PageWithSuspense fallback={<AuthPageSkeleton />}>
        <LazyVerifyEmailPage />
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/dashboard',
    element: (
      <PageWithSuspense fallback={<DashboardPageSkeleton />}>
        <ProtectedRoute>
          <LazyDashboardPage />
        </ProtectedRoute>
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/checkout',
    element: (
      <PageWithSuspense fallback={<CheckoutPageSkeleton />}>
        <ProtectedRoute>
          <LazyCheckoutPage />
        </ProtectedRoute>
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/bases-legales',
    element: (
      <PageWithSuspense fallback={null}>
        <LazyBasesLegalesPage />
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/terminos',
    element: (
      <PageWithSuspense fallback={null}>
        <LazyBasesLegalesPage />
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/privacidad',
    element: (
      <PageWithSuspense fallback={null}>
        <LazyBasesLegalesPage />
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/pack-mom',
    element: (
      <PageWithSuspense fallback={<LandingPageSkeleton />}>
        <LazyPackMomPage />
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/admin',
    element: (
      <PageWithSuspense fallback={<DashboardPageSkeleton />}>
        <ProtectedRoute requiredRole="admin">
          <LazyAdminDashboardPage />
        </ProtectedRoute>
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/payment/return',
    element: (
      <PageWithSuspense fallback={<CheckoutPageSkeleton />}>
        <LazyPaymentReturnPage />
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/raffle/:id',
    element: (
      <PageWithSuspense fallback={<RaffleDetailPageSkeleton />}>
        <ProtectedRoute>
          <LazyRaffleDetailPage />
        </ProtectedRoute>
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/raffle/:id/winners',
    element: (
      <PageWithSuspense fallback={null}>
        <LazyWinnersPage />
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/stream/:raffleId',
    element: (
      <PageWithSuspense fallback={<StreamingPageSkeleton />}>
        <ProtectedRoute allowedRoles={['operator', 'admin']}>
          <LazyStreamingPage />
        </ProtectedRoute>
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '*',
    element: (
      <PageWithSuspense fallback={null}>
        <LazyNotFoundPage />
      </PageWithSuspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
])
