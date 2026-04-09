# NestJS Project Structure

Este documento define la estructura de carpetas y módulos para el backend de **Rifa Lovers**, utilizando **NestJS** con una arquitectura modular basada en **Domain Driven Design (DDD)**, principios **SOLID**, y **bajo acoplamiento**.

La estructura está optimizada para:

- Escalabilidad
- Testabilidad
- Separación de responsabilidades
- Crecimiento del proyecto

---

# Estado de los módulos

| Módulo | Estado | Tabla principal |
|--------|--------|----------------|
| `users/` | ✅ Implementado | `users` |
| `raffles/` | ✅ Básico (solo lectura) | `raffles`, `raffle_progress` |
| `lucky-pass/` | ✅ Básico (solo lectura) | `lucky_passes` |
| `purchases/` | ⚠️ Placeholder | `purchases` |
| `packs/` | ❌ Pendiente (carpeta no existe) | `packs` |
| `payments/` | ❌ Pendiente (carpeta vacía) | `payment_transactions` |
| `prizes/` | ❌ Pendiente (carpeta vacía) | `prizes`, `milestones` |
| `winners/` | ❌ Pendiente (carpeta vacía) | `prize_winners` |
| `admin/` | ❌ Pendiente (carpeta vacía) | múltiples |
| `scripts/` | ❌ Pendiente (carpeta vacía) | — |

---

# Principios de arquitectura

La arquitectura sigue estos principios:

### 1. Modularidad

Cada dominio de negocio es un **módulo independiente**.

Ejemplo:

- Users (incluye Auth)
- Raffles
- Packs
- Purchases
- Lucky Pass
- Payments
- Prizes
- Draw / Winners
- Admin

Cada módulo contiene:

- controller
- service
- repository
- dto
- entity

---

### 2. Bajo acoplamiento

Los módulos **no acceden directamente a las tablas de otros módulos**.

Siempre se usa:

- services
- interfaces
- dependency injection

---

### 3. Alta cohesión

Cada módulo se enfoca **solo en su dominio**.

Ejemplo:

RaffleModule solo gestiona:

- rifas
- estado de rifas
- relación con premios

No maneja compras ni pagos.

---

### 4. Separación por capas

Cada módulo sigue esta estructura:


Controller
↓
Service
↓
Repository
↓
Database


---

# Estructura general del proyecto


src/
│
├── main.ts
├── app.module.ts
│
├── config/
│ └── supabase.service.ts    ← Supabase Auth client
│
├── common/
│ ├── guards/
│ ├── interceptors/
│ ├── filters/
│ ├── decorators/
│ ├── utils/
│ └── constants/
│
├── database/
│ └── database.module.ts
│ └── prisma.service.ts
│
├── modules/
│
│ ├── users/                  ← ✅ Implementado
│ │
│ │ ├── users.module.ts
│ │ ├── users.controller.ts   ← rutas /users
│ │ ├── users.service.ts
│ │ ├── auth.controller.ts    ← rutas /auth
│ │ ├── auth.service.ts
│ │ │
│ │ ├── dto/
│ │ │ ├── register.dto.ts
│ │ │ ├── login.dto.ts
│ │ │ ├── update-user.dto.ts
│ │ │ └── auth-response.dto.ts
│ │ │
│ │ └── guards/
│ │ └── roles.guard.ts
│
│ ├── raffles/                ← ✅ Básico
│ │
│ │ ├── raffles.module.ts
│ │ ├── raffles.controller.ts
│ │ ├── raffles.service.ts
│ │ │
│ │ └── dto/
│ │ ├── raffle-response.dto.ts
│ │ └── index.ts
│
│ ├── prizes/                 ← ❌ Pendiente (carpeta vacía)
│ │   Tabla: prizes, milestones
│
│ ├── packs/                  ← ❌ Pendiente (carpeta no existe)
│ │   Tabla: packs
│
│ ├── lucky-pass/             ← ✅ Básico
│ │
│ │ ├── lucky-pass.module.ts
│ │ ├── lucky-pass.controller.ts
│ │ ├── lucky-pass.service.ts
│ │ │
│ │ └── dto/
│ │ ├── lucky-pass-response.dto.ts
│ │ └── index.ts
│
│ ├── purchases/              ← ⚠️ Placeholder
│ │
│ │ ├── purchases.module.ts
│ │ ├── purchases.controller.ts
│ │ ├── purchases.service.ts
│ │ │
│ │ └── dto/
│ │ ├── create-purchase.dto.ts
│ │ ├── purchase-response.dto.ts
│ │ └── index.ts
│
│ ├── payments/              ← ❌ Pendiente (carpeta vacía)
│ │   Tabla: payment_transactions
│
│ ├── winners/               ← ❌ Pendiente (carpeta vacía)
│ │   Tabla: prize_winners
│
│ └── admin/                 ← ❌ Pendiente (carpeta vacía)
│     Tablas: múltiples (gestión + KPIs)
│
└── scripts/                 ← ❌ Pendiente (carpeta vacía)
    draw-raffle.ts
    seed-database.ts


---

# Descripción de módulos

---

# Users Module

Responsabilidad:

- Gestión de usuarios
- Autenticación
- Datos del perfil

Tabla principal:


users


---

# Raffles Module

Responsabilidad:

- Crear rifas
- Estado de rifas
- Información de rifas

Tabla principal:


raffles


Estados soportados:


draft
active
sold_out
closed
drawn


---

# Prizes Module

Responsabilidad:

- Gestión de premios de una rifa
- Premios desbloqueables por milestone

Tablas:


prizes
milestones


---

# Packs Module

**Estado: Pendiente**

Responsabilidad:

- Listar packs disponibles
- Precio y cantidad de LuckyPasses por pack

Tabla:


packs


---

# Lucky Pass Module

**Estado: Básico (solo lectura)**

Responsabilidad:

Representa el **número de participación en la rifa**. Se genera automáticamente al confirmar el pago.

Tabla:


lucky_passes


Relación:


Purchase → UserPack → LuckyPass


---

# Purchases Module

**Estado: Placeholder — flujo real pendiente**

Responsabilidad:

- Crear órdenes de compra
- Asociar UserPacks a la compra
- Confirmar pago y generar LuckyPasses

Tablas:


purchases
user_packs


---

# Payments Module

**Estado: Pendiente**

Responsabilidad:

- Integración con pasarela de pago (ej: Flow)
- Crear órdenes de pago
- Procesar webhooks
- Confirmar compra y generar LuckyPasses

Tabla:


payment_transactions


---

# Winners Module

**Estado: Pendiente**

Responsabilidad:

- Registrar ganadores del sorteo
- Relacionar premio con lucky pass ganador

Tabla:


prize_winners


Regla clave:

Un **lucky_pass solo puede ganar un premio** → `UNIQUE(lucky_pass_id)` en `prize_winners`.


---

# Scripts

Carpeta para procesos offline.

Ejemplos:

### draw-raffle.ts

Selecciona ganadores cuando una rifa termina.

### seed-database.ts

Carga datos iniciales.


---

# Flujo típico del backend

Compra de packs (flujo objetivo):


User
↓
POST /purchases (raffleId + packId + quantity)
↓
PurchasesService
↓
Validar raffle.status = 'active'
↓
Crear Purchase (pending) + UserPack
↓
POST /payments/create
↓
Crear PaymentTransaction + orden en pasarela
↓
POST /payments/webhook (confirmación)
↓
Purchase → paid
↓
Generar LuckyPasses
↓
Actualizar raffle_progress


---

# Manejo de concurrencia

El módulo **Purchases** maneja la concurrencia para evitar duplicados.

Se usan:

- transacciones Prisma (`prisma.$transaction`)
- índice único `UNIQUE(raffle_id, ticket_number)` en `lucky_passes`
- verificación de `raffle.status = 'active'` dentro de la transacción


---

# Beneficios de esta estructura

### Escalable

Cada dominio puede crecer independientemente.

---

### Fácil de testear

Cada módulo puede testearse aislado.

---

### Bajo acoplamiento

Los módulos no dependen directamente de otros.

---

### Alta cohesión

Cada módulo encapsula su lógica.

---

# Reglas importantes

### 1 No acceder directo a DB desde controller

Incorrecto:


controller -> database


Correcto:


controller -> service -> repository


---

### 2 No mezclar dominios

Incorrecto:


raffles.service.ts manejando pagos


Correcto:


payments.service.ts


---

### 3 Validaciones en DTO

Siempre validar en DTO con:


class-validator


---

# Futuras mejoras

Cuando el proyecto crezca se pueden agregar:


events/
cqrs/
message queue


para manejar:

- sorteos
- notificaciones
- analytics