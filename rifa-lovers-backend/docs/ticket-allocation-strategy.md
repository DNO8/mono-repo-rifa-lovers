# � LuckyPass Allocation Strategy

Este documento describe la estrategia para **generar y asignar LuckyPasses** evitando:

- Race conditions
- Duplicados de `ticket_number`
- Conflictos entre compras simultáneas

El sistema puede manejar **múltiples compras concurrentes** sin inconsistencias.

---

# 🎯 Concepto clave

En RifaLovers **no existen tickets pre-generados** ni selección manual de números.

El flujo es:

```
Usuario compra un Pack
↓
Se crea un UserPack
↓
Al confirmar pago, se generan N LuckyPasses automáticamente
(N = pack.lucky_pass_quantity × userPack.quantity)
↓
Cada LuckyPass recibe un ticket_number único dentro de la rifa
```

No hay concepto de "reservar un número". Los números se asignan al confirmar el pago.

---

# 🧩 Estados del LuckyPass

```
active    → participando en la rifa
used      → rifa terminada, no ganó
winner    → ganó un premio
cancelled → compra cancelada o fallida
```

No hay estado RESERVED ni AVAILABLE.

---

# 🔄 Flujo Completo de Compra

### 1️⃣ Usuario envía solicitud de compra

```json
POST /purchases
{
  "raffleId": "uuid",
  "packId": "uuid",
  "quantity": 2
}
```

### 2️⃣ Backend valida rifa activa

```
raffle.status = 'active' ?
  → continuar
  → si no, 400 RAFFLE_NOT_ACTIVE
```

### 3️⃣ Transacción: crear Purchase + UserPack

```typescript
await prisma.$transaction(async (tx) => {
  const purchase = await tx.purchase.create({
    data: { userId, raffleId, totalAmount, status: 'pending' }
  })
  await tx.userPack.create({
    data: { userId, raffleId, packId, purchaseId: purchase.id, quantity }
  })
  return purchase
})
```

### 4️⃣ Crear orden de pago

```
POST /payments/create { purchaseId }
→ PaymentTransaction.status = 'created'
→ Retorna URL de pago al usuario
```

### 5️⃣ Usuario paga en la pasarela

### 6️⃣ Webhook confirma el pago

```
POST /payments/webhook
→ Validar firma
→ PaymentTransaction.status → 'approved'
→ Purchase.status → 'paid', paidAt = NOW()
→ Generar LuckyPasses
→ Actualizar raffle_progress
```

---

# 🎫 Generación de LuckyPasses (Paso Crítico)

Una vez confirmado el pago, se generan los LuckyPasses:

```typescript
const N = userPack.quantity * pack.luckyPassQuantity

await prisma.$transaction(async (tx) => {
  for (let i = 0; i < N; i++) {
    const ticketNumber = await getNextTicketNumber(tx, raffleId)
    await tx.luckyPass.create({
      data: {
        raffleId,
        userId,
        userPackId: userPack.id,
        ticketNumber,
        status: 'active',
        isWinner: false,
      }
    })
  }
})
```

### Asignación de `ticket_number`

Opciones válidas:

**Opción A — Auto-incremental por rifa:**

```sql
SELECT COALESCE(MAX(ticket_number), 0) + 1
FROM lucky_passes
WHERE raffle_id = $1;
```

**Opción B — Número aleatorio sin repetir:**

Generar un número aleatorio y verificar unicidad vía constraint.

En ambos casos, el constraint `UNIQUE(raffle_id, ticket_number)` en la tabla `lucky_passes` previene duplicados a nivel de base de datos.

---

# ⏱ Expiración de Purchases no pagadas

Si el usuario no completa el pago en 30 minutos:

```sql
UPDATE purchases
SET status = 'failed'
WHERE status = 'pending'
  AND created_at < NOW() - INTERVAL '30 minutes';
```

Esto se ejecuta con un cron job. No hay LuckyPasses que liberar porque se generan **después** del pago.

---

# ❌ Pago fallido

Si el webhook reporta rechazo:

```
PaymentTransaction.status → 'rejected'
Purchase.status → 'failed'
```

No se generan LuckyPasses. No hay que revertir nada porque aún no se crearon.

---

# 🔒 Índices Importantes

```sql
CREATE INDEX idx_lucky_raffle ON lucky_passes(raffle_id);
CREATE INDEX idx_lucky_user ON lucky_passes(user_id);
```

Ambos ya están definidos en `prisma/schema.prisma`.

---

# 🧠 Reglas de Consistencia

1️⃣ Los LuckyPasses se generan **únicamente** tras pago confirmado.

2️⃣ `(raffle_id, ticket_number)` debe ser único.

3️⃣ Un LuckyPass `winner` no puede volver a `active`.

4️⃣ Solo LuckyPasses con `status = 'active'` participan en el sorteo.

5️⃣ La generación de LuckyPasses debe ejecutarse dentro de una transacción Prisma.

---

# 🚀 Escalabilidad

Este enfoque escala bien porque:

- No pre-genera miles de tickets al crear una rifa
- Solo crea los LuckyPasses necesarios al confirmar cada compra
- PostgreSQL maneja concurrencia a nivel de constraint
- Transacciones Prisma garantizan consistencia

Soporta fácilmente:

```
5000 packs × N lucky_pass_quantity
→ generación incremental y eficiente
```

