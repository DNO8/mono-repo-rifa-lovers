# ⚙️ Backend — RifaLovers API

API REST que gestiona la lógica de negocio, transacciones, rifas y pagos.

---

## 🧠 Responsabilidad

- Lógica de negocio
- Gestión de usuarios
- Procesamiento de pagos
- Asignación de tickets
- Ejecución de sorteos
- KPIs y reporting

---

## ⚙️ Stack

- NestJS
- TypeScript
- PostgreSQL
- TypeORM / Prisma
- JWT Auth
- Webhooks (Flow)

---

## 📁 Estructura

/src
  /modules
    /users
    /raffles
    /tickets
    /purchases
    /payments
  /common
  /config
  /database

---

## 🧩 Módulos

### Users
- Registro
- Login

### Raffles
- Crear rifa
- Configuración premios

### Tickets
- Generación (1–10.000)
- Bloqueo

### Purchases
- Compra
- Relación usuario-tickets

### Payments
- Integración Flow
- Webhooks

---

## 🔄 Flujo de Compra

1. POST `/purchase`
2. Genera orden
3. Llama Flow
4. Guarda transacción
5. Webhook confirma pago
6. Asigna tickets
7. Envía email

---

## 💳 Integración Flow

- Generación de orden
- Confirmación vía webhook
- Validación de firma

---

## 🎲 Lógica de Sorteo

- Selección aleatoria
- Validación 1 premio por usuario
- Distribución premios escalonados

---

## 📊 KPIs

- Total ventas
- Tickets vendidos
- % avance
- Usuarios

---

## 🔐 Seguridad

- JWT Auth
- Validación inputs
- Control de concurrencia en tickets
- Logs de transacciones
