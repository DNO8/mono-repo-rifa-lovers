# 🏗️ RifaLovers — Arquitectura de Software (Frontend)

## Índice

1. [Decisión de Stack](#decisión-de-stack)
2. [Principio de Liskov (LSP)](#principio-de-sustitución-de-liskov)
3. [Patrones GoF Aplicados](#patrones-gof-aplicados)
4. [Diagrama de Capas](#diagrama-de-capas)
5. [Estructura de Carpetas](#estructura-de-carpetas)
6. [Reglas de Dependencia](#reglas-de-dependencia)

---

## Decisión de Stack

### ¿Por qué React + Vite y no Next.js ni Astro?

RifaLovers es una **SPA transaccional** con interactividad pesada (grilla de tickets, flujo de pago, dashboards, paneles admin). El backend NestJS maneja toda la lógica de servidor, por lo que no se necesita SSR ni server actions.

| Criterio               | React + Vite (SPA) | Next.js           | Astro             |
|------------------------|---------------------|--------------------|--------------------|
| Interactividad pesada  | ✅ Nativo           | ✅ Pero con overhead | ⚠️ Islands de React |
| SEO                    | ⚠️ No crítico (app autenticada) | ✅ SSR nativo | ✅ Content-heavy    |
| Complejidad de estado  | ✅ Natural           | ✅ Pero dual (server/client) | ⚠️ Fragmentado     |
| SPA routing            | ✅ Fluido            | ✅ Con App Router   | ⚠️ MPA por defecto  |
| Simplicidad            | ✅ Un solo modelo mental | ⚠️ Server + Client components | ⚠️ Necesita React islands |
| Backend dedicado       | ✅ Complementa NestJS | ⚠️ Duplica capa servidor | ✅ Agnóstico        |

### Stack seleccionado

| Capa              | Tecnología              | Razón                                              |
|-------------------|-------------------------|-----------------------------------------------------|
| Framework         | React 19 + Vite 8       | Performance, React Compiler, DX rápida              |
| Routing           | React Router v7          | Estándar, lazy loading nativo                       |
| Estado servidor   | TanStack Query           | Cache, refetch, optimistic updates                  |
| Estado global     | Zustand                  | Ligero, patrón Observer nativo                      |
| Estilos           | Tailwind CSS v4          | Utility-first, rápido para prototipar               |
| Componentes UI    | shadcn/ui                | Accesibles, customizables, sin vendor lock-in       |
| Formularios       | React Hook Form + Zod    | Validación tipada para registro/compra              |
| Gráficos KPI      | Recharts                 | Simple, suficiente para dashboard MVP               |
| HTTP Client       | Axios                    | Interceptors para auth tokens                       |
| Iconos            | Lucide React             | Consistente con shadcn/ui                           |
| Notificaciones    | Sonner                   | Toasts modernos, ligero                             |

---

## Principio de Sustitución de Liskov

En React/TypeScript, el LSP se aplica a dos niveles:

### 1. Componentes UI sustituibles

Cada componente respeta el contrato de props de su abstracción. Un subtipo puede usarse donde se espera el tipo base sin romper el comportamiento.

```tsx
// Contrato base
interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

// ✅ Cumple LSP: intercambiable donde se espere ActionButtonProps
function PurchaseButton(props: ActionButtonProps) { ... }
function AdminActionButton(props: ActionButtonProps) { ... }
```

**Violación típica:** un componente hijo que ignora `disabled` o altera el comportamiento de `onClick` sin documentarlo. Si el contrato dice "onClick se ejecuta al hacer click cuando disabled no es true", todos los subtipos deben respetar eso.

### 2. Servicios con interfaz común

```ts
interface PaymentGateway {
  createPayment(amount: number, metadata: PaymentMeta): Promise<PaymentIntent>;
  verifyPayment(transactionId: string): Promise<PaymentStatus>;
}

// ✅ LSP: ambas implementaciones son intercambiables
class FlowPaymentGateway implements PaymentGateway { ... }
class MockPaymentGateway implements PaymentGateway { ... }
```

Si mañana se cambia Flow por otro proveedor, el frontend no se rompe. El consumidor depende de la abstracción, no de la implementación.

---

## Patrones GoF Aplicados

### Strategy — Lógica de precios y descuentos

Permite intercambiar algoritmos de pricing sin modificar el consumidor. Preparado para referidos y descuentos futuros.

```ts
interface PricingStrategy {
  calculate(basePrice: number, quantity: number, context: PurchaseContext): number;
}

class StandardPricing implements PricingStrategy {
  calculate(basePrice: number, quantity: number): number {
    return basePrice * quantity;
  }
}

class BulkDiscountPricing implements PricingStrategy {
  calculate(basePrice: number, quantity: number): number {
    const discount = quantity >= 10 ? 0.9 : 1;
    return basePrice * quantity * discount;
  }
}

class ReferralPricing implements PricingStrategy {
  constructor(private referralDiscount: number) {}
  calculate(basePrice: number, quantity: number): number {
    return basePrice * quantity * (1 - this.referralDiscount);
  }
}
```

**Ubicación:** `features/checkout/strategies/`

### Observer — Estado reactivo (Zustand)

React implementa Observer nativamente. Zustand lo formaliza como store observable al que los componentes se suscriben:

```ts
interface TicketStore {
  selected: Set<number>;
  addTicket: (n: number) => void;
  removeTicket: (n: number) => void;
  clearSelection: () => void;
}

const useTicketStore = create<TicketStore>((set) => ({
  selected: new Set(),
  addTicket: (n) => set((s) => ({ selected: new Set(s.selected).add(n) })),
  removeTicket: (n) => set((s) => {
    const next = new Set(s.selected);
    next.delete(n);
    return { selected: next };
  }),
  clearSelection: () => set({ selected: new Set() }),
}));
```

**Ubicación:** `stores/`

### Adapter — Normalización de API responses

Aísla al frontend del formato del backend. Si el backend cambia su esquema, solo se modifica el adapter.

```ts
// Response crudo del backend
interface RaffleApiResponse {
  id: string;
  ticket_price_cents: number;
  total_tickets: number;
  sold_count: number;
  created_at: string;
}

// Modelo de dominio del frontend
interface Raffle {
  id: string;
  ticketPrice: number;
  totalTickets: number;
  soldCount: number;
  progress: number;
  createdAt: Date;
}

// Adapter
function toRaffle(raw: RaffleApiResponse): Raffle {
  return {
    id: raw.id,
    ticketPrice: raw.ticket_price_cents / 100,
    totalTickets: raw.total_tickets,
    soldCount: raw.sold_count,
    progress: (raw.sold_count / raw.total_tickets) * 100,
    createdAt: new Date(raw.created_at),
  };
}
```

**Ubicación:** `api/adapters/`

### Facade — Capa API simplificada

Un solo punto de entrada por feature que oculta la complejidad HTTP:

```ts
class RaffleApi {
  private http: HttpClient;

  async getActive(): Promise<Raffle> {
    const raw = await this.http.get<RaffleApiResponse>('/raffles/active');
    return toRaffle(raw);
  }

  async getAvailableTickets(raffleId: string): Promise<number[]> {
    return this.http.get(`/raffles/${raffleId}/tickets/available`);
  }

  async purchaseTickets(req: PurchaseRequest): Promise<PaymentIntent> {
    return this.http.post('/purchases', req);
  }
}
```

Los componentes nunca tocan `fetch` ni `axios` directamente.

**Ubicación:** `api/*.api.ts` y `features/*/hooks/`

### Factory — Creación de ViewModels

Para los diferentes estados de un ticket en la grilla:

```ts
type TicketStatus = 'available' | 'selected' | 'sold' | 'reserved';

interface TicketViewModel {
  number: number;
  status: TicketStatus;
  className: string;
  isSelectable: boolean;
}

function createTicketViewModel(
  number: number,
  soldTickets: Set<number>,
  selectedTickets: Set<number>,
  reservedTickets: Set<number>,
): TicketViewModel {
  if (soldTickets.has(number))
    return { number, status: 'sold', className: 'ticket--sold', isSelectable: false };
  if (reservedTickets.has(number))
    return { number, status: 'reserved', className: 'ticket--reserved', isSelectable: false };
  if (selectedTickets.has(number))
    return { number, status: 'selected', className: 'ticket--selected', isSelectable: true };
  return { number, status: 'available', className: 'ticket--available', isSelectable: true };
}
```

**Ubicación:** `features/tickets/factories/`

### Decorator — HTTP interceptors

Envuelve el cliente HTTP con capas de funcionalidad composables:

```ts
interface HttpClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, body: unknown): Promise<T>;
}

class AuthHttpClient implements HttpClient {
  constructor(private inner: HttpClient, private getToken: () => string | null) {}
  async get<T>(url: string): Promise<T> { /* inyecta token, delega a inner */ }
  async post<T>(url: string, body: unknown): Promise<T> { /* inyecta token, delega a inner */ }
}

class LoggingHttpClient implements HttpClient {
  constructor(private inner: HttpClient) {}
  async get<T>(url: string): Promise<T> {
    console.log(`[GET] ${url}`);
    return this.inner.get(url);
  }
  async post<T>(url: string, body: unknown): Promise<T> {
    console.log(`[POST] ${url}`);
    return this.inner.post(url, body);
  }
}

// Composición
const client = new LoggingHttpClient(
  new AuthHttpClient(new BaseHttpClient(), () => authStore.getState().token)
);
```

**Ubicación:** `api/clients/`

---

## Diagrama de Capas

```
┌─────────────────────────────────────────────────┐
│                UI Components                     │  React components (pages, shared, ui)
│   Liskov: sustituibles por contrato de props     │
├─────────────────────────────────────────────────┤
│            Custom Hooks (features)               │  useRaffle, useCheckout, useAuth
│   Facade: simplifican lógica compleja            │
├─────────────────────────────────────────────────┤
│          State Management (Zustand)              │  Observer pattern
│   ticketStore, authStore, uiStore                │
├─────────────────────────────────────────────────┤
│           Services / Domain Logic                │  Strategy, Factory
│   PricingStrategy, TicketViewModelFactory        │
├─────────────────────────────────────────────────┤
│             API Layer (Facade)                   │  Facade + Adapter
│   raffleApi, authApi, paymentApi                 │
├─────────────────────────────────────────────────┤
│           HTTP Client (Decorator)                │  Decorator pattern
│   Auth → Logging → ErrorHandling → Base          │
├─────────────────────────────────────────────────┤
│               NestJS Backend                     │
└─────────────────────────────────────────────────┘
```

### Resumen de patrones por capa

| Patrón          | Ubicación                         | Propósito                                              |
|-----------------|-----------------------------------|--------------------------------------------------------|
| **Liskov (LSP)**| Componentes UI + Servicios        | Contratos de props e interfaces respetados por subtipos |
| **Strategy**    | `features/checkout/strategies/`   | Intercambiar algoritmos de pricing sin tocar consumidores |
| **Observer**    | `stores/`                         | Reactividad de estado entre componentes                 |
| **Adapter**     | `api/adapters/`                   | Desacoplar del formato del backend                      |
| **Facade**      | `api/*.api.ts` + hooks            | Simplificar interfaces complejas                        |
| **Factory**     | `features/tickets/factories/`     | Crear ViewModels con lógica condicional                 |
| **Decorator**   | `api/clients/`                    | Componer capas HTTP (auth, logging, retry)              |

---

## Estructura de Carpetas

```
src/
│
├── api/                              # Capa API (Facade + Adapter)
│   ├── adapters/                     # Adapter Pattern
│   │   ├── raffle.adapter.ts
│   │   ├── ticket.adapter.ts
│   │   ├── user.adapter.ts
│   │   └── payment.adapter.ts
│   ├── clients/                      # Decorator Pattern
│   │   ├── http-client.ts            # Interface base + implementación
│   │   ├── auth.decorator.ts         # Decorator: inyecta token
│   │   └── logging.decorator.ts      # Decorator: logging de requests
│   ├── raffle.api.ts                 # Facade: endpoints de rifas
│   ├── auth.api.ts                   # Facade: endpoints de auth
│   ├── ticket.api.ts                 # Facade: endpoints de tickets
│   ├── payment.api.ts                # Facade: endpoints de pagos
│   └── index.ts                      # Re-exports
│
├── components/                       # UI Components (contratos Liskov)
│   ├── ui/                           # Componentes base (shadcn/ui + custom)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── modal.tsx
│   │   ├── badge.tsx
│   │   ├── progress-bar.tsx
│   │   └── spinner.tsx
│   └── shared/                       # Componentes compartidos entre features
│       ├── layout/
│       │   ├── header.tsx
│       │   ├── footer.tsx
│       │   ├── sidebar.tsx
│       │   └── page-layout.tsx
│       ├── error-boundary.tsx
│       └── protected-route.tsx
│
├── features/                         # Módulos por dominio de negocio
│   ├── landing/
│   │   ├── components/
│   │   │   ├── hero-model-viewer.tsx
│   │   │   ├── model-annotations.tsx
│   │   │   └── ticket-selector.tsx
│   │   ├── sections/
│   │   │   ├── hero-section.tsx
│   │   │   ├── live-ticker-section.tsx
│   │   │   ├── steps-section.tsx
│   │   │   ├── winners-section.tsx
│   │   │   ├── impact-section.tsx
│   │   │   ├── testimonials-section.tsx
│   │   │   ├── pricing-section.tsx
│   │   │   ├── faq-section.tsx
│   │   │   └── cta-section.tsx
│   │   └── pages/
│   │       └── landing.page.tsx
│   │
│   ├── impact/
│   │   ├── sections/
│   │   │   ├── impact-hero-section.tsx
│   │   │   ├── impact-steps-section.tsx
│   │   │   ├── impact-stats-section.tsx
│   │   │   └── impact-milestones-section.tsx
│   │   └── pages/
│   │       └── impact.page.tsx
│   │
│   ├── about/
│   │   ├── sections/
│   │   │   ├── about-hero-section.tsx
│   │   │   ├── about-values-section.tsx
│   │   │   └── about-team-section.tsx
│   │   └── pages/
│   │       └── about.page.tsx
│   │
│   ├── contact/
│   │   ├── components/
│   │   │   └── contact-form.tsx
│   │   ├── sections/
│   │   │   ├── contact-hero-section.tsx
│   │   │   ├── contact-faq-section.tsx
│   │   │   └── contact-community-section.tsx
│   │   └── pages/
│   │       └── contact.page.tsx
│   │
│   ├── auth/
│   │   ├── components/
│   │   │   ├── login-form.tsx
│   │   │   └── register-form.tsx
│   │   ├── hooks/
│   │   │   └── use-auth.ts
│   │   └── pages/
│   │       ├── login.page.tsx
│   │       └── register.page.tsx
│   │
│   ├── raffle/
│   │   ├── components/
│   │   │   ├── raffle-card.tsx
│   │   │   ├── raffle-progress.tsx
│   │   │   └── raffle-details.tsx
│   │   ├── hooks/
│   │   │   └── use-raffle.ts
│   │   └── pages/
│   │       └── raffle.page.tsx
│   │
│   ├── tickets/
│   │   ├── components/
│   │   │   ├── ticket-grid.tsx
│   │   │   ├── ticket-cell.tsx
│   │   │   └── ticket-selector.tsx
│   │   ├── factories/               # Factory Pattern
│   │   │   └── ticket-viewmodel.factory.ts
│   │   ├── hooks/
│   │   │   └── use-tickets.ts
│   │   └── pages/
│   │       └── tickets.page.tsx
│   │
│   ├── checkout/
│   │   ├── components/
│   │   │   ├── checkout-summary.tsx
│   │   │   ├── payment-form.tsx
│   │   │   └── purchase-confirmation.tsx
│   │   ├── strategies/              # Strategy Pattern
│   │   │   ├── pricing.strategy.ts
│   │   │   ├── standard.pricing.ts
│   │   │   ├── bulk-discount.pricing.ts
│   │   │   └── referral.pricing.ts
│   │   ├── hooks/
│   │   │   └── use-checkout.ts
│   │   └── pages/
│   │       └── checkout.page.tsx
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── kpi-card.tsx
│   │   │   ├── sales-chart.tsx
│   │   │   ├── conversion-chart.tsx
│   │   │   └── progress-overview.tsx
│   │   ├── hooks/
│   │   │   └── use-dashboard.ts
│   │   └── pages/
│   │       └── dashboard.page.tsx
│   │
│   └── admin/
│       ├── components/
│       │   ├── raffle-manager.tsx
│       │   ├── user-table.tsx
│       │   └── draw-executor.tsx
│       ├── hooks/
│       │   └── use-admin.ts
│       └── pages/
│           └── admin.page.tsx
│
├── hooks/                            # Hooks globales compartidos
│   ├── use-media-query.ts
│   └── use-debounce.ts
│
├── lib/                              # Utilidades y configuración
│   ├── constants.ts
│   ├── config.ts
│   └── utils.ts
│
├── routes/                           # Definición de rutas
│   ├── router.tsx
│   ├── routes.ts
│   └── guards.ts
│
├── stores/                           # State Management — Observer Pattern
│   ├── auth.store.ts
│   ├── ticket.store.ts
│   └── ui.store.ts
│
├── types/                            # TypeScript types/interfaces
│   ├── api.types.ts                  # Tipos raw del backend
│   ├── domain.types.ts               # Modelos de dominio transformados
│   ├── store.types.ts                # Interfaces de stores
│   └── component.types.ts            # Contratos de props (Liskov)
│
├── App.tsx
├── main.tsx
└── index.css
```

---

## Reglas de Dependencia

El flujo de dependencias es **unidireccional** (de arriba hacia abajo):

```
pages → hooks → stores + api
              → factories / strategies
api   → adapters → types
components/ui → types (solo props)
```

### Prohibiciones

- Un componente `ui/` **nunca** importa de `features/`
- `api/` **nunca** importa de `stores/`
- `features/X` **nunca** importa de `features/Y` (comunicación solo vía stores)
- `types/` **nunca** importa de ninguna otra capa (es la base)
