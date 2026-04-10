# 🌐 API Specification — RifaLovers

Especificación de la API REST del backend.

Base URL: `/api/v1`

Leyenda:
- ✅ Implementado
- ⚠️ Placeholder (existe pero incompleto)
- 🚧 Pendiente de implementación

---

# 🔐 Auth

---

## ✅ POST /auth/register

Registrar usuario nuevo. Crea cuenta en Supabase Auth y en la tabla `users`.

### Request

```json
{
  "email": "user@email.com",
  "password": "12345678",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "56912345678"
}
```

### Response `201`

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

---

## ✅ POST /auth/login

Login de usuario.

### Request

```json
{
  "email": "user@email.com",
  "password": "12345678"
}
```

### Response `200`

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

---

## ✅ POST /auth/refresh

Renueva el accessToken usando el refreshToken.

### Request

```json
{
  "refreshToken": "jwt"
}
```

### Response `200`

```json
{
  "accessToken": "jwt"
}
```

---

# 👤 Users

---

## ✅ GET /users/me

Obtiene el perfil del usuario autenticado.

**Auth:** JWT requerido

### Response `200`

```json
{
  "id": "uuid",
  "email": "user@email.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": 56912345678,
  "role": "customer",
  "status": "active",
  "createdAt": "timestamp"
}
```

---

## ✅ PATCH /users/me

Actualizar perfil del usuario autenticado.

**Auth:** JWT requerido

### Request

```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "56912345678"
}
```

### Response `200`

```json
{
  "id": "uuid",
  "email": "user@email.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": 56912345678,
  "role": "customer",
  "status": "active",
  "createdAt": "timestamp"
}
```

---

## ✅ GET /users

Lista todos los usuarios.

**Auth:** JWT + rol `admin` o `operator`

### Query params

```
?skip=0&take=20
```

### Response `200`

```json
[
  {
    "id": "uuid",
    "email": "user@email.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "customer",
    "status": "active"
  }
]
```

---

## ✅ GET /users/:id

Obtiene un usuario por id.

**Auth:** JWT + rol `admin` o `operator`

---

# 🎲 Raffles

---

## ✅ GET /raffles/active

Obtiene la rifa actualmente activa, incluyendo milestones y sus prizes.

### Response `200`

```json
{
  "id": "uuid",
  "title": "Rifa Macbook Pro",
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
    },
    {
      "id": "uuid",
      "name": "Meta 100%",
      "requiredPacks": 5000,
      "sortOrder": 2,
      "isUnlocked": false,
      "prizes": [
        {
          "id": "uuid",
          "name": "Macbook Pro",
          "description": "...",
          "type": "milestone"
        }
      ]
    }
  ]
}
```

> **Nota:** Los milestones y prizes se incluyen embebidos en esta respuesta. No se necesitan endpoints separados para lectura pública.

---

## ✅ GET /raffles/active/progress

Progreso actual de la rifa activa.

### Response `200`

```json
{
  "raffleId": "uuid",
  "packsSold": 1250,
  "revenueTotal": 6250000,
  "percentageToGoal": 25.0
}
```

> **Nota:** El campo `percentageToGoal` se almacena en la BD pero **el frontend no lo usa** — calcula el progreso dinámicamente como `(packsSold / goalPacks) × 100`.

---

## ✅ GET /raffles/:id

Detalle de una rifa por ID (sin milestones).

**Auth:** No requerido

### Response `200`

```json
{
  "id": "uuid",
  "title": "Rifa Macbook Pro",
  "description": "...",
  "goalPacks": 5000,
  "status": "active",
  "createdAt": "timestamp"
}
```

---

# 📦 Packs

---

## 🚧 GET /packs

Lista los packs disponibles para comprar.

### Response `200` (esperado)

```json
[
  {
    "id": "uuid",
    "name": "Pack Básico",
    "price": 5000,
    "luckyPassQuantity": 1,
    "isFeatured": false,
    "isPreSale": false
  },
  {
    "id": "uuid",
    "name": "Pack x5",
    "price": 20000,
    "luckyPassQuantity": 5,
    "isFeatured": true,
    "isPreSale": false
  }
]
```

---

# 🧾 Purchases

---

## ✅ GET /purchases/my

Historial de compras del usuario autenticado.

**Auth:** JWT requerido

### Response `200`

```json
[
  {
    "id": "uuid",
    "raffleId": "uuid",
    "raffleName": "Rifa Macbook Pro",
    "totalAmount": 20000,
    "status": "paid",
    "createdAt": "timestamp"
  }
]
```

---

## ⚠️ POST /purchases

Crear orden de compra.

**Auth:** JWT requerido

