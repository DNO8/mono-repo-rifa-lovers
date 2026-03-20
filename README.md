# 🎯 RifaLovers MVP Platform

Plataforma digital para gestión de rifas online con venta de tickets, integración de pagos y ejecución automática de sorteos.

## 🧠 Objetivo

Validar el modelo de negocio de rifas digitales mediante un MVP funcional que permita:

- Crear y operar una rifa activa
- Vender tickets numerados (1–10.000)
- Procesar pagos online (Flow)
- Ejecutar sorteos automáticos
- Obtener métricas de negocio iniciales

---

## 🏗️ Arquitectura

Frontend (NextJS / React)
        ↓
Backend API (NestJS)
        ↓
PostgreSQL Database
        ↓
Integraciones externas (Flow / Email)

---

## ⚙️ Stack Tecnológico

| Capa        | Tecnología       |
|------------|-----------------|
| Frontend   | Next.js / React |
| Backend    | NestJS          |
| DB         | PostgreSQL      |
| Pagos      | Flow            |
| Infra      | Cloud (Vercel / AWS / VPS) |

---

## 🧩 Módulos Principales

- Gestión de usuarios
- Gestión de rifas
- Venta de tickets
- Procesamiento de pagos
- Dashboard KPI
- Panel administrador
- Sistema de sorteos
- Email automation
- Base de referidos y descuentos (preparado)

---

## 🧱 Modelo de Datos (Resumen)

- Users
- Raffles
- Tickets
- Purchases
- Payment_Transactions
- Prizes / Prize_Tiers
- Raffle_Progress
- Email_Logs

---

## 🔄 Flujo Principal

1. Usuario se registra
2. Selecciona tickets
3. Genera pago (Flow)
4. Confirmación vía webhook
5. Asignación de tickets
6. Notificación por email
7. Participa en sorteo

---

## 🚀 Roadmap MVP

- Semana 1 → Arquitectura + DB
- Semana 2 → Backend + compra
- Semana 3 → Dashboard + lógica rifa
- Semana 4 → Testing + producción

---

## 🔐 Consideraciones

- Sistema preparado para multi-rifa (no activo en MVP)
- Escalabilidad horizontal futura
- Integración desacoplada con pagos

---

## 📊 KPIs Iniciales

- Tickets vendidos
- Ingresos
- Conversión
- Usuarios registrados
- Avance de rifa

---

## 📦 Entregables

- Código fuente completo
- Infraestructura configurada
- Documentación técnica
