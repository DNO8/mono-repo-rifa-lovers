# 🚀 Backend Implementation Roadmap

Este documento define el **orden de implementación del backend de RifaLovers** y el **estado actual de cada fase**.

Stack definitivo:

- NestJS
- PostgreSQL (Supabase)
- Prisma ORM
- Pasarela de pagos (Flow u otra)
- JWT Auth (Supabase Auth)

---

# 📊 Estado General

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Infraestructura Base | ✅ Completo |
| 2 | Modelo de Datos (Prisma Schema) | ✅ Completo |
| 3 | Auth + Users | ✅ Completo |
| 4 | Raffles + Milestones + Prizes | ✅ Completo (lectura) |
| 5 | LuckyPass — lectura | ✅ Completo |
| 6 | Purchases — CRUD + transacciones | ✅ Completo |
| 7 | Packs — lectura | ✅ Completo |
| 8 | Payments — Flow.cl + webhook + LuckyPasses | ✅ Completo |
| 9 | Frontend ↔ Backend integrado | ✅ Completo |
| 10 | Draw (Sorteo) | ✅ Completo (backend) |
| 11 | Admin | ✅ Completo (backend) |
| 12 | Jobs Automáticos | ✅ Completo |
| 13 | Hardening | 🟡 Parcial |

---

# Fase 1 — Infraestructura Base

**Estado: Completo**

Proyecto NestJS configurado con:

- `src/config/` — variables de entorno, Supabase config
- `src/database/` — PrismaService
- `src/common/` — guards, decoradores, interceptores
- Prisma conectado a Supabase PostgreSQL

---

# Fase 2 — Modelo de Datos

**Estado: Completo**

Schema Prisma con todos los modelos del dominio:

```
Organization
User
Raffle
Pack
Purchase
UserPack
LuckyPass
Milestone
Prize
PrizeWinner
RaffleProgress
PaymentTransaction
```

Enums definidos:

```
UserRole         (admin, operator, customer)
UserStatus       (active, blocked)
RaffleStatus     (draft, active, sold_out, closed, drawn)
PurchaseStatus   (pending, paid, failed, refunded)
PaymentStatus    (created, pending, approved, rejected)
PrizeType        (milestone, flash)
LuckyPassStatus  (active, used, winner, cancelled)
```

Índices creados:

```
idx_lucky_raffle  — lucky_passes(raffle_id)
idx_lucky_user    — lucky_passes(user_id)
```

---

# Fase 3 — Módulo Auth + Users

**Estado: Completo**

Módulo: `/modules/users/`

Contiene dos controllers en el mismo módulo:

- `auth.controller.ts` → rutas `/auth`
- `users.controller.ts` → rutas `/users`

### Endpoints implementados

```
POST /auth/register    → Crea usuario en Supabase Auth + tabla users
POST /auth/login       → Login, retorna accessToken + refreshToken
POST /auth/refresh     → Renueva accessToken
GET  /users/me         → Perfil del usuario autenticado
PATCH /users/me        → Actualizar perfil
GET  /users            → Listar usuarios (Admin/Operator)
GET  /users/:id        → Obtener usuario por id (Admin/Operator)
```

### Request/Response de referencia

`POST /auth/register`:
```json
{
  "email": "user@email.com",
  "password": "12345678",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "56912345678"
}
```

