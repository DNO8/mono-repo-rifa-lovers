# 💳 Payment Flow — Flow Integration

Este documento describe el flujo completo de pagos usando **Flow**.

---

# 🎯 Objetivo

Garantizar que:

- pagos sean verificables
- tickets solo se asignen tras pago
- no existan compras fraudulentas

---

# 🧩 Flujo Completo


Usuario compra tickets
↓
Backend crea purchase
↓
Backend crea orden Flow
↓
Usuario paga en Flow
↓
Flow envía webhook
↓
Backend valida pago
↓
Tickets pasan a SOLD


---

# 🧾 Paso 1 — Crear Purchase

Endpoint:


POST /purchases


Acciones:


reservar tickets
crear purchase
status = PENDING


---

# 🧾 Paso 2 — Crear pago en Flow

Endpoint:


POST /payments/create


Backend llama API Flow:


/payment/create


Flow devuelve:


token
url


---

# 🧾 Respuesta al frontend

```json
{
  "payment_url": "...",
  "flow_token": "..."
}

Frontend redirige usuario.

💰 Paso 3 — Usuario paga

Flow procesa:

tarjeta
transferencia
etc
📡 Paso 4 — Webhook

Flow llama:

POST /payments/webhook

Payload típico:

flowOrder
status
amount
🔒 Paso 5 — Verificación

Backend debe:

1️⃣ validar firma Flow
2️⃣ consultar API Flow
3️⃣ verificar monto

Ejemplo:

GET /payment/getStatus
🧾 Paso 6 — Actualizar sistema

Si pago es válido:

payment.status = PAID
purchase.status = PAID
tickets.status = SOLD
❌ Si pago falla
payment.status = REJECTED
purchase.status = FAILED
tickets → AVAILABLE
🧠 Idempotencia

El webhook puede llegar más de una vez.

Debemos prevenir doble ejecución.

Solución:

UNIQUE(flow_order)

Antes de procesar:

if payment.status == PAID
  ignore webhook
⏱ Timeout de pago

Si el usuario no paga:

purchase.status → EXPIRED
tickets → AVAILABLE

Esto se maneja con:

cron job
worker
🔒 Seguridad

Validaciones obligatorias:

firma Flow
monto correcto
purchase_id válido
📊 Logs

Guardar siempre:

flow_order
flow_token
payment_status
timestamp

Esto permite auditoría.

🚀 Mejores prácticas

1️⃣ Webhook debe responder rápido

2️⃣ Procesamiento pesado en worker

3️⃣ Nunca confiar solo en frontend

4️⃣ Validar todo con Flow API

