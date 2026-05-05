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
| Validación        | Zod                      | Schemas tipados para perfil, auth, forms            |
| 3D / WebGL        | React Three Fiber + Drei | Modelo interactivo MacBook, lazy loaded             |
| Gráficos KPI      | Recharts                 | Simple, suficiente para dashboard MVP               |
| HTTP Client       | Fetch API (custom)       | Cliente propio con interceptors auth + error handling |
| Iconos            | Lucide React             | Consistente con shadcn/ui                           |
| Notificaciones    | react-toastify           | Toasts con colas y persistencia                     |
| SEO               | react-helmet-async + OG Edge Function | Meta tags dinámicas + Edge Function Vercel |

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
├── api/                              # Capa API (Facade + Adapter + Decorator)
│   ├── adapters/                     # Normalización de responses
│   ├── client.ts                     # HTTP client con interceptors
│   ├── endpoints.ts                  # Centralización de rutas
│   └── *.api.ts                      # Facades por dominio
│
├── components/
│   ├── ui/                           # shadcn/ui base + custom
│   │   ├── button.tsx, card.tsx, badge.tsx, spinner.tsx
│   │   ├── dialog.tsx, scroll-area.tsx, skeleton.tsx
│   │   └── avatar.tsx, progress-bar.tsx
│   ├── shared/                       # Cross-feature components
│   │   ├── layout/                   # Header, Footer, PageLayout
│   │   ├── seo/                      # Helmet wrapper, OG meta
│   │   ├── aurora-canvas.tsx         # Background efecto aurora
│   │   ├── confetti-canvas.tsx       # Efecto celebración
│   │   ├── faq-item.tsx, step-card.tsx, metric-card.tsx
│   │   └── section-divider.tsx
│   └── skeletons/                    # Loading states por feature
│
├── features/                         # Módulos por dominio
│   ├── landing/                      # Hero 3D, pricing, countdown, FAQ, CTA
│   │   ├── components/               # HeroModelViewer, LazyHeroModelViewer
│   │   ├── sections/                 # 16 secciones (hero, pricing, steps...)
│   │   └── pages/
│   ├── auth/                         # Login, registro, verificación email
│   ├── checkout/                     # Carrito, pago Flow, confirmación
│   ├── dashboard/                    # KPIs, gráficos Recharts, admin rifas
│   ├── impact/                       # Página impacto social
│   ├── about/                        # Hero, valores, equipo
│   ├── contact/                      # Formulario, FAQ contacto, comunidad
│   ├── profile/                      # Edición perfil + cambio contraseña (Zod)
│   ├── raffles/                      # Listado, detalle, sorteos
│   ├── streaming/                    # Sorteo en vivo (WebSocket)
│   ├── pack-mom/                     # Alianza Laboratorio SYS
│   ├── legal/                        # Términos y condiciones
│   └── errors/                       # Páginas de error
│
├── hooks/                            # Hooks globales compartidos
│   ├── use-gsap-scroll.ts            # ScrollTrigger animations
│   ├── use-carousel.ts               # Carrusel draggable
│   ├── use-count-up.ts               # Contadores animados
│   ├── use-media-query.ts            # Responsive hooks
│   ├── use-async-data.ts             # Data fetching con estado
│   └── use-purchases.ts, use-raffles.ts, use-draw.ts...
│
├── lib/                              # Utilidades, config, contenido
│   ├── constants.ts                  # Feature flags, config
│   ├── content/                      # Copy estático (pricing, FAQ, steps)
│   ├── mappers/                      # Pack → PricingTier, etc.
│   ├── gsap.ts                       # Configuración GSAP + ScrollTrigger
│   ├── env.ts                        # Variables de entorno tipadas
│   ├── errors.ts                     # Clases de error custom
│   └── utils.ts                      # cn() y helpers
│
├── routes/                           # React Router v7
│   ├── router.tsx
│   └── route-guards.tsx              # Auth guards, role guards
│
├── stores/                           # Zustand — Observer Pattern
│   ├── auth.store.ts                 # Auth + user + refreshUser
│   └── ...
│
├── types/                            # TypeScript types
│   ├── domain.types.ts               # Modelos de dominio
│   ├── api.types.ts                  # Contratos API
│   └── ui.types.ts                   # Props, IconMap, etc.
│
├── App.tsx
├── main.tsx
├── index.css                         # Tailwind v4 + design tokens + keyframes
└── vercel.json                       # Routing + OG Edge Function
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

---

## Performance Optimizations

Decisiones de arquitectura para performance:

| Optimización | Implementación | Impacto |
|-------------|----------------|---------|
| **3D Model lazy loading** | `LazyHeroModelViewer` con `React.lazy()` + `IntersectionObserver` | Carga diferida del bundle Three.js (~300KB) |
| **Draco compression** | Modelo GLB comprimido (`macbook-2k-draco.glb`) | Reducción ~60% del modelo 3D |
| **HDRI eliminado** | Sin `Environment preset` de Drei | Ahorro 1.5MB (`potsdamer_platz_1k.hdr`) |
| **CSS animations hero** | `hero-fade-up` keyframe en vez de `gsap.set()`+`gsap.to()` | Elimina 1,300ms LCP element render delay |
| **GSAP fromTo** | `gsap.fromTo()` en vez de `gsap.set()` + `gsap.to()` | Evita forced reflow cycle (read→write→read) |
| **SplitText eliminado** | Headings nativos en vez de spans individuales | Reducción ~900 nodos DOM |
| **GPU-composited shimmer** | `transform: translateX()` en vez de `background-position` | Evita layout thrashing |
| **Image async decode** | `decoding="async"` en logos no críticos | Descodificación fuera del main thread |
| **fetchPriority low** | `fetchPriority="low"` en logo decorativo | No compite con LCP resources |
| **Preconnect hints** | `rel="preconnect"` para API + gstatic.com | Reduce TTFB de requests críticos |
| **Spotlight rect cache** | `rectRef` para cachear `getBoundingClientRect()` | Elimina reflow por mousemove |
| **OG Edge Function** | `/api/og` en Vercel para meta tags sociales | HTML estático para crawlers, SPA para usuarios |