Response (register y login):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@email.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "phone": 56912345678,
    "role": "customer",
    "status": "active",
    "createdAt": "timestamp"
  },
  "accessToken": "jwt",
  "refreshToken": "jwt"
}
```

### Notas

- El `id` del usuario viene de Supabase Auth (no se autogenera en Prisma)
- Roles: `admin`, `operator`, `customer`
- Guard `RolesGuard` protege endpoints de administración

---

# Fase 4 — Módulo Raffles + Milestones + Prizes (lectura)

**Estado: Completo (lectura)**

Módulo: `/modules/raffles/`

### Endpoints implementados

```
GET /raffles/active           → Retorna la rifa activa con milestones y prizes incluidos
GET /raffles/active/progress  → Retorna progreso de la rifa activa (packsSold, revenue, %)
GET /raffles/:id              → Detalle de una rifa por ID
```

### Responses

`GET /raffles/active`:
```json
{
  "id": "uuid",
  "title": "Rifa Macbook",
  "description": "...",
  "goalPacks": 5000,
  "status": "active",
  "createdAt": "timestamp",
  "milestones": [
    {
      "id": "uuid",
      "name": "Meta 50%",
      "requiredPacks": 2500,
      "sortOrder": 1,
      "isUnlocked": true,
      "prizes": [
        {
          "id": "uuid",
          "name": "AirPods Pro",
          "description": "...",
          "type": "milestone"
        }
      ]
    }
  ]
}
```

`GET /raffles/active/progress`:
```json
{
  "raffleId": "uuid",
  "packsSold": 1250,
  "revenueTotal": 6250000,
  "percentageToGoal": 25.0
}
```

### Notas

- **Milestones y prizes se incluyen directamente** en la respuesta de `/raffles/active` — no se necesitan endpoints separados
- El `repository.findActiveWithProgress()` hace `include: { progress: true, milestones: { include: { prizes: true } } }`
- `percentageToGoal` de la BD **no se usa en el frontend** — el progreso se calcula dinámicamente: `(packsSold / goalPacks) × 100`

---

# Fase 5 — Módulo LuckyPass (lectura)

**Estado: Completo (lectura)**

Módulo: `/modules/lucky-pass/`

### Endpoints implementados

```
GET /lucky-passes/my         → Lista de LuckyPasses del usuario autenticado
GET /lucky-passes/my/summary → Resumen de passes (total, activos, usados, ganadores)
```

### Responses

`GET /lucky-passes/my`:
```json
[
  {
    "id": "uuid",
    "ticketNumber": 4521,
    "status": "active",
    "isWinner": false,
    "raffleId": "uuid",
    "raffleName": "Rifa Macbook",
    "createdAt": "timestamp"
  }
]
```

`GET /lucky-passes/my/summary`:
```json
{
  "total": 10,
  "active": 8,
  "used": 1,
  "winners": 1
}
```

### Estados de LuckyPass

```
active    → participando en la rifa
used      → rifa terminada, no ganador
winner    → ganó un premio
cancelled → compra cancelada o fallida
```

---

# Fase 6 — Purchases

**Estado: Completo**

Módulo: `/modules/purchases/`

### Endpoints implementados

```
GET  /purchases/my       → Historial de compras del usuario (auth requerido)
POST /purchases          → Crear compra (valida rifa activa + pack + crea UserPack + PaymentTransaction en transacción)
```

### POST /purchases — Request

```json
{
  "raffleId": "uuid",
  "packId": "uuid",
  "quantity": 1
}
```

### Flujo de creación (transacción)

```
1. Validar raffle.status = 'active'
2. Validar pack existe y tiene precio
3. Crear Purchase (status: 'pending')
4. Crear UserPack (userId + raffleId + packId + quantity)
5. Crear PaymentTransaction (status: 'created', provider: 'flow')
6. Retornar purchase con datos para iniciar pago
```

La generación de LuckyPasses ocurre **después de confirmar el pago** (Fase 8).

---

# Fase 7 — Módulo Packs

**Estado: Completo**

Módulo: `/modules/packs/`

### Endpoints implementados

```
GET /packs          → Lista todos los packs activos
GET /packs/:id      → Detalle de un pack
```

### Response

```json
[
  {
    "id": "uuid",
    "name": "Pack Básico",
    "price": 2990,
    "luckyPassQuantity": 1,
    "isFeatured": false,
    "isPreSale": false,
    "createdAt": "timestamp"
  }
]
```

---

# Fase 8 — Módulo Payments (Flow.cl)

**Estado: Completo**

Módulo: `/modules/payments/`

### Endpoints implementados

```
POST /payments/initiate   → Crear orden de pago en Flow y retornar paymentUrl
POST /webhooks/flow       → Recibir webhook de Flow, confirmar pago, generar LuckyPasses
```

### Integración Flow.cl

- **Firma HMAC-SHA256**: parámetros ordenados alfabéticamente, concatenados como `key1value1key2value2...`, firmados con `secretKey` como clave HMAC
- **apiKey** incluido en los parámetros antes de firmar
- **Webhook**: Flow envía solo un `token` vía POST. El backend llama `GET /payment/getStatus` con ese token para obtener el estado real
- **Redirect**: El usuario es redirigido a `${flowOrder.url}?token=${flowOrder.token}`
- **Return URL**: `${FRONTEND_URL}/payment/return`
- **Confirmation URL**: `${BACKEND_URL}/webhooks/flow`

### Flujo post-confirmación de pago (en transacción)

```
1. Idempotencia: si purchase.status == 'paid' → ignorar
2. Purchase.status → 'paid', paidAt = NOW()
3. PaymentTransaction.status → 'approved'
4. Generar LuckyPasses:
   - N = userPack.quantity × pack.luckyPassQuantity
   - ticket_number secuencial con SELECT MAX(ticket_number) FOR UPDATE (lock)
   - status = 'active', isWinner = false
