# 🧪 Estrategia de Testing - Rifa Lovers

## Flujo Completo a Probar

```
register → login → get raffle active → get packs
→ create purchase → create payment → simulate webhook
→ verify lucky-passes generated → run draw → verify winners
```

---

## 📁 Archivos de Test Creados

### 1. Backend Tests (Jest)

| Archivo | Descripción | Ubicación |
|---------|-------------|-----------|
| `purchases.service.spec.ts` | Test unitario del servicio de compras | `src/modules/purchases/` |
| `draw.service.spec.ts` | Test unitario del servicio de sorteo | `src/modules/draw/` |
| `app.e2e-spec.ts` | Test E2E del flujo completo | `test/app.e2e-spec.ts` |

#### Cobertura de Tests Unitarios:

**PurchasesService:**
- ✅ Crear compra con datos válidos
- ✅ Rechazar si rifa no existe
- ✅ Rechazar si rifa no está activa
- ✅ Rechazar si pack no existe
- ✅ Confirmar pago y actualizar estado
- ✅ Obtener compras del usuario

**DrawService:**
- ✅ Ejecutar sorteo correctamente
- ✅ Validar rifa cerrada antes de sortear
- ✅ Validar que no existan ganadores previos
- ✅ Verificar transaccionalidad del sorteo

#### Tests E2E (`app.e2e-spec.ts`):

**Fase 1: Autenticación**
- ✅ POST /auth/register
- ✅ POST /auth/login
- ✅ GET /auth/me

**Fase 2: Catálogo**
- ✅ GET /raffles/active
- ✅ GET /packs

**Fase 3: Compra y Pago**
- ✅ POST /purchases (crear compra)
- ✅ POST /payments/initiate (iniciar pago Flow)
- ✅ POST /webhooks/flow (simular webhook)
- ✅ GET /purchases/my (verificar pago)

**Fase 4: Lucky Passes**
- ✅ GET /lucky-passes/my
- ✅ GET /lucky-passes/my/summary

**Fase 5: Sorteo**
- ✅ Cerrar rifa y preparar premios
- ✅ POST /admin/raffles/:id/draw
- ✅ GET /raffles/:id/winners

---

### 2. Frontend Tests

| Archivo | Descripción | Tipo |
|---------|-------------|------|
| `endpoints.test.ts` | Verificar estructura de endpoints | Unit |
| `use-draw.test.ts` | Test del hook de sorteo | Unit |

---

### 3. Scripts de Test

| Script | Descripción | Uso |
|--------|-------------|-----|
| `run-e2e-tests.sh` | Ejecuta todos los tests | `./run-e2e-tests.sh [env]` |
| `simulate-flow-webhook.js` | Simula webhook de Flow | `node simulate-flow-webhook.js <purchaseId>` |
| `test-endpoints.js` | Verifica endpoints frontend | `node test-endpoints.js` |

---

## 🚀 Cómo Ejecutar los Tests

### Opción 1: Script Completo (Recomendado)

```bash
cd scripts
./run-e2e-tests.sh local
```

Esto ejecuta:
1. Backend unit tests (PurchasesService, DrawService)
2. Backend E2E tests (flujo completo)
3. Database validation (Prisma)
4. Frontend build check
5. TypeScript type checking

### Opción 2: Tests Individuales

**Backend Unit Tests:**
```bash
cd rifa-lovers-backend
npm test -- purchases.service.spec.ts
npm test -- draw.service.spec.ts
```

**Backend E2E Tests:**
```bash
cd rifa-lovers-backend
npm run test:e2e
```

**Simular Webhook de Flow:**
```bash
cd scripts
node simulate-flow-webhook.js <purchase-id> http://localhost:3000
```

---

## 📊 Verificación de Base de Datos

### Queries de Verificación Manual

```sql
-- Verificar compras de test
SELECT * FROM purchases WHERE id LIKE '%test%';

-- Verificar lucky passes generados
SELECT * FROM lucky_passes WHERE raffle_id = 'test-raffle-id';

-- Verificar transacciones de pago
SELECT * FROM payment_transactions WHERE status = 'approved';

-- Verificar ganadores del sorteo
SELECT * FROM prize_winners WHERE raffle_id = 'test-raffle-id';
```

---

## 🔧 Variables de Entorno Requeridas

```bash
# Backend
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
FLOW_API_KEY="flow-api-key"
FLOW_SECRET_KEY="flow-secret"
FLOW_COMMERCE_ID="flow-commerce"

# Frontend
VITE_API_URL="http://localhost:3000"
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@nestjs/testing'"
```bash
cd rifa-lovers-backend
npm install
```

### Error: "Database connection failed"
- Verificar que PostgreSQL está corriendo
- Verificar DATABASE_URL en .env
- Ejecutar `npx prisma migrate dev`

### Error: "Webhook signature invalid"
- Verificar FLOW_SECRET_KEY
- El script `simulate-flow-webhook.js` genera firma automáticamente

---

## 📈 Resultados Esperados

### Test Suite Completo (~2-3 min)

```
✅ PurchasesService tests (5 tests)
✅ DrawService tests (4 tests)
✅ End-to-End API tests (15 tests)
✅ Prisma schema validation
✅ Frontend build
✅ TypeScript type checking

Total: 24+ tests passed
```

---

## 🎯 Checklist Pre-Producción

- [ ] Todos los tests unitarios pasan
- [ ] Tests E2E pasan en local
- [ ] Tests E2E pasan en staging
- [ ] Webhook de Flow procesa correctamente
- [ ] Lucky passes se generan después del pago
- [ ] Sorteo se ejecuta sin errores
- [ ] Winners se registran correctamente
- [ ] Frontend build sin errores
- [ ] Typescript sin errores