> ⚠️ Actualmente es un placeholder. El flujo real (validar rifa, crear UserPack, iniciar pago) está pendiente de implementación.

### Request (implementación final esperada)

```json
{
  "raffleId": "uuid",
  "packId": "uuid",
  "quantity": 2
}
```

### Response `201`

```json
{
  "id": "uuid",
  "raffleId": "uuid",
  "raffleName": "Rifa Macbook Pro",
  "totalAmount": 40000,
  "status": "pending",
  "createdAt": "timestamp"
}
```

---

## 🚧 GET /purchases/:id

Detalle de una compra específica.

### Response `200` (esperado)

```json
{
  "id": "uuid",
  "raffleId": "uuid",
  "raffleName": "Rifa Macbook Pro",
  "totalAmount": 40000,
  "status": "paid",
  "paidAt": "timestamp",
  "createdAt": "timestamp",
  "luckyPasses": [
    { "id": "uuid", "ticketNumber": 4521 },
    { "id": "uuid", "ticketNumber": 4522 }
  ]
}
```

---

# 🎟 LuckyPass

---

## ✅ GET /lucky-passes/my

Lista los LuckyPasses del usuario autenticado.

**Auth:** JWT requerido

### Response `200`

```json
[
  {
    "id": "uuid",
    "ticketNumber": 4521,
    "status": "active",
    "isWinner": false,
    "raffleId": "uuid",
    "raffleName": "Rifa Macbook Pro",
    "createdAt": "timestamp"
  }
]
```

---

## ✅ GET /lucky-passes/my/summary

Resumen de LuckyPasses del usuario.

**Auth:** JWT requerido

### Response `200`

```json
{
  "total": 10,
  "active": 8,
  "used": 1,
  "winners": 1
}
```

---

# 💳 Payments

---

## 🚧 POST /payments/create

Crea orden de pago en la pasarela para una purchase existente.

**Auth:** JWT requerido

### Request

```json
{
  "purchaseId": "uuid"
}
```

### Response `201` (esperado)

```json
{
  "paymentUrl": "https://flow.cl/payment/xxx",
  "providerTransactionId": "string"
}
```

---

## 🚧 POST /payments/webhook

Webhook de confirmación de pago. Recibe notificación de la pasarela.

> No requiere JWT — autenticado por firma de la pasarela.

### Acciones al recibir confirmación aprobada

1. Validar firma del proveedor
2. Verificar estado en API del proveedor
3. Actualizar `PaymentTransaction.status → 'approved'`
4. Actualizar `Purchase.status → 'paid'`
5. Generar LuckyPasses para cada UserPack de la compra
6. Actualizar `raffle_progress`

---

# 🏆 Winners

---

## 🚧 GET /raffles/active/winners

Obtiene los ganadores de la rifa después del sorteo.

### Response `200` (esperado)

```json
[
  {
    "prizeId": "uuid",
    "prizeName": "Macbook Pro",
    "ticketNumber": 4521,
    "userId": "uuid"
  }
]
```

---

# 🎲 Sorteo (Admin)

---

## 🚧 POST /admin/raffles/:id/draw

Ejecuta el sorteo de una rifa.

**Auth:** JWT + rol `admin`

**Requiere:** `raffle.status = 'closed'`

### Response `200` (esperado)

```json
{
  "winners": [
    {
      "prizeId": "uuid",
      "prizeName": "Macbook Pro",
      "ticketNumber": 4521,
      "userId": "uuid"
    }
  ]
}
```

---

# 📊 Admin / KPIs

---

## 🚧 GET /admin/kpis

Métricas globales del sistema.

**Auth:** JWT + rol `admin`

### Response `200` (esperado)

```json
{
  "totalSales": 15000000,
  "packsSold": 4500,
  "activeUsers": 230,
  "activeRaffles": 1
}
```

---

## 🚧 POST /admin/raffles

Crear una nueva rifa.

**Auth:** JWT + rol `admin`

---

## 🚧 PATCH /admin/raffles/:id/status

Cambiar el estado de una rifa.

**Auth:** JWT + rol `admin`

### Request

```json
{
  "status": "active"
}
```

---

# ⚠️ Códigos de Error

| Código | Significado |
|--------|-------------|
| 400 | Bad Request — validación fallida |
| 401 | Unauthorized — JWT inválido o ausente |
| 403 | Forbidden — rol insuficiente |
| 404 | Not Found |
| 409 | Conflict — recurso duplicado |
| 500 | Server Error |

---

# 🔒 Seguridad

- JWT obligatorio en endpoints autenticados
- `RolesGuard` para endpoints de Admin/Operator
- Validación de DTOs con `class-validator`
- Verificación de firma en webhooks de pago

---

# 🚀 Versionado

Versión actual: `/api/v1`