5. Actualizar raffle_progress:
   - packs_sold += quantity
   - revenue_total += totalAmount
   - percentage_to_goal recalculado
```

### Variables de entorno requeridas

```
FLOW_API_KEY=...
FLOW_SECRET_KEY=...
FLOW_BASE_URL=https://sandbox.flow.cl/api  (o https://www.flow.cl/api en producción)
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

---

# Fase 9 — Frontend ↔ Backend Integración

**Estado: Completo**

Todo el frontend consume datos reales del backend. No quedan mocks de dominio.

### Integración completada

| Página/Sección | Hook | Endpoint(s) |
|----------------|------|-------------|
| Landing — pricing | `useActiveRaffle()` | `GET /raffles/active` |
| Landing — countdown | `useActiveRaffle()` | `GET /raffles/active` |
| Landing — impact | `useActiveRaffle()` | `GET /raffles/active` + `/progress` |
| Landing — milestones | `useActiveRaffle()` | `GET /raffles/active` |
| Header — smile count | `useActiveRaffle()` | `GET /raffles/active/progress` |
| Dashboard — greeting | `useLuckyPasses()` | `GET /lucky-passes/my/summary` |
| Dashboard — impact | `useActiveRaffle()` | `GET /raffles/active` + `/progress` |
| Dashboard — history | `usePurchases()` | `GET /purchases/my` |
| Dashboard — raffle card | `useActiveRaffle()` | `GET /raffles/active` + `/progress` |
| Impact — milestones | `useActiveRaffle()` | `GET /raffles/active` |
| Impact — stats | `useActiveRaffle()` | `GET /raffles/active` + `/progress` |

### Lógica de progreso (frontend)

El porcentaje de progreso se calcula **dinámicamente en el frontend**:

```typescript
const pct = Math.min((packsSold / goalPacks) * 100, 100)
```

- `packsSold` → de `GET /raffles/active/progress`
- `goalPacks` → de `GET /raffles/active`
- No se usa `percentageToGoal` de la BD (valor estático sin actualización automática)

### Lógica de milestones (frontend)

- Se ordenan por `sortOrder`
- Estado se lee directo de `isUnlocked` del backend
- El primer milestone con `isUnlocked = false` se marca como `active`
- Prizes se listan desde los milestones incluidos en la respuesta

### Auth — Token refresh

El frontend implementa auto-refresh de JWT:

```
Request → 401 → POST /auth/refresh con refreshToken → Retry con nuevo accessToken
```

Decorator chain: `FetchHttpClient → AuthDecorator → RefreshDecorator → LoggingDecorator`

Hooks protegidos (`useLuckyPasses`, `usePurchases`) solo disparan fetch si `isAuthenticated = true`.

### Premios — módulo independiente

Los premios y milestones **ya se sirven embebidos** en `GET /raffles/active` (via `include` en Prisma).

Si se necesita un módulo `/prizes/` independiente, sería para:

- Admin CRUD de premios
- Endpoint público `GET /raffles/active/prizes` separado
- Lógica de desbloqueo automático de milestones

### Tipos de premio (`PrizeType`)

```
milestone → asociado a un milestone (se desbloquea por progreso)
flash     → premio especial no asociado a milestone
```

---

# Fase 10 — Draw (Sorteo)

**Estado: ✅ Completo (backend) — Sin UI frontend**

Módulo: `/modules/draw/`

### Endpoints implementados

```
POST /admin/raffles/:id/draw       → Ejecutar sorteo (Admin only)
GET  /admin/raffles/:id/draw/check → Verificar si el sorteo puede ejecutarse
GET  /raffles/:id/winners          → Ganadores públicos de una rifa
GET  /raffles/:id/draw/results     → Resultados completos del sorteo
```

### Implementación

- Requiere `raffle.status = 'closed'` para ejecutar
- Selección de ganadores con algoritmo Fisher-Yates shuffle entre LuckyPasses activos
- Solo participan premios de milestones desbloqueados
- Idempotencia: no permite re-sortear una rifa ya sorteada
- Post-sorteo: `raffle.status → 'drawn'`
- `UNIQUE(lucky_pass_id)` en `prize_winners` — un LP no puede ganar dos premios

### Pendiente

- UI frontend para mostrar resultados del sorteo al público

---

# Fase 11 — Admin

**Estado: ✅ Completo (backend) — Sin UI frontend**

Módulo: `/modules/admin/`

### Endpoints implementados

