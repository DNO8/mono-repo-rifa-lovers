# 🌐 API Specification — RifaLovers

Especificación de la API REST del backend.

Base URL:


/api/v1


---

# 🔐 Auth

---

## POST /auth/register

Registrar usuario.

### Request

```json
{
  "email": "user@email.com",
  "password": "123456"
}
Response
{
  "user_id": "uuid",
  "token": "jwt"
}
POST /auth/login

Login de usuario.

Request
{
  "email": "user@email.com",
  "password": "123456"
}
Response
{
  "token": "jwt"
}
👤 Users
GET /users/me

Obtiene el perfil del usuario autenticado.

Response
{
  "id": "uuid",
  "email": "user@email.com",
  "created_at": "timestamp"
}
🎲 Raffles
GET /raffles

Lista rifas activas.

Response
[
  {
    "id": "uuid",
    "title": "Macbook Raffle",
    "ticket_price": 5000,
    "total_tickets": 10000,
    "sold_tickets": 3250,
    "status": "ACTIVE",
    "draw_date": "timestamp"
  }
]
GET /raffles/:id

Obtiene detalle de una rifa.

Response
{
  "id": "uuid",
  "title": "Macbook Raffle",
  "description": "...",
  "ticket_price": 5000,
  "total_tickets": 10000,
  "sold_tickets": 3250,
  "status": "ACTIVE",
  "draw_date": "timestamp"
}
GET /raffles/:id/prizes

Lista premios de la rifa.

Response
[
  {
    "id": "uuid",
    "name": "Macbook",
    "position": 1,
    "unlocked_at_tickets": 8000
  }
]
🎟 Tickets
GET /raffles/:id/tickets

Obtiene estado de tickets.

Query
?status=AVAILABLE
Response
[
  {
    "id": "uuid",
    "number": 345,
    "status": "AVAILABLE"
  }
]
🧾 Purchases
POST /purchases

Crear orden de compra.

Request
{
  "raffle_id": "uuid",
  "ticket_numbers": [123,456,789]
}
Response
{
  "purchase_id": "uuid",
  "status": "PENDING",
  "total_amount": 15000
}
GET /purchases/:id

Detalle de compra.

Response
{
  "id": "uuid",
  "raffle_id": "uuid",
  "status": "PAID",
  "total_amount": 15000,
  "tickets": [123,456,789]
}
💳 Payments
POST /payments/create

Crea orden en Flow.

Request
{
  "purchase_id": "uuid"
}
Response
{
  "flow_token": "string",
  "payment_url": "https://flow.cl/payment"
}
POST /payments/webhook

Webhook de Flow.

Request
{
  "flowOrder": "123456",
  "status": "PAID"
}
Acción
1 validar firma
2 actualizar payment
3 actualizar purchase
4 asignar tickets
🏆 Winners
GET /raffles/:id/winners

Obtiene ganadores de una rifa.

Response
[
  {
    "ticket_number": 345,
    "prize": "Macbook"
  }
]
🎲 Sorteo (Admin)
POST /raffles/:id/draw

Ejecuta sorteo.

Response
{
  "winners": [
    {
      "ticket_number": 345,
      "prize": "Macbook"
    }
  ]
}
📊 KPIs
GET /admin/kpis
Response
{
  "total_sales": 15000000,
  "tickets_sold": 4500,
  "active_users": 230,
  "raffles_active": 2
}
⚠️ Códigos de Error
Código	Significado
400	Bad Request
401	Unauthorized
404	Not Found
409	Conflict
500	Server Error
🔒 Seguridad
JWT obligatorio
Rate limiting
Validación DTO
Webhook verification
🚀 Versionado
/api/v1

Futuro:

/api/v2
