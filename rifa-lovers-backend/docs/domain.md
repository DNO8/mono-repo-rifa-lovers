# 🧠 Domain Model — RifaLovers

Este documento describe el **modelo de dominio del backend**, basado en el schema Prisma y la base de datos PostgreSQL.

Define las **entidades principales**, sus **atributos**, **relaciones** y **reglas de negocio**.

---

# 🎯 Objetivo del Modelo de Dominio

El sistema permite:

- Crear rifas con metas de packs y premios escalonados por milestones
- Vender packs de participación que generan LuckyPasses (números de rifa)
- Procesar pagos mediante pasarela externa (ej: Flow)
- Ejecutar sorteos entre LuckyPasses activos
- Asignar premios de milestones desbloqueados a LuckyPasses ganadores

---

# 🧩 Entidades del Dominio

---

# 🏢 Organization

Representa una organización que gestiona rifas. Permite escalar el sistema a múltiples organizaciones.

## Atributos

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid | PK |
| name | varchar(200) | Nombre de la organización |
| slug | varchar(200) | Único, para URLs |
| created_at | timestamp | |
| updated_at | timestamp | |

## Relaciones

- Una **Organization** tiene muchos **Users**
- Una **Organization** tiene muchas **Raffles**

---

# 👤 User

Representa a una persona registrada en la plataforma.

## Atributos

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid | PK — viene de Supabase Auth |
| organization_id | uuid | FK opcional |
| email | varchar(255) | Único |
| first_name | varchar(120) | |
| last_name | varchar(120) | |
| phone_number | float | Solo dígitos |
| role | user_role | admin, operator, customer |
| status | user_status | active, blocked |
| created_at | timestamp | |
| updated_at | timestamp | |

> El `id` del User es provisto por Supabase Auth. No se autogenera en Prisma.

## Roles

```
admin     → gestión total del sistema
operator  → gestión operacional (sin configuración crítica)
customer  → usuario comprador
```

## Relaciones

- Un **User** pertenece a una **Organization** (opcional)
- Un **User** tiene muchas **Purchases**
- Un **User** tiene muchos **UserPacks**
- Un **User** tiene muchos **LuckyPasses**
- Un **User** puede tener muchos **PrizeWinners**

---

# 🎲 Raffle

Representa una rifa. En el MVP existe una sola rifa activa a la vez.

## Atributos

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid | PK |
| organization_id | uuid | FK opcional |
| title | varchar(255) | |
| description | text | |
| goal_packs | integer | Meta de packs a vender (default 5000) |
| status | raffle_status | Ver estados |
| start_date | timestamp | |
| end_date | timestamp | Fecha límite de la rifa |
| created_at | timestamp | |
| updated_at | timestamp | |

## Estados (`raffle_status`)

```
draft    → configurándose, no visible para usuarios
active   → vendiendo packs
sold_out → meta de packs alcanzada
closed   → venta cerrada, lista para sorteo
drawn    → sorteo ejecutado
```

## Relaciones

- Una **Raffle** tiene muchos **Packs** (via UserPacks)
- Una **Raffle** tiene muchos **LuckyPasses**
- Una **Raffle** tiene muchos **Milestones**
- Una **Raffle** tiene muchos **Prizes**
- Una **Raffle** tiene un **RaffleProgress**
- Una **Raffle** tiene muchas **Purchases**

---

# 📦 Pack

Representa un pack de participación que el usuario puede comprar. Cada pack genera N LuckyPasses.

## Atributos

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid | PK |
| name | varchar(100) | Ej: "Pack Básico", "Pack x5" |
| price | decimal(10,2) | Precio del pack |
| lucky_pass_quantity | integer | Cuántos LuckyPasses genera |
| is_featured | boolean | Para destacarlo en el frontend |
| is_pre_sale | boolean | Si es de preventa |
| created_at | timestamp | |

## Relaciones

- Un **Pack** puede estar en muchos **UserPacks**

---

# 🧾 Purchase

Representa una orden de compra. Agrupa uno o más UserPacks y se asocia a un pago.

## Atributos

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid | PK |
| raffle_id | uuid | FK |
| user_id | uuid | FK |
| total_amount | decimal(12,2) | Monto total de la compra |
| status | purchase_status | Ver estados |
| created_at | timestamp | |
| paid_at | timestamp | Cuando se confirmó el pago |

## Estados (`purchase_status`)

```
pending  → creada, esperando pago
paid     → pago confirmado, LuckyPasses generados
failed   → pago fallido o expirado
refunded → reembolsada
```

## Relaciones

- Una **Purchase** tiene muchos **UserPacks**
- Una **Purchase** tiene muchas **PaymentTransactions**

---

# 📋 UserPack

Representa el detalle de packs comprados en una Purchase. Intermedio entre Purchase, Pack y LuckyPasses.

## Atributos

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK |
| raffle_id | uuid | FK |
| pack_id | uuid | FK |
| purchase_id | uuid | FK |
| quantity | integer | Cantidad de packs comprados |
| total_paid | decimal(10,2) | Monto pagado por este UserPack |
| created_at | timestamp | |

## Relaciones

- Un **UserPack** genera N **LuckyPasses** (N = `quantity × pack.lucky_pass_quantity`)

---

# 🎟 LuckyPass

Representa un número de participación en la rifa. Se genera automáticamente al confirmar el pago.

## Atributos

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid | PK |
| raffle_id | uuid | FK |
| user_id | uuid | FK |
| user_pack_id | uuid | FK — de qué UserPack proviene |
| ticket_number | integer | Número único dentro de la rifa |
| status | lucky_pass_status | Ver estados |
| is_winner | boolean | true si ganó un premio |
| created_at | timestamp | |

