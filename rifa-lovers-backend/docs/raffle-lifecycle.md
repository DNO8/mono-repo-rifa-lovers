# 🎲 Raffle Lifecycle

Este documento describe el **ciclo de vida de una rifa** basado estrictamente en el campo:


raffles.status


Tipo:


raffle_status (ENUM)


Estados definidos en el modelo de datos:


DRAFT
ACTIVE
SOLD_OUT
CLOSED
DRAWN


El backend debe respetar estas transiciones para mantener consistencia en el sistema.

---

# 🧩 Estados de una Rifa

| Estado | Descripción |
|------|------|
| DRAFT | La rifa está configurándose pero aún no está publicada |
| ACTIVE | La rifa está vendiendo tickets |
| SOLD_OUT | Todos los tickets fueron vendidos |
| CLOSED | La venta terminó y la rifa está lista para el sorteo |
| DRAWN | El sorteo fue ejecutado y los ganadores fueron registrados |

---

# 🔄 Diagrama del Ciclo de Vida


DRAFT
│
▼
ACTIVE
│
├─────────────► SOLD_OUT
│ │
▼ ▼
CLOSED
│
▼
DRAWN


---

# 🧾 Estado: DRAFT

La rifa existe pero aún **no está publicada**.


status = DRAFT


### Permitido

- editar rifa
- agregar premios
- generar tickets

### No permitido

- comprar tickets
- reservar tickets
- ejecutar sorteo

---

# 🧾 Estado: ACTIVE

La rifa está abierta para compras.


status = ACTIVE


### Permitido

- comprar tickets
- reservar tickets
- crear purchases
- crear pagos

### Validación Backend

Al crear purchase:


raffle.status = ACTIVE


Si no:


400 RAFFLE_NOT_ACTIVE


---

# 🧾 Estado: SOLD_OUT

Todos los tickets fueron vendidos.


sold_tickets = total_tickets


Entonces:


status → SOLD_OUT


### Permitido

- consultar tickets
- consultar compras
- ejecutar sorteo posteriormente

### No permitido

- comprar tickets
- reservar tickets

Este estado permite **cerrar ventas automáticamente cuando no quedan tickets**.

---

# 🧾 Estado: CLOSED

La rifa dejó de aceptar ventas.

Esto puede ocurrir cuando:


draw_date <= NOW()


o cuando un administrador la cierra manualmente.


status = CLOSED


### Permitido

- ejecutar sorteo
- consultar datos

### No permitido

- comprar tickets

---

# 🧾 Estado: DRAWN

El sorteo ya fue ejecutado.


status = DRAWN


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

## Compra solo en ACTIVE

Al crear purchase:


raffle.status = ACTIVE


---

## Transición automática a SOLD_OUT

Cuando:


sold_tickets >= total_tickets


Entonces:


status → SOLD_OUT


---

## Cierre de rifa

Una rifa puede pasar a:


ACTIVE → CLOSED
SOLD_OUT → CLOSED


Esto ocurre cuando:

- llega la fecha del sorteo
- el administrador cierra la rifa

---

## Sorteo

El endpoint:


POST /raffles/:id/draw


solo puede ejecutarse si:


status = CLOSED


---

## Después del sorteo

Una vez generado el resultado:


status → DRAWN


---

# 🧠 Transiciones Permitidas

| From | To |
|----|----|
DRAFT | ACTIVE
ACTIVE | SOLD_OUT
ACTIVE | CLOSED
SOLD_OUT | CLOSED
CLOSED | DRAWN

---

# ❌ Transiciones Prohibidas

| From | To |
|----|----|
ACTIVE | DRAFT
SOLD_OUT | ACTIVE
DRAWN | ACTIVE
DRAWN | CLOSED

---

# 🧾 Ejemplo de Flujo

Caso 1 — rifa normal


DRAFT
→ ACTIVE
→ CLOSED
→ DRAWN


Caso 2 — tickets agotados


DRAFT
→ ACTIVE
→ SOLD_OUT
→ CLOSED
→ DRAWN


---

# ⚙ Automatizaciones recomendadas

### Auto SOLD_OUT

Cuando se venden todos los tickets:

```sql
UPDATE raffles
SET status = 'SOLD_OUT'
WHERE sold_tickets >= total_tickets
AND status = 'ACTIVE';
Auto CLOSED por fecha
UPDATE raffles
SET status = 'CLOSED'
WHERE status IN ('ACTIVE','SOLD_OUT')
AND draw_date <= NOW();
🔒 Consistencia del sistema

El estado DRAWN garantiza:

los winners ya fueron generados

Esto evita:

sorteos duplicados
modificación posterior de resultados