```
POST  /admin/raffles             → Crear rifa
GET   /admin/raffles             → Listar todas las rifas con stats (solo packs de compras pagadas)
PATCH /admin/raffles/:id         → Actualizar rifa
PATCH /admin/raffles/:id/status  → Cambiar estado (DRAFT→ACTIVE, ACTIVE→CLOSED, etc.)
GET   /admin/kpis                → Métricas globales
GET   /admin/users               → Listar usuarios
PATCH /admin/users/:id/role      → Cambiar rol de usuario
PATCH /admin/users/:id/block     → Bloquear/desbloquear usuario
GET   /admin/jobs/status         → Estado de los jobs automáticos
POST  /admin/jobs/run/:jobName   → Ejecutar job manualmente
```

### KPIs implementados

```json
{
  "totalSales": 15000000,
  "packsSold": 4500,
  "activeUsers": 230,
  "activeRaffles": 1
}
```

### Notas

- `packsSold` en KPIs y listado de rifas filtra solo compras con `status = 'paid'`
- Gestión de jobs expuesta vía endpoints admin

### Pendiente

- UI frontend para panel de administración

---

# Fase 12 — Jobs Automáticos

**Estado: ✅ Completo**

Módulo: `/modules/jobs/` — implementado con `node-cron`.

### Jobs activos

**Auto SOLD_OUT** — cada 5 minutos:
- Marca rifas como `sold_out` cuando `packs_sold >= goal_packs`

**Auto CLOSED** — cada 5 minutos:
- Cierra rifas cuyo `end_date <= NOW()` y status es `active` o `sold_out`
- ⚠️ Mantener `end_date` actualizado en Supabase para evitar cierres prematuros en desarrollo

**Expirar purchases pendientes** — cada 15 minutos:
- Marca como `failed` compras `pending` con más de 30 minutos sin pagar

### Notas

- Jobs exponibles y ejecutables manualmente vía `POST /admin/jobs/run/:jobName`
- Estado visible en `GET /admin/jobs/status`

---

# Fase 13 — Hardening

**Estado: 🟡 Parcial**

| Mejora | Estado |
|--------|--------|
| Rate limiting (`@nestjs/throttler`) | ✅ Instalado y configurado |
| Logging estructurado (`nestjs-pino`) | ✅ Instalado y activo |
| Validación DTO (`class-validator`) | ✅ Implementado |
| Manejo de errores global | ✅ `AllExceptionsFilter` activo |
| Validación de entorno (`zod`) | ✅ Instalado, configurado en `env.validation.ts` |
| SSL en conexión a Supabase | ✅ Configurado en `PrismaService` (`rejectUnauthorized: false`) |
| Producción (Flow real, HTTPS, secrets) | ❌ Pendiente |

---

# Estrategia de Testing

Flujo completo a probar antes de producción:

```
register → login → get raffle active → get packs
→ create purchase → create payment → simulate webhook
→ verify lucky-passes generated → run draw → verify winners
```

---

# Próximos pasos inmediatos

En orden de prioridad para completar el MVP:

1. **Milestone unlock automático**: actualizar `is_unlocked` cuando `packs_sold >= required_packs`
2. **UI frontend Admin**: panel de administración (rifas, KPIs, usuarios)
3. **UI frontend Draw**: página de resultados del sorteo
4. **Configuración producción**: Flow real, dominio, HTTPS, secrets seguros
5. **Email service**: configurar SMTP para notificaciones

### Resumen de lo completado

```
✅ Infraestructura (NestJS + Prisma + Supabase + SSL)
✅ Modelo de datos completo
✅ Auth (register, login, refresh, JWT guard)
✅ Raffles con milestones y prizes (lectura)
✅ LuckyPass (lectura por usuario, resumen correcto)
✅ Purchases (CRUD completo con transacciones, luckyPassCount en response)
✅ Packs (lectura)
✅ Payments (Flow.cl integrado + webhook + LuckyPass generation)
✅ Frontend integrado — 0 mocks de dominio
✅ Token refresh automático
✅ Progreso dinámico (packsSold / goalPacks)
✅ Página Emprendedor Legend
✅ Payment return page
✅ Draw (sorteo backend — Fisher-Yates, idempotente)
✅ Admin backend (CRUD rifas, KPIs, usuarios, jobs)
✅ Jobs automáticos (sold_out, closed, expire purchases)
✅ Hardening parcial (throttler, pino, zod, error filter)
✅ Fix: packsSold en KPIs/admin solo cuenta compras pagadas
✅ Fix: luckyPassCount correcto en dashboard (historial y hero card)
✅ Fix: validación input número ticket (no queda stuck en 'checking')