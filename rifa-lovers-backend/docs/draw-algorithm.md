# 🎲 Draw Algorithm

Define cómo ejecutar el sorteo de forma:

- justa
- verificable
- reproducible
- eficiente

---

# 🎯 Reglas del Sorteo

1️⃣ Solo participan LuckyPasses:


status = 'active'


2️⃣ Solo premios de milestones desbloqueados participan.


raffle_progress.packs_sold >= milestone.required_packs
→ milestone.is_unlocked = true


3️⃣ Cada premio tiene **1 ganador**.

4️⃣ Un ticket solo puede ganar **1 premio**.

---

# 🧩 Ejemplo

Premios:

| Premio | required_packs (milestone) |
|--------|---------------------------|
| Macbook | 5000 |
| iPhone | 3000 |
| Giftcard | 1000 |

Packs vendidos:


3500


Milestones desbloqueados:


Giftcard (1000 ≤ 3500) → ✅
iPhone (3000 ≤ 3500) → ✅
Macbook (5000 > 3500) → ❌


Premios activos en el sorteo:


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

# 🧱 Paso 1 — Obtener premios desbloqueados

```sql
SELECT p.*
FROM prizes p
JOIN milestones m ON p.milestone_id = m.id
WHERE m.raffle_id = $1
  AND m.is_unlocked = true
ORDER BY m.sort_order;
```

Para premios de tipo `flash` (sin milestone):

```sql
SELECT * FROM prizes
WHERE raffle_id = $1 AND type = 'flash';
```

# 🧱 Paso 2 — Obtener LuckyPasses válidos

```sql
SELECT id, ticket_number, user_id
FROM lucky_passes
WHERE raffle_id = $1
  AND status = 'active';
```

# 🧠 Selección aleatoria

Por cada premio, seleccionar un LuckyPass ganador:

```sql
SELECT id, user_id
FROM lucky_passes
WHERE raffle_id = $1
  AND status = 'active'
  AND id NOT IN (SELECT lucky_pass_id FROM prize_winners WHERE prize_id IS NOT NULL)
ORDER BY random()
LIMIT 1;
```

Alternativa más eficiente para rifas grandes:

```sql
SELECT id, user_id
FROM lucky_passes
WHERE raffle_id = $1 AND status = 'active'
OFFSET floor(random() * (SELECT COUNT(*) FROM lucky_passes WHERE raffle_id = $1 AND status = 'active'))
LIMIT 1;
```

# � Paso 3 — Registrar ganadores

```sql
INSERT INTO prize_winners (prize_id, lucky_pass_id, user_id)
VALUES ($prize_id, $lucky_pass_id, $user_id);

UPDATE lucky_passes
SET status = 'winner', is_winner = true
WHERE id = $lucky_pass_id;
```

Ejemplo completo:

```
prize:iPhone → lucky_pass:4521 (user:abc)
prize:Giftcard → lucky_pass:1203 (user:xyz)
```

# 🔒 Prevención de duplicados

Constraint existente en la base de datos:

```sql
UNIQUE(lucky_pass_id) en prize_winners
```

Esto garantiza: un LuckyPass no puede ganar dos premios.

# 📊 Auditoría

La tabla `prize_winners` sirve como registro de auditoría:

```
created_at  → timestamp del sorteo
raffle_id   → via lucky_pass.raffle_id
lucky_pass_id → número ganador
prize_id    → premio asignado
user_id     → ganador
```

# 🚀 Post-sorteo

Una vez registrados todos los ganadores:

```sql
UPDATE raffles
SET status = 'drawn'
WHERE id = $1;
```

# � Índices disponibles

Ya definidos en `prisma/schema.prisma`:

```sql
idx_lucky_raffle — lucky_passes(raffle_id)
idx_lucky_user   — lucky_passes(user_id)
```

# 🧠 Mejoras futuras

Para máxima transparencia:

RNG verificable
hash público del sorteo
seed basado en block hash

---
