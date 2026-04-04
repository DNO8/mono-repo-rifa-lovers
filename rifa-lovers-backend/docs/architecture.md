# 🏗 Backend Architecture — RifaLovers API

Este documento describe la arquitectura del backend de **RifaLovers**, incluyendo principios de diseño, estructura modular, patrones aplicados y reglas de desarrollo.

El objetivo es mantener un backend:

- Modular
- Escalable
- Testeable
- Con bajo acoplamiento
- Alta cohesión

---

# Principios de Arquitectura

El backend sigue los siguientes principios:

### SOLID

- **S** Single Responsibility
- **O** Open/Closed
- **L** Liskov Substitution
- **I** Interface Segregation
- **D** Dependency Inversion

### Otros principios

- Bajo acoplamiento
- Alta cohesión
- Separación de responsabilidades
- Arquitectura modular
- Código orientado a dominio

---

# Estilo de Arquitectura

El proyecto utiliza una arquitectura **Modular + Layered Architecture**.

Cada módulo encapsula su propio dominio.


Controller → Service → Repository → Database


---

# Capas del Backend

## Controllers

Responsables de:

- Recibir requests HTTP
- Validar DTOs
- Invocar servicios
- Devolver respuestas

No contienen lógica de negocio.

Ejemplo:


POST /purchases
GET /raffles


---

## Services

Contienen la **lógica de negocio del dominio**.

Responsables de:

- Aplicar reglas de negocio
- Orquestar repositorios
- Manejar transacciones
- Ejecutar workflows

Ejemplo:


purchase.service.ts
raffle.service.ts
payment.service.ts


---

## Repositories (Data Access)

Responsables de:

- Acceso a base de datos
- Queries
- Persistencia

Utilizan **Prisma ORM** sobre PostgreSQL.

---

## Database

PostgreSQL (Supabase)

Incluye:

- tablas
- índices
- triggers
- funciones

La base de datos maneja:

- generación de tickets
- progreso de rifas
- desbloqueo de milestones

---

# Arquitectura Modular

Cada dominio del sistema se implementa como **un módulo independiente**.


modules/


Cada módulo contiene:


module
├ controller
├ service
├ repository
├ dto
└ entities


---

# Módulos del Sistema

## Auth

Responsable de autenticación.

Funciones:

- Validar JWT
- Obtener usuario autenticado

---

## Users

Gestión de usuarios.

Responsabilidades:

- perfil
- roles
- estado del usuario

---

## Raffles

Dominio central del sistema.

Responsabilidades:

- rifas
- progreso
- milestones
- premios

---

## Packs

Configuración de packs de compra.

Responsabilidades:

- precio
- cantidad de LuckyPass
- promociones

---

## Purchases

Gestión de compras.

Responsabilidades:

- crear compras
- registrar packs
- coordinar pagos

---

## Payments

Integración con Flow.

Responsabilidades:

- crear transacciones
- recibir webhooks
- confirmar pagos

---

## LuckyPass

Gestión de tickets.

Responsabilidades:

- consultar tickets de usuario
- listar tickets por rifa

---

## Draw

Sistema de sorteos.

Responsabilidades:

- seleccionar ganadores
- registrar premios
- auditar resultados

---

## Analytics

KPIs del sistema.

Responsabilidades:

- ventas
- packs vendidos
- progreso

---

# Flujo de Compra


Cliente
↓
POST /purchases
↓
Purchase Service
↓
User Packs
↓
Trigger DB
↓
Generate LuckyPass
↓
Flow Payment
↓
Webhook Flow
↓
Confirm Purchase


---

# Flujo de Sorteo


Admin
↓
POST /draw/:raffleId
↓
Draw Service
↓
Obtener premios desbloqueados
↓
Seleccionar LuckyPass aleatorio
↓
Registrar ganador
↓
Actualizar ticket


---

# Manejo de Transacciones

Las operaciones críticas usan **transacciones de base de datos**.

Ejemplo:

- compras
- asignación de packs
- sorteos

Esto garantiza:

- atomicidad
- consistencia

---

# Seguridad

El backend utiliza:

### JWT Auth

Tokens generados por Supabase.

### Guards

- AuthGuard
- RolesGuard

### Validación

DTOs con:


class-validator


---

# Escalabilidad

El diseño permite escalar fácilmente:

- nuevos métodos de pago
- múltiples rifas simultáneas
- múltiples organizaciones

---

# Reglas de Desarrollo

Todos los módulos deben:

- tener controller
- tener service
- usar DTOs
- no acceder directamente a DB desde controllers

---

# Convenciones

### Naming


raffle.service.ts
raffle.controller.ts
raffle.repository.ts


### DTOs


create-raffle.dto.ts
purchase-pack.dto.ts


---

# Testing

Se recomienda:

- Unit tests para services
- Integration tests para endpoints críticos

---

# Evolución futura

Posibles extensiones:

- múltiples métodos de pago
- sistema de notificaciones
- sorteos automatizados
- panel de administración avanzado