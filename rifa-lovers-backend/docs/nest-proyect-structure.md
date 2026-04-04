# NestJS Project Structure

Este documento define la estructura de carpetas y módulos para el backend de **Rifa Lovers**, utilizando **NestJS** con una arquitectura modular basada en **Domain Driven Design (DDD)**, principios **SOLID**, y **bajo acoplamiento**.

La estructura está optimizada para:

- Escalabilidad
- Testabilidad
- Separación de responsabilidades
- Crecimiento del proyecto

---

# Principios de arquitectura

La arquitectura sigue estos principios:

### 1. Modularidad

Cada dominio de negocio es un **módulo independiente**.

Ejemplo:

- Users
- Raffles
- Tickets
- Purchases
- Lucky Pass
- Prizes

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
│ ├── database.config.ts
│ ├── supabase.config.ts
│ └── env.config.ts
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
│ ├── database.module.ts
│ └── supabase.service.ts
│
├── modules/
│
│ ├── users/
│ │
│ │ ├── users.module.ts
│ │ ├── users.controller.ts
│ │ ├── users.service.ts
│ │ ├── users.repository.ts
│ │ │
│ │ ├── dto/
│ │ │ ├── create-user.dto.ts
│ │ │ └── update-user.dto.ts
│ │ │
│ │ └── entities/
│ │ └── user.entity.ts
│
│ ├── raffles/
│ │
│ │ ├── raffles.module.ts
│ │ ├── raffles.controller.ts
│ │ ├── raffles.service.ts
│ │ ├── raffles.repository.ts
│ │ │
│ │ ├── dto/
│ │ │ ├── create-raffle.dto.ts
│ │ │ ├── update-raffle.dto.ts
│ │ │ └── raffle-filter.dto.ts
│ │ │
│ │ └── entities/
│ │ └── raffle.entity.ts
│
│ ├── prizes/
│ │
│ │ ├── prizes.module.ts
│ │ ├── prizes.controller.ts
│ │ ├── prizes.service.ts
│ │ ├── prizes.repository.ts
│ │ │
│ │ ├── dto/
│ │ │ └── create-prize.dto.ts
│ │ │
│ │ └── entities/
│ │ └── prize.entity.ts
│
│ ├── tickets/
│ │
│ │ ├── tickets.module.ts
│ │ ├── tickets.controller.ts
│ │ ├── tickets.service.ts
│ │ ├── tickets.repository.ts
│ │ │
│ │ ├── dto/
│ │ │ └── reserve-ticket.dto.ts
│ │ │
│ │ └── entities/
│ │ └── ticket.entity.ts
│
│ ├── lucky-pass/
│ │
│ │ ├── lucky-pass.module.ts
│ │ ├── lucky-pass.controller.ts
│ │ ├── lucky-pass.service.ts
│ │ ├── lucky-pass.repository.ts
│ │ │
│ │ ├── dto/
│ │ │ └── create-lucky-pass.dto.ts
│ │ │
│ │ └── entities/
│ │ └── lucky-pass.entity.ts
│
│ ├── purchases/
│ │
│ │ ├── purchases.module.ts
│ │ ├── purchases.controller.ts
│ │ ├── purchases.service.ts
│ │ ├── purchases.repository.ts
│ │ │
│ │ ├── dto/
│ │ │ └── create-purchase.dto.ts
│ │ │
│ │ └── entities/
│ │ └── purchase.entity.ts
│
│ ├── payments/
│ │
│ │ ├── payments.module.ts
│ │ ├── payments.controller.ts
│ │ ├── payments.service.ts
│ │ └── payments.repository.ts
│
│ ├── winners/
│ │
│ │ ├── winners.module.ts
│ │ ├── winners.service.ts
│ │ ├── winners.repository.ts
│ │ └── entities/
│ │ └── winner.entity.ts
│
│ └── admin/
│ ├── admin.module.ts
│ ├── admin.controller.ts
│ └── admin.service.ts
│
└── scripts/
├── draw-raffle.ts
└── seed-database.ts


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
- Premios desbloqueables

Tabla:


raffle_prizes


---

# Tickets Module

Responsabilidad:

- Generación de tickets
- Reservas
- Validación de disponibilidad

Tabla:


tickets


Estados posibles:


available
reserved
sold


---

# Lucky Pass Module

Responsabilidad:

Representa el **número que participa en la rifa**.

Tabla:


lucky_pass


Relación:


ticket -> lucky_pass -> purchase


---

# Purchases Module

Responsabilidad:

- Compras de tickets
- Relación usuario → ticket
- confirmación de compra

Tabla:


purchases


---

# Payments Module

Responsabilidad:

- Integración con pasarela de pago
- Webhooks
- Confirmación de pago

Tabla:


payments


---

# Winners Module

Responsabilidad:

- Registrar ganadores
- Relacionar premio con lucky pass

Tabla:


raffle_winners


Regla clave:

Un **lucky_pass solo puede ganar un premio**.

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

Compra de tickets:


User
↓
POST /purchases
↓
TicketsService
↓
reserve tickets
↓
create purchase
↓
payment
↓
confirm purchase


---

# Manejo de concurrencia

El módulo **Tickets** maneja la concurrencia para evitar doble venta.

Se usan:

- `SELECT FOR UPDATE`
- transacciones
- índices únicos

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