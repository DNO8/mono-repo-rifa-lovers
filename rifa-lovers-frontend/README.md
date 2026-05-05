# 🎨 Frontend — RifaLovers

SPA transaccional para compra de LuckyPass, visualización de rifas en vivo y dashboard de participantes. Optimizada para performance con lazy loading, GPU-composited animations y modelos 3D comprimidos.

---

## 🧠 Responsabilidad

- Landing page con modelo 3D interactivo (MacBook)
- Flujo de compra de packs (One, Flow, Max)
- Dashboard de usuario: perfil, historial, sorteos en vivo
- Admin: gestión de rifas, sorteos y métricas
- Integración con Flow (pagos Chile) y backend NestJS

---

## ⚙️ Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 + Vite 8 |
| Routing | React Router v7 |
| Estado servidor | Zustand + hooks custom |
| Estado global | Zustand |
| Estilos | Tailwind CSS v4 |
| Componentes UI | shadcn/ui |
| Validación | Zod |
| Animaciones | GSAP + CSS keyframes |
| 3D | React Three Fiber + Drei |
| HTTP Client | Fetch API (custom client) |
| Iconos | Lucide React |
| Notificaciones | react-toastify |
| SEO | react-helmet-async + OG Edge Function |

---

## 📁 Estructura

```
src/
├── api/                    # Capa API: adapters, client, endpoints
├── components/
│   ├── ui/                 # shadcn/ui base (Button, Card, Badge...)
│   ├── shared/             # Componentes cross-feature (layout, SEO, canvas)
│   └── skeletons/          # Loading skeletons por dominio
├── features/               # Módulos por dominio
│   ├── landing/            # Hero 3D, pricing, steps, FAQ, testimonials
│   ├── auth/               # Login, registro, verificación
│   ├── checkout/           # Carrito, pago Flow, confirmación
│   ├── dashboard/          # KPIs, gráficos, admin
│   ├── impact/             # Página de impacto social
│   ├── profile/            # Edición de perfil y contraseña
│   ├── raffles/            # Listado y detalle de rifas
│   ├── streaming/          # Sorteo en vivo (WebSocket)
│   └── ...
├── hooks/                  # Hooks globales (GSAP scroll, carousel, media query)
├── lib/                    # Utilidades, constantes, content, mappers
├── stores/                 # Zustand: auth, tickets, ui
├── types/                  # Tipos TypeScript (domain, api, component)
└── routes/                 # Router + route guards
```

---

## 🔌 Integraciones

- **API Backend** (NestJS) — REST API en Render
- **Flow** — Pasarela de pagos Chile (redirect URL)
- **React Three Fiber** — Modelo 3D MacBook con Draco compression
- **Open Graph Edge Function** — `/api/og` en Vercel para meta tags sociales

---

## 🧩 Features principales

### 1. Landing
- Hero con modelo 3D interactivo (lazy loaded)
- Selector de packs con precios dinámicos desde API
- Countdown en vivo para sorteos
- Testimonios y ganadores reales

### 2. Compra
- Selección de cantidad de tickets
- Cálculo de precio en tiempo real
- Redirección a Flow para pago
- Confirmación y asignación de LuckyPass

### 3. Dashboard
- Historial de compras
- Tickets asignados por rifa
- Perfil editable con validación Zod

### 4. Admin
- Creación y gestión de rifas
- Ejecución de sorteos con verificación
- Métricas de ventas y conversión

---

## 🚀 Performance Optimizations

- **3D Model**: GLB con Draco compression, lazy load via IntersectionObserver
- **HDRI**: Eliminado Environment preset (ahorro 1.5MB)
- **Animations**: CSS GPU-composited en lugar de GSAP para hero (LCP)
- **SplitText eliminado**: Reducción de ~900 nodos DOM
- **Images**: `decoding="async"`, `fetchPriority="low"` para no críticas
- **Preconnect**: API + gstatic.com (Draco WASM)
- **Forced reflow**: `gsap.fromTo()` en vez de `gsap.set()` + `gsap.to()`

---

## 🔄 Flujo de Compra

1. Usuario selecciona pack en landing
2. Front llama API `/purchases` con packId
3. Backend genera orden Flow
4. Redirección a Flow para pago
5. Retorno a frontend con confirmación
6. Asignación automática de LuckyPass

---

## 🛠 Scripts

```bash
pnpm dev          # Vite dev server
pnpm build        # TypeScript + Vite build
pnpm build:analyze  # Build con bundle analyzer
pnpm lint         # ESLint
pnpm preview      # Preview producción local
```
