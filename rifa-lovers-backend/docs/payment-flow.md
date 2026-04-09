# 💳 Payment Flow

Este documento describe el flujo completo de pagos del sistema RifaLovers.

La pasarela de pago es **genérica** (ej: Flow, MercadoPago, u otra). El sistema abstrae el proveedor en la tabla `payment_transactions` con el campo `provider`.

---

# 🎯 Objetivo

Garantizar que:

- pagos sean verificables e idempotentes
- LuckyPasses solo se generen tras pago confirmado
- no existan compras fraudulentas ni duplicadas

---

# 🧩 Flujo Completo


Usuario compra packs
↓
Backend crea Purchase (pending) + UserPack
↓
Backend crea PaymentTransaction + orden en pasarela
↓
Usuario paga en la pasarela
↓
Pasarela envía webhook
↓
Backend valida pago
↓
LuckyPasses generados
↓
raffle_progress actualizado


---

# 🧾 Paso 1 — Crear Purchase

Endpoint:


POST /purchases


Request:
```json
{
  "raffleId": "uuid",
  "packId": "uuid",
  "quantity": 2
}
```

Acciones dentro de transacción Prisma:


Validar raffle.status = 'active'
Crear Purchase (status: 'pending')
Crear UserPack (userId + raffleId + packId + quantity)


---

# 🧾 Paso 2 — Crear orden de pago

Endpoint:


POST /payments/create


Backend llama API de la pasarela y crea:


PaymentTransaction (status: 'created')
provider = 'flow' (o el que corresponda)
provider_transaction_id = ID de la pasarela


Pasarela devuelve:


URL de pago
ID de transacción


---

# 🧾 Respuesta al frontend

```json
{
  "paymentUrl": "https://flow.cl/payment/xxx",
  "providerTransactionId": "string"
}

Frontend redirige usuario.

💰 Paso 3 — Usuario paga

El usuario es redirigido a la URL de la pasarela y realiza el pago.

📡 Paso 4 — Webhook

La pasarela notifica al backend:

```
POST /payments/webhook
```

Payload típico (ejemplo con Flow):

```
provider_transaction_id
status
amount
```

🔒 Paso 5 — Verificación

Backend debe:

```
1️⃣ Verificar idempotencia:
   if PaymentTransaction.status == 'approved' → ignorar

2️⃣ Validar firma del proveedor

3️⃣ Consultar estado en API del proveedor

4️⃣ Verificar monto coincide con purchase.total_amount
```

🧾 Paso 6 — Actualizar sistema

Si pago aprobado:

```
PaymentTransaction.status → 'approved'
Purchase.status → 'paid', paidAt = NOW()
Generar N LuckyPasses por UserPack
Actualizar raffle_progress:
  packs_sold += userPack.quantity
  revenue_total += purchase.totalAmount
  percentage_to_goal = packs_sold / raffle.goalPacks × 100
```

❌ Si pago rechazado:

```
PaymentTransaction.status → 'rejected'
Purchase.status → 'failed'
```

No se generan LuckyPasses. No hay que liberar nada.
🧠 Idempotencia

El webhook puede llegar más de una vez.

Debemos prevenir doble ejecución.

Solución:

```
UNIQUE(provider_transaction_id) en payment_transactions
```

Antes de procesar:

```
if PaymentTransaction.status == 'approved'
  ignorar webhook
```
⏱ Timeout de pago

Si el usuario no paga en 30 minutos:

```
Purchase.status → 'failed'
```

No hay LuckyPasses que revertir. Esto se maneja con un cron job.

Consultar `draw-algorithm.md` para el flujo post-pago del sorteo.
🔒 Seguridad

Validaciones obligatorias:

```
firma del proveedor (HMAC o header de verificación)
monto coincide con purchase.total_amount
purchase_id válido y en estado 'pending'
provider_transaction_id no duplicado
```

📊 Auditoría

La tabla `payment_transactions` guarda:

```
provider            → 'flow' / 'mercadopago' / etc.
provider_transaction_id → ID de la pasarela
amount              → monto cobrado
status              → estado de la transacción
created_at          → timestamp
```

Esto permite auditar cada transacción.

🚀 Mejores prácticas

1️⃣ Webhook debe responder rápido

2️⃣ Procesamiento pesado en worker

3️⃣ Nunca confiar solo en frontend

4️⃣ Validar todo con Flow API

