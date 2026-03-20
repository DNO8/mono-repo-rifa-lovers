# 🎨 Frontend — RifaLovers

Aplicación web del cliente para compra de tickets y visualización de rifas.

---

## 🧠 Responsabilidad

- UI/UX del usuario
- Flujo de compra
- Visualización de rifa
- Dashboard básico
- Integración con backend

---

## ⚙️ Stack

- Next.js
- React
- TypeScript
- TailwindCSS (recomendado)
- Axios / Fetch API

---

## 📁 Estructura

/src
  /components
  /pages
  /services
  /hooks
  /context
  /styles

---

## 🔌 Integraciones

- API Backend (NestJS)
- Flow (redirect URL)
- Email triggers (backend-driven)

---

## 🧩 Módulos

### 1. Landing Rifa
- Información del premio
- Progreso
- CTA compra

### 2. Compra de Tickets
- Selección de cantidad
- Confirmación
- Redirección a pago

### 3. Confirmación
- Estado del pago
- Tickets asignados

### 4. Dashboard Usuario (opcional MVP)
- Historial de compras

---

## 🔄 Flujo de Compra

1. Usuario selecciona tickets
2. Front llama API `/purchase`
3. Backend genera orden Flow
4. Redirección a Flow
5. Retorno a frontend
6. Validación estado

---