## Estados (`lucky_pass_status`)

```
active    → participando en la rifa
used      → rifa terminada, no ganador
winner    → ganó un premio
cancelled → compra cancelada o fallida
```

## Reglas

- `(raffle_id, ticket_number)` debe ser único
- Solo LuckyPasses con `status = 'active'` participan en el sorteo

## Índices

```
idx_lucky_raffle — lucky_passes(raffle_id)
idx_lucky_user   — lucky_passes(user_id)
```

---

# 🗺 Milestone

Representa una meta de progreso dentro de una rifa. Cuando se alcanza, desbloquea premios.

## Atributos

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid | PK |
| raffle_id | uuid | FK |
| name | varchar(150) | Ej: "Meta 50%", "Meta 100%" |
| required_packs | integer | Packs necesarios para desbloquear |
| sort_order | integer | Orden de visualización |
| is_unlocked | boolean | true cuando packs_sold >= required_packs |
| unlocked_at | timestamp | Cuándo se desbloqueó |
| created_at | timestamp | |

## Regla de desbloqueo

```
raffle_progress.packs_sold >= milestone.required_packs
→ milestone.is_unlocked = true
```

---

# 🏆 Prize

Representa un premio asociado a una rifa. Puede ser de tipo `milestone` (se desbloquea por progreso) o `flash` (especial).

## Atributos

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid | PK |
| raffle_id | uuid | FK |
| milestone_id | uuid | FK opcional (solo para tipo milestone) |
| type | prize_type | milestone o flash |
| name | varchar(255) | Nombre del premio |
| description | text | |
| value_estimated | decimal(12,2) | Valor estimado |
| quantity | integer | Unidades del premio (default 1) |
| created_at | timestamp | |

## Tipos (`prize_type`)

```
milestone → asociado a un milestone, se desbloquea por progreso
flash     → premio especial, no requiere milestone
```

---

# 🥇 PrizeWinner

Registra el resultado del sorteo: qué LuckyPass ganó qué premio.

## Atributos

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid | PK |
| prize_id | uuid | FK |
| lucky_pass_id | uuid | FK — UNIQUE |
| user_id | uuid | FK |
| created_at | timestamp | |

## Reglas

- `UNIQUE(lucky_pass_id)` — un LuckyPass solo puede ganar un premio
- Un premio puede tener máximo 1 ganador por sorteo

---

# 📈 RaffleProgress

Tabla de seguimiento del progreso de una rifa. Se actualiza cada vez que se confirma una compra.

## Atributos

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid | PK |
| raffle_id | uuid | FK — UNIQUE |
| packs_sold | integer | Total de packs vendidos |
| revenue_total | decimal(12,2) | Ingresos totales |
| percentage_to_goal | decimal(5,2) | packs_sold / goal_packs × 100 |
| updated_at | timestamp | |

---

# 💳 PaymentTransaction

Registra una transacción con la pasarela de pago. El `provider` es genérico para soportar múltiples pasarelas.

## Atributos

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid | PK |
| purchase_id | uuid | FK |
| provider | varchar(50) | Ej: "flow", "mercadopago" |
| provider_transaction_id | varchar(255) | ID en la pasarela |
| amount | decimal(12,2) | |
| status | payment_status | Ver estados |
| created_at | timestamp | |

## Estados (`payment_status`)

```
created  → orden creada, esperando pago
pending  → en proceso
approved → pago confirmado
rejected → pago rechazado
```

---

# 🔗 Relaciones Globales

```
Organization
├── Users
└── Raffles
    ├── RaffleProgress
    ├── Milestones
    │   └── Prizes
    ├── Purchases
    │   ├── UserPacks
    │   │   └── LuckyPasses
    │   └── PaymentTransactions
    └── PrizeWinners
        ├── Prize
        └── LuckyPass
```

---

# ⚙️ Reglas de Negocio Clave

### 1️⃣ Solo se puede comprar en rifa activa

```
raffle.status = 'active'
→ si no, retornar 400 RAFFLE_NOT_ACTIVE
```

### 2️⃣ LuckyPasses se generan tras confirmar el pago

```
webhook confirma pago
→ Purchase.status = 'paid'
→ generar N LuckyPasses (N = quantity × pack.lucky_pass_quantity)
```

### 3️⃣ Número único por rifa

```
UNIQUE (raffle_id, ticket_number) en lucky_passes
```

### 4️⃣ Solo LuckyPasses activos participan en el sorteo

```
lucky_pass.status = 'active'
```

### 5️⃣ Un LuckyPass no puede ganar dos premios

```
UNIQUE(lucky_pass_id) en prize_winners
```

### 6️⃣ Solo premios de milestones desbloqueados participan en el sorteo

```
milestone.is_unlocked = true
→ sus prizes participan en el sorteo
```

### 7️⃣ Desbloqueo de milestone

```
raffle_progress.packs_sold >= milestone.required_packs
→ milestone.is_unlocked = true
```

---

# 📦 Agregados del Dominio (DDD)

### Aggregate Roots principales

```
Organization  → gestiona Users y Raffles
Raffle        → gestiona Milestones, Prizes, RaffleProgress
Purchase      → gestiona UserPacks y PaymentTransactions
LuckyPass     → entidad participante en el sorteo
```

---

# 🔮 Evoluciones Futuras

- Múltiples rifas simultáneas por organización
- Sistema de referidos
- Rifas recurrentes
- Notificaciones a ganadores
- Múltiples pasarelas de pago