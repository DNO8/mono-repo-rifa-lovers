# 🧠 Domain Model — RifaLovers

Este documento describe el **modelo de dominio del backend**, basado en el modelo de datos PostgreSQL.

Define las **entidades principales**, sus **atributos**, **relaciones** y **reglas de negocio**.

---

# 🎯 Objetivo del Modelo de Dominio

El sistema permite:

- Crear rifas con premios escalonados
- Vender números de rifa (tickets)
- Asociar compras a usuarios
- Procesar pagos mediante Flow
- Ejecutar sorteos
- Asignar premios a números ganadores

---

# 🧩 Entidades del Dominio

---

# 👤 User

Representa a una persona registrada en la plataforma.

## Atributos

| Campo | Tipo |
|-----|-----|
| id | uuid |
| email | text |
| password_hash | text |
| created_at | timestamp |

## Responsabilidades

- Autenticación
- Compra de tickets
- Participación en rifas

## Relaciones

- Un **User** puede tener muchas **Purchases**


User
└── Purchases
└── Tickets


---

# 🎲 Raffle

Representa una rifa activa o finalizada.

## Atributos

| Campo | Tipo |
|-----|-----|
| id | uuid |
| title | text |
| description | text |
| ticket_price | numeric |
| total_tickets | integer |
| sold_tickets | integer |
| status | raffle_status |
| draw_date | timestamp |
| created_at | timestamp |

## Responsabilidades

- Definir reglas de la rifa
- Controlar disponibilidad de tickets
- Ejecutar el sorteo

## Relaciones

- Una **Raffle** tiene muchos **Tickets**
- Una **Raffle** tiene muchos **Prizes**


Raffle
├── Tickets
└── Prizes


---

# 🎟 Ticket

Representa un número participante en una rifa.

## Atributos

| Campo | Tipo |
|-----|-----|
| id | uuid |
| raffle_id | uuid |
| number | integer |
| purchase_id | uuid |
| status | ticket_status |
| created_at | timestamp |

## Estados posibles


AVAILABLE
RESERVED
SOLD


## Responsabilidades

- Representar un número único dentro de la rifa
- Asociarse a una compra
- Participar en sorteos

## Reglas

- `(raffle_id, number)` debe ser único
- Solo tickets `SOLD` participan en el sorteo

---

# 🧾 Purchase

Representa una compra realizada por un usuario.

## Atributos

| Campo | Tipo |
|-----|-----|
| id | uuid |
| user_id | uuid |
| raffle_id | uuid |
| total_amount | numeric |
| status | purchase_status |
| created_at | timestamp |

## Estados


PENDING
PAID
CANCELLED
FAILED


## Responsabilidades

- Agrupar tickets comprados
- Asociarse a un pago
- Mantener consistencia transaccional

## Relaciones


Purchase
├── Tickets
└── Payment


---

# 💳 Payment

Representa una transacción de pago con Flow.

## Atributos

| Campo | Tipo |
|-----|-----|
| id | uuid |
| purchase_id | uuid |
| flow_order | text |
| flow_token | text |
| status | payment_status |
| amount | numeric |
| created_at | timestamp |

## Estados


PENDING
PAID
REJECTED
EXPIRED


## Responsabilidades

- Registrar transacciones externas
- Validar pagos mediante webhook
- Confirmar compras

---

# 🏆 Prize

Representa un premio dentro de una rifa.

## Atributos

| Campo | Tipo |
|-----|-----|
| id | uuid |
| raffle_id | uuid |
| name | text |
| description | text |
| position | integer |
| unlocked_at_tickets | integer |
| created_at | timestamp |

## Responsabilidades

- Definir premios disponibles
- Controlar premios desbloqueados

## Reglas

Un premio se **desbloquea** cuando:


sold_tickets >= unlocked_at_tickets


---

# 🎯 Winner

Representa el resultado del sorteo.

## Atributos

| Campo | Tipo |
|-----|-----|
| id | uuid |
| raffle_id | uuid |
| ticket_id | uuid |
| prize_id | uuid |
| created_at | timestamp |

## Responsabilidades

- Registrar ticket ganador
- Asociar premio a ticket

## Reglas

- Un **ticket solo puede ganar un premio**
- Un **premio solo tiene un ganador**

---

# 🔗 Relaciones Globales


User
└── Purchase
├── Payment
└── Ticket

Raffle
├── Ticket
├── Prize
└── Winner

Winner
├── Ticket
└── Prize


---

# ⚙️ Reglas de Negocio Clave

### 1️⃣ Ticket único


UNIQUE (raffle_id, number)


---

### 2️⃣ Solo tickets pagados participan

Solo tickets asociados a compras:


purchase.status = PAID


---

### 3️⃣ Un ticket no puede ganar dos premios


UNIQUE(ticket_id)


---

### 4️⃣ Un premio solo tiene un ganador


UNIQUE(prize_id)


---

### 5️⃣ Sorteo con múltiples premios

El número de ganadores depende de los **premios desbloqueados**.

Ejemplo:


5 premios → 5 tickets ganadores


---

# 🧠 Consideraciones de Escalabilidad

- Tickets pre-generados (1–10.000)
- Índices por raffle
- Lock transaccional en reservas
- Sorteo eficiente por SQL

---

# 📦 Agregados del Dominio

Siguiendo **DDD**:

### Aggregate Root principales


User
Raffle
Purchase


Cada uno controla sus entidades internas.

---

# 🔮 Evoluciones Futuras

Posibles extensiones del dominio:

- Sistema de referidos
- Rifas recurrentes
- NFT tickets
- Pagos con crypto