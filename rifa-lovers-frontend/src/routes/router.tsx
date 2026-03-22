/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import { PageWithSuspense } from './route-wrappers'
import { ProtectedRoute } from './protected-route'

const LazyLandingPage = lazy(() => import('@/features/landing/pages/landing.page'))
const LazyImpactPage = lazy(() => import('@/features/impact/pages/impact.page'))
const LazyAboutPage = lazy(() => import('@/features/about/pages/about.page'))
const LazyContactPage = lazy(() => import('@/features/contact/pages/contact.page'))
const LazyLoginPage = lazy(() => import('@/features/auth/pages/login.page'))
const LazyRegisterPage = lazy(() => import('@/features/auth/pages/register.page'))
const LazyDashboardPage = lazy(() => import('@/features/dashboard/pages/dashboard.page'))
const LazyCheckoutPage = lazy(() => import('@/features/checkout/pages/checkout.page'))
const LazyRaffleDetailPage = lazy(() => import('@/features/dashboard/pages/raffle-detail.page'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PageWithSuspense>
        <LazyLandingPage />
      </PageWithSuspense>
    ),
  },
  {
    path: '/impacto',
    element: (
      <PageWithSuspense>
        <LazyImpactPage />
      </PageWithSuspense>
    ),
  },
  {
    path: '/nosotros',
    element: (
      <PageWithSuspense>
        <LazyAboutPage />
      </PageWithSuspense>
    ),
  },
  {
    path: '/contacto',
    element: (
      <PageWithSuspense>
        <LazyContactPage />
      </PageWithSuspense>
    ),
  },
  {
    path: '/login',
    element: (
      <PageWithSuspense>
        <LazyLoginPage />
      </PageWithSuspense>
    ),
  },
  {
    path: '/registro',
    element: (
      <PageWithSuspense>
        <LazyRegisterPage />
      </PageWithSuspense>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <PageWithSuspense>
        <ProtectedRoute>
          <LazyDashboardPage />
        </ProtectedRoute>
      </PageWithSuspense>
    ),
  },
  {
    path: '/checkout',
    element: (
      <PageWithSuspense>
        <ProtectedRoute>
          <LazyCheckoutPage />
        </ProtectedRoute>
      </PageWithSuspense>
    ),
  },
  {
    path: '/raffle/:id',
    element: (
      <PageWithSuspense>
        <ProtectedRoute>
          <LazyRaffleDetailPage />
        </ProtectedRoute>
      </PageWithSuspense>
    ),
  },
])
