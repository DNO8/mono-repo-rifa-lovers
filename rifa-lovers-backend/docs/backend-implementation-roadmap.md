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
| 4 | Raffles — lectura básica | ✅ Básico |
| 5 | LuckyPass — lectura básica | ✅ Básico |
| 6 | Purchases — flujo real | ❌ Pendiente |
| 7 | Packs | ❌ Pendiente |
| 8 | Payments | ❌ Pendiente |
| 9 | Prizes + Milestones | ❌ Pendiente |
| 10 | Draw (Sorteo) | ❌ Pendiente |
| 11 | Admin | ❌ Pendiente |
| 12 | Jobs Automáticos | ❌ Pendiente |
| 13 | Hardening | ❌ Pendiente |

---

# ✅ Fase 1 — Infraestructura Base

**Estado: Completo**

Proyecto NestJS configurado con:

- `src/config/` — variables de entorno, Supabase config
- `src/database/` — PrismaService
- `src/common/` — guards, decoradores, interceptores
- Prisma conectado a Supabase PostgreSQL

---

# ✅ Fase 2 — Modelo de Datos

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

# ✅ Fase 3 — Módulo Auth + Users

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

# ✅ Fase 4 — Módulo Raffles (lectura básica)

**Estado: Básico — solo lectura de la rifa activa**

Módulo: `/modules/raffles/`

### Endpoints implementados

```
GET /raffles/active           → Retorna la rifa con status='active'
GET /raffles/active/progress  → Retorna progreso de la rifa activa
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
  "createdAt": "timestamp"
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

### Pendiente en este módulo

- `GET /raffles/active/prizes` — listar premios y milestones
- `GET /raffles/active/milestones` — estado de desbloqueo

---

# ✅ Fase 5 — Módulo LuckyPass (lectura básica)

**Estado: Básico — solo lectura de passes del usuario**

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

# ❌ Fase 6 — Purchases (flujo real)

**Estado: Pendiente** (existe placeholder sin lógica de negocio)

Módulo: `/modules/purchases/`

> ⚠️ El módulo existe con endpoints, pero actualmente crea compras con `status: 'paid'` directamente sin lógica real.

### Lo que debe implementarse

El flujo completo de una compra:

```
1. Validar que raffle.status = 'active'
2. Crear Purchase (status: 'pending')
3. Crear UserPack (userId + raffleId + packId + quantity)
4. Iniciar PaymentTransaction (status: 'created')
5. Retornar purchase_id para continuar con pago
```

La generación de LuckyPasses ocurre **después de confirmar el pago** (Fase 8).

### Endpoints a completar

```
POST /purchases          → Crear orden de compra (requiere packId + quantity)
GET  /purchases/my       → Historial de compras del usuario
GET  /purchases/:id      → Detalle de una compra
```

### Request final esperado

```json
{
  "raffleId": "uuid",
  "packId": "uuid",
  "quantity": 2
}
```

### Transacción obligatoria

La creación de `Purchase` + `UserPack` debe ejecutarse en una transacción Prisma.

---

# ❌ Fase 7 — Módulo Packs

**Estado: Pendiente** (carpeta no existe aún)

Módulo a crear: `/modules/packs/`

### Responsabilidad

- Listar packs disponibles para una rifa
- Mostrar precio y cantidad de LuckyPasses por pack

### Endpoints

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
    "price": 5000,
    "luckyPassQuantity": 1,
    "isFeatured": false,
    "isPreSale": false
  }
]
```

---

# ❌ Fase 8 — Módulo Payments

**Estado: Pendiente** (carpeta vacía)

Módulo: `/modules/payments/`

### Responsabilidad

- Crear orden de pago en la pasarela (ej: Flow)
- Recibir y validar webhook de confirmación
- Confirmar compra y generar LuckyPasses

### Endpoints

```
POST /payments/create    → Crear orden de pago para una purchase
POST /payments/webhook   → Recibir confirmación de la pasarela
```

### Flujo post-confirmación de pago

```
1. Validar firma/autenticidad del webhook
2. Consultar estado en API de la pasarela
3. Si aprobado:
   - PaymentTransaction.status → 'approved'
   - Purchase.status → 'paid', paidAt = NOW()
   - Generar LuckyPasses:
       N = userPack.quantity × pack.luckyPassQuantity
       Asignar ticket_number único por raffle
       status = 'active', isWinner = false
   - Actualizar raffle_progress:
       packs_sold += userPack.quantity
       revenue_total += purchase.totalAmount
       percentage_to_goal = packs_sold / raffle.goalPacks × 100
4. Si rechazado:
   - PaymentTransaction.status → 'rejected'
   - Purchase.status → 'failed'
```

### Idempotencia

Antes de procesar el webhook, verificar:

```
if PaymentTransaction.status == 'approved' → ignorar
```

Usar `UNIQUE(provider_transaction_id)` para prevenir duplicados.

---

# ❌ Fase 9 — Prizes + Milestones

**Estado: Pendiente** (carpeta vacía)

Módulo: `/modules/prizes/`

### Responsabilidad

