# 🎟 Ticket Allocation Strategy

Este documento describe la estrategia para **reservar y asignar tickets** evitando:

- Race conditions
- Double spending
- Conflictos entre compras simultáneas

El sistema puede manejar **miles de compras concurrentes** sin inconsistencias.

---

# 🎯 Problema

Si dos usuarios intentan comprar el mismo número:


User A → compra ticket 123
User B → compra ticket 123


Ambos podrían verlo disponible si no hay control transaccional.

Esto generaría:

- tickets duplicados
- compras inválidas
- problemas legales en sorteos

Por lo tanto necesitamos **control transaccional fuerte**.

---

# 🧩 Estados del Ticket

El ticket tiene un enum:


AVAILABLE
RESERVED
SOLD


Flujo normal:


AVAILABLE → RESERVED → SOLD


---

# 🔄 Flujo de Compra

1️⃣ Usuario selecciona números


[123, 456, 789]


2️⃣ Backend valida disponibilidad

3️⃣ Se inicia transacción SQL

4️⃣ Se reservan tickets

5️⃣ Se crea purchase

6️⃣ Se inicia pago Flow

7️⃣ Si pago confirmado → tickets pasan a SOLD

---

# 🧱 Reserva de Tickets (Paso Crítico)

Debe ejecutarse dentro de **una transacción**.

### Query

```sql
UPDATE tickets
SET status = 'RESERVED'
WHERE raffle_id = $1
AND number = ANY($2)
AND status = 'AVAILABLE'
RETURNING id, number;

Si el número de filas retornadas no coincide con los tickets solicitados, la operación falla.

🧪 Validación

Ejemplo:

Usuario intenta comprar:

[100, 101, 102]

Pero 101 ya fue reservado.

Resultado:

RETURNING → 2 filas

Entonces:

ROLLBACK

y el backend responde:

409 CONFLICT
🧾 Creación de Purchase

Después de reservar tickets:

BEGIN

UPDATE tickets → RESERVED

INSERT purchase

INSERT payment

COMMIT
⏱ Expiración de Reservas

Si el usuario no paga, los tickets deben liberarse.

Ejemplo:

RESERVED > 15 minutos → AVAILABLE

Query de limpieza:

UPDATE tickets
SET status = 'AVAILABLE',
purchase_id = NULL
WHERE status = 'RESERVED'
AND reserved_at < NOW() - interval '15 minutes';

Esto puede ejecutarse con:

cron job
worker
background task
💰 Confirmación de Pago

Cuando Flow confirma:

tickets.status = SOLD
purchase.status = PAID

Query:

UPDATE tickets
SET status = 'SOLD'
WHERE purchase_id = $1;
❌ Pago fallido

Si el pago falla:

purchase.status = FAILED
tickets → AVAILABLE
🔒 Índices Importantes
CREATE INDEX idx_tickets_raffle_status
ON tickets(raffle_id, status);
CREATE INDEX idx_tickets_purchase
ON tickets(purchase_id);
🧠 Reglas de Consistencia

1️⃣ Un ticket solo puede estar en un estado.

2️⃣ Un ticket SOLD no puede volver a AVAILABLE.

3️⃣ Un ticket RESERVED debe tener purchase_id.

4️⃣ Solo tickets SOLD participan en sorteo.

🚀 Escalabilidad

Este enfoque escala bien porque:

usa operaciones por lote
evita locks largos
PostgreSQL maneja concurrencia

Soporta fácilmente:

10k tickets
1000 compras simultáneas

