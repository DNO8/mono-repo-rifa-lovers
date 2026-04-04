# 🚀 Backend Implementation Roadmap

Este documento define el **orden recomendado para implementar el backend de RifaLovers**.

El objetivo es:

- evitar bloqueos arquitectónicos
- implementar primero las bases críticas
- permitir probar el sistema desde etapas tempranas

Stack:

- NestJS
- PostgreSQL (Supabase)
- Prisma / TypeORM
- Flow Payments
- JWT Auth

---

# 🧭 Principio de Implementación

El backend se construye en este orden:


1 Infraestructura
2 Autenticación
3 Rifas
4 Tickets
5 Purchases
6 Payments
7 Concurrency control
8 Sorteo
9 KPIs
10 Hardening


---

# 🧱 Fase 1 — Infraestructura Base

Duración estimada: **1 día**

### Objetivo

Preparar el proyecto NestJS y la conexión a la base de datos.

### Tareas

Crear proyecto:


nest new backend


Configurar:


/src/config
/src/database
/src/common


Instalar dependencias:


npm install @nestjs/config
npm install @nestjs/jwt
npm install passport passport-jwt
npm install class-validator class-transformer


ORM:


Prisma
o
TypeORM


Conectar con Supabase.

---

# 🧱 Fase 2 — Modelo de Datos

Duración estimada: **1 día**

### Objetivo

Conectar el ORM con el modelo de datos actual.

Entidades principales:


User
Raffle
Ticket
Purchase
Payment
Prize
Winner


Verificar:

- enums
- índices
- constraints

Importante validar:


UNIQUE (raffle_id, number)


---

# 🧱 Fase 3 — Módulo Users / Auth

Duración estimada: **1 día**

Crear módulos:


/modules/users
/modules/auth


Endpoints:


POST /auth/register
POST /auth/login
GET /users/me


Implementar:

- JWT
- password hashing (bcrypt)

---

# 🧱 Fase 4 — Módulo Raffles

Duración estimada: **1 día**

Crear módulo:


/modules/raffles


Endpoints:


GET /raffles
GET /raffles/:id
GET /raffles/:id/prizes


Funciones clave:

- listar rifas
- mostrar progreso
- calcular tickets vendidos

---

# 🧱 Fase 5 — Sistema de Tickets

Duración estimada: **2 días**

Implementar lógica de tickets.

Endpoints:


GET /raffles/:id/tickets


Funcionalidad:

- obtener tickets disponibles
- mostrar estado

Implementar:


AVAILABLE
RESERVED
SOLD


Pre-generación de tickets:


1 → total_tickets


Ejemplo:


10,000 tickets


---

# 🧱 Fase 6 — Purchases

Duración estimada: **2 días**

Crear módulo:


/modules/purchases


Endpoint principal:


POST /purchases


Flujo:


validar rifa ACTIVE
reservar tickets
crear purchase
crear payment


Transacción obligatoria.

---

# 🧱 Fase 7 — Concurrency Control

Duración estimada: **1 día**

Implementar reserva segura de tickets.

Query crítica:

```sql
UPDATE tickets
SET status = 'RESERVED'
WHERE raffle_id = $1
AND number = ANY($2)
AND status = 'AVAILABLE'
RETURNING id;

Si filas devueltas != tickets solicitados:

rollback

Esto previene:

doble venta
race conditions
🧱 Fase 8 — Payments (Flow)

Duración estimada: 2 días

Crear módulo:

/modules/payments

Endpoints:

POST /payments/create
POST /payments/webhook

Flujo:

crear orden Flow
redirigir usuario
recibir webhook
confirmar pago
actualizar tickets

Cambios tras pago:

tickets → SOLD
purchase → PAID
payment → PAID
🧱 Fase 9 — Sorteo

Duración estimada: 1 día

Crear endpoint admin:

POST /raffles/:id/draw

Pasos:

1 obtener premios desbloqueados
2 obtener tickets SOLD
3 seleccionar tickets aleatorios
4 insertar winners

Luego:

raffle.status → DRAWN
🧱 Fase 10 — KPIs

Duración estimada: 1 día

Endpoints:

GET /admin/kpis

Métricas:

ventas totales
tickets vendidos
usuarios activos
rifas activas
🧱 Fase 11 — Jobs Automáticos

Duración estimada: 1 día

Crear workers o cron jobs.

Liberar tickets reservados
RESERVED > 15 min
Auto SOLD_OUT
sold_tickets >= total_tickets
Auto CLOSED
draw_date <= NOW()
🧱 Fase 12 — Hardening

Duración estimada: 2 días

Mejoras finales:

Rate limiting
@nestjs/throttler
Logging
nestjs-pino
Validación DTO
class-validator
Manejo de errores
HTTP exceptions
📊 Orden de Desarrollo

Orden recomendado real:

1 database connection
2 auth
3 raffles
4 tickets
5 purchases
6 payments
7 concurrency
8 draw
9 jobs
10 kpis
🧠 Estrategia de Testing

Antes del frontend:

Probar flujo completo:

register
login
get raffles
create purchase
create payment
simulate webhook
verify tickets
run draw
🎯 Resultado Final

El backend permitirá:

crear rifas
comprar tickets
pagar con Flow
ejecutar sorteos
mostrar ganadores

Todo con:

consistencia
seguridad
control de concurrencia
🚀 Estado MVP

Con las primeras 8 fases el sistema ya es usable.

rifa → compra → pago → tickets → sorteo

---

## Algo importante que te voy a recomendar antes de empezar a codear

Dado todo lo que ya diseñamos (modelo + docs), hay **una mejora arquitectónica muy buena para tu backend NestJS**:

crear esta carpeta:


/src/domain


y separar:


domain
application
infrastructure


Es decir aplicar **Clean Architecture ligera**, que en sistemas como este **evita que payments/tickets se mezclen**.

Si quieres, en el siguiente paso puedo darte:

### `nestjs-project-structure.md`

con una **estructura de carpetas profesional para este proyecto** que encaja con todo lo que ya diseñamos.