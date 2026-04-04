# 🎲 Draw Algorithm

Define cómo ejecutar el sorteo de forma:

- justa
- verificable
- reproducible
- eficiente

---

# 🎯 Reglas del Sorteo

1️⃣ Solo participan tickets:


status = SOLD


2️⃣ Solo premios desbloqueados participan.


sold_tickets >= unlocked_at_tickets


3️⃣ Cada premio tiene **1 ganador**.

4️⃣ Un ticket solo puede ganar **1 premio**.

---

# 🧩 Ejemplo

Premios:

| premio | unlocked_at |
|------|------|
Macbook | 8000
iPhone | 6000
Giftcard | 3000

Tickets vendidos:


6500


Premios activos:


iPhone
Giftcard


Total ganadores:


2


---

# ⚙️ Estrategia

El sorteo debe:

1️⃣ Obtener premios desbloqueados  
2️⃣ Obtener tickets vendidos  
3️⃣ Elegir tickets aleatorios  
4️⃣ Insertar winners

---

# 🧱 Paso 1 — Obtener premios

```sql
SELECT *
FROM prizes
WHERE raffle_id = $1
AND unlocked_at_tickets <= (
  SELECT sold_tickets
  FROM raffles
  WHERE id = $1
)
ORDER BY position;
🧱 Paso 2 — Obtener tickets válidos
SELECT id, number
FROM tickets
WHERE raffle_id = $1
AND status = 'SOLD';
🧠 Selección aleatoria

PostgreSQL permite:

ORDER BY random()

Ejemplo:

SELECT id
FROM tickets
WHERE raffle_id = $1
AND status = 'SOLD'
ORDER BY random()
LIMIT $prize_count;
🧾 Paso 3 — Insertar ganadores

Ejemplo:

INSERT INTO winners (raffle_id, ticket_id, prize_id)
VALUES ($1, $ticket_id, $prize_id);
🧩 Alternativa más eficiente (recomendada)

Para rifas grandes:

10.000 tickets

mejor usar:

OFFSET random()

Ejemplo:

SELECT id
FROM tickets
WHERE raffle_id = $1
AND status = 'SOLD'
OFFSET floor(random() * $sold_tickets)
LIMIT 1;
🔒 Prevención de duplicados

Constraint:

UNIQUE(ticket_id)

Esto asegura:

un ticket no gana dos premios
🧾 Inserción final

Ejemplo completo:

prize1 → ticket123
prize2 → ticket455
prize3 → ticket788
📊 Auditoría

Guardar:

draw_timestamp
raffle_id
ticket_id
prize_id

Esto permite:

verificar sorteos
mostrar transparencia
🚀 Optimización

Índice recomendado:

CREATE INDEX idx_tickets_raffle_sold
ON tickets(raffle_id)
WHERE status = 'SOLD';
🧠 Mejoras futuras

Para máxima transparencia:

RNG verificable
hash público del sorteo
seed basado en block hash

---