- Listar premios de una rifa
- Listar milestones y su estado de desbloqueo
- Un milestone se desbloquea cuando `raffle_progress.packs_sold >= milestone.required_packs`

### Endpoints

```
GET /raffles/active/prizes      → Premios de la rifa activa
GET /raffles/active/milestones  → Milestones y estado de desbloqueo
```

### Tipos de premio (`PrizeType`)

```
milestone → asociado a un milestone (se desbloquea por progreso)
flash     → premio especial no asociado a milestone
```

---

# ❌ Fase 10 — Draw (Sorteo)

**Estado: Pendiente** (carpeta `winners/` vacía)

Módulo: `/modules/draw/` (o endpoint en admin)

### Responsabilidad

- Ejecutar el sorteo de una rifa
- Solo puede ejecutarse si `raffle.status = 'closed'`
- Seleccionar ganadores aleatoriamente entre LuckyPasses activos
- Solo participan premios de milestones desbloqueados

### Endpoint

```
POST /admin/raffles/:id/draw    → Ejecutar sorteo (Admin only)
```

### Flujo del sorteo

```sql
-- 1. Obtener premios de milestones desbloqueados
SELECT p.*
FROM prizes p
JOIN milestones m ON p.milestone_id = m.id
WHERE m.raffle_id = $1 AND m.is_unlocked = true
ORDER BY m.sort_order;

-- 2. Por cada premio, seleccionar un LuckyPass ganador
SELECT id, user_id
FROM lucky_passes
WHERE raffle_id = $1 AND status = 'active'
ORDER BY random()
LIMIT 1;

-- 3. Registrar ganador
INSERT INTO prize_winners (prize_id, lucky_pass_id, user_id)
VALUES ($prize_id, $lucky_pass_id, $user_id);

-- 4. Marcar LuckyPass como ganador
UPDATE lucky_passes
SET status = 'winner', is_winner = true
WHERE id = $lucky_pass_id;
```

Post-sorteo:

```
raffle.status → 'drawn'
```

### Constraint de integridad

```
UNIQUE(lucky_pass_id) en prize_winners — un LuckyPass no puede ganar dos premios
```

---

# ❌ Fase 11 — Admin

**Estado: Pendiente** (carpeta vacía)

Módulo: `/modules/admin/`

### Responsabilidad

- Gestión de rifas (crear, editar, cambiar estado)
- KPIs del sistema
- Gestión de usuarios (bloquear, cambiar rol)

### Endpoints

```
POST  /admin/raffles             → Crear rifa
PATCH /admin/raffles/:id         → Actualizar rifa
PATCH /admin/raffles/:id/status  → Cambiar estado (DRAFT→ACTIVE, ACTIVE→CLOSED, etc.)
GET   /admin/kpis                → Métricas globales
PATCH /admin/users/:id/role      → Cambiar rol de usuario
PATCH /admin/users/:id/block     → Bloquear usuario
```

### KPIs esperados

```json
{
  "totalSales": 15000000,
  "packsSold": 4500,
  "activeUsers": 230,
  "activeRaffles": 1
}
```

---

# ❌ Fase 12 — Jobs Automáticos

**Estado: Pendiente**

Implementar con `@nestjs/schedule` (cron jobs).

### Jobs necesarios

**Auto SOLD_OUT** — cada 5 minutos:
```sql
UPDATE raffles
SET status = 'sold_out'
FROM raffle_progress
WHERE raffles.id = raffle_progress.raffle_id
  AND raffle_progress.packs_sold >= raffles.goal_packs
  AND raffles.status = 'active';
```

**Auto CLOSED** — cada 5 minutos:
```sql
UPDATE raffles
SET status = 'closed'
WHERE status IN ('active', 'sold_out')
  AND end_date <= NOW();
```

**Expirar purchases no pagadas** — cada 15 minutos:
```sql
UPDATE purchases
SET status = 'failed'
WHERE status = 'pending'
  AND created_at < NOW() - INTERVAL '30 minutes';
```

---

# ❌ Fase 13 — Hardening

**Estado: Pendiente**

Mejoras finales de producción:

- **Rate limiting** → `@nestjs/throttler`
- **Logging** → `nestjs-pino`
- **Validación DTO** → `class-validator` (ya implementado, revisar cobertura)
- **Manejo de errores** → filtros de excepciones globales
- **Variables de entorno** → validación con `Joi` o `zod`

---

# 🧠 Estrategia de Testing

Flujo completo a probar antes de producción:

```
register → login → get raffle active → get packs
→ create purchase → create payment → simulate webhook
→ verify lucky-passes generated → run draw → verify winners
```

---

# 🎯 Próximos pasos inmediatos

En orden de prioridad para completar el MVP:

1. **Fase 7 — Packs**: módulo de lectura de packs (desbloqueador de todo el flujo de compra)
2. **Fase 6 — Purchases real**: validar rifa + crear UserPack + iniciar pago
3. **Fase 8 — Payments**: webhook + generación de LuckyPasses
4. **Fase 9 — Prizes**: endpoint de premios y milestones para el frontend
5. **Fase 10 — Draw**: sorteo para cerrar el ciclo del MVP