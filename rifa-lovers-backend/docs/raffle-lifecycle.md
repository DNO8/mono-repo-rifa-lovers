# 🎲 Raffle Lifecycle

Este documento describe el **ciclo de vida de una rifa** basado estrictamente en el campo:


raffles.status


Tipo:


raffle_status (ENUM)


Estados definidos en el modelo de datos (valores en minúsculas en la BD):


draft
active
sold_out
closed
drawn


El backend debe respetar estas transiciones para mantener consistencia en el sistema.

---

# 🧩 Estados de una Rifa

| Estado | Descripción |
|--------|-------------|
| `draft` | La rifa está configurándose pero aún no está publicada |
| `active` | La rifa está vendiendo packs |
| `sold_out` | La meta de packs fue alcanzada (`packs_sold >= goal_packs`) |
| `closed` | La venta terminó y la rifa está lista para el sorteo |
| `drawn` | El sorteo fue ejecutado y los ganadores fueron registrados |

---

# 🔄 Diagrama del Ciclo de Vida


draft
│
▼
active
│
├─────────────► sold_out
│               │
▼               ▼
closed  ◄───────┘
│
▼
drawn


---

# 🧾 Estado: `draft`

La rifa existe pero aún **no está publicada**.


status = 'draft'


### Permitido

- editar rifa
- agregar premios y milestones
- configurar packs

### No permitido

- comprar packs
- ejecutar sorteo

---

# 🧾 Estado: `active`

La rifa está abierta para compras de packs.


status = 'active'


### Permitido

- comprar packs
- crear purchases
- generar LuckyPasses (tras pago)

### Validación Backend

Al crear purchase:


raffle.status = 'active'


Si no:


400 RAFFLE_NOT_ACTIVE


---

# 🧾 Estado: `sold_out`

La meta de packs fue alcanzada.


raffle_progress.packs_sold >= raffle.goal_packs


Entonces:


status → 'sold_out'


### Permitido

- consultar packs y LuckyPasses
- consultar compras
- transitar a `closed`

### No permitido

- comprar packs

Este estado permite **cerrar ventas automáticamente cuando se alcanza la meta de packs**.

---

# 🧾 Estado: `closed`

La rifa dejó de aceptar ventas. Está lista para el sorteo.

Esto puede ocurrir cuando:


raffle.end_date <= NOW()


o cuando un administrador la cierra manualmente.


status = 'closed'


### Permitido

- ejecutar sorteo (`POST /admin/raffles/:id/draw`)
- consultar datos

### No permitido

- comprar packs

---

# 🧾 Estado: `drawn`

El sorteo ya fue ejecutado.


status = 'drawn'


Esto significa:

- los ganadores fueron generados
- los premios fueron asignados

### Permitido

- consultar ganadores
- consultar tickets
- consultar premios

### No permitido

- ejecutar sorteo nuevamente
- modificar tickets
- modificar premios

---

# 🎯 Reglas del Backend

---

## Compra solo en `active`

Al crear purchase:


raffle.status = 'active'


---

## Transición automática a `sold_out`

Cuando se actualiza `raffle_progress` al confirmar un pago:


raffle_progress.packs_sold >= raffle.goal_packs


Entonces:


raffle.status → 'sold_out'


---

## Cierre de rifa

Una rifa puede pasar a:


active → closed
sold_out → closed


Esto ocurre cuando:

- llega la fecha del sorteo
- el administrador cierra la rifa

---

## Sorteo

El endpoint:


POST /admin/raffles/:id/draw


solo puede ejecutarse si:


status = 'closed'


---

## Después del sorteo

Una vez registrados todos los `prize_winners`:


status → 'drawn'


---

# 🧠 Transiciones Permitidas

| Desde | Hacia |
|-------|-------|
`draft` | `active`
`active` | `sold_out`
`active` | `closed`
`sold_out` | `closed`
`closed` | `drawn`

---

# ❌ Transiciones Prohibidas

| Desde | Hacia |
|-------|-------|
`active` | `draft`
`sold_out` | `active`
`drawn` | `active`
`drawn` | `closed`

---

# 🧾 Ejemplo de Flujo

Caso 1 — rifa normal


draft → active → closed → drawn


Caso 2 — meta de packs alcanzada


draft → active → sold_out → closed → drawn


---

# ⚙ Automatizaciones recomendadas

### Auto `sold_out`

Cuando `raffle_progress` se actualiza al confirmar un pago:

```sql
UPDATE raffles r
SET status = 'sold_out'
FROM raffle_progress rp
WHERE r.id = rp.raffle_id
  AND rp.packs_sold >= r.goal_packs
  AND r.status = 'active';
```

### Auto `closed` por fecha

```sql
UPDATE raffles
SET status = 'closed'
WHERE status IN ('active', 'sold_out')
  AND end_date <= NOW();
🔒 Consistencia del sistema

El estado `drawn` garantiza:

los `prize_winners` ya fueron generados

Esto evita:

sorteos duplicados
modificación posterior de resultados

