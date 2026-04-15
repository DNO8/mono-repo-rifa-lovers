/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import { PageWithSuspense } from './route-wrappers'
import { ProtectedRoute } from './protected-route'
import { LandingPageSkeleton } from '@/components/skeletons/landing-skeleton'
import { ImpactPageSkeleton } from '@/components/skeletons/impact-skeleton'
import { AboutPageSkeleton } from '@/components/skeletons/about-skeleton'
import { ContactPageSkeleton } from '@/components/skeletons/contact-skeleton'
import { AuthPageSkeleton } from '@/components/skeletons/auth-skeleton'
import { DashboardPageSkeleton } from '@/components/skeletons/dashboard-skeleton'
import { CheckoutPageSkeleton } from '@/components/skeletons/checkout-skeleton'
import { RaffleDetailPageSkeleton } from '@/components/skeletons/raffle-detail-skeleton'

const LazyLandingPage = lazy(() => import('@/features/landing/pages/landing.page'))
const LazyImpactPage = lazy(() => import('@/features/impact/pages/impact.page'))
const LazyAboutPage = lazy(() => import('@/features/about/pages/about.page'))
const LazyContactPage = lazy(() => import('@/features/contact/pages/contact.page'))
const LazyLoginPage = lazy(() => import('@/features/auth/pages/login.page'))
const LazyRegisterPage = lazy(() => import('@/features/auth/pages/register.page'))
const LazyDashboardPage = lazy(() => import('@/features/dashboard/pages/dashboard.page'))
const LazyCheckoutPage = lazy(() => import('@/features/checkout/pages/checkout.page'))
const LazyRaffleDetailPage = lazy(() => import('@/features/dashboard/pages/raffle-detail.page'))
const LazyPaymentReturnPage = lazy(() => import('@/features/checkout/pages/payment-return.page'))
const LazyEmprendedorPage = lazy(() => import('@/features/emprendedor/pages/emprendedor.page'))
const LazyAdminDashboardPage = lazy(() => import('@/features/admin/pages/admin-dashboard.page').then(m => ({ default: m.AdminDashboardPage })))
const LazyNotFoundPage = lazy(() => import('@/features/errors/pages/not-found.page'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PageWithSuspense fallback={<LandingPageSkeleton />}>
        <LazyLandingPage />
      </PageWithSuspense>
    ),
  },
  {
    path: '/impacto',
    element: (
      <PageWithSuspense fallback={<ImpactPageSkeleton />}>
        <LazyImpactPage />
      </PageWithSuspense>
    ),
  },
  {
    path: '/nosotros',
    element: (
      <PageWithSuspense fallback={<AboutPageSkeleton />}>
        <LazyAboutPage />
      </PageWithSuspense>
    ),
  },
  {
    path: '/contacto',
    element: (
      <PageWithSuspense fallback={<ContactPageSkeleton />}>
        <LazyContactPage />
      </PageWithSuspense>
    ),
  },
  {
    path: '/login',
    element: (
      <PageWithSuspense fallback={<AuthPageSkeleton />}>
        <LazyLoginPage />
      </PageWithSuspense>
    ),
  },
  {
    path: '/registro',
    element: (
      <PageWithSuspense fallback={<AuthPageSkeleton />}>
        <LazyRegisterPage />
      </PageWithSuspense>
    ),
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
  },
  {
    path: '/emprendedor',
    element: (
      <PageWithSuspense fallback={<LandingPageSkeleton />}>
        <LazyEmprendedorPage />
      </PageWithSuspense>
    ),
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
  },
  {
    path: '/payment/return',
    element: (
      <PageWithSuspense fallback={<CheckoutPageSkeleton />}>
        <LazyPaymentReturnPage />
      </PageWithSuspense>
    ),
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
  },
  {
    path: '*',
    element: (
      <PageWithSuspense fallback={null}>
        <LazyNotFoundPage />
      </PageWithSuspense>
    ),
  },
])
