#!/bin/bash

# Script para ejecutar todos los tests E2E del flujo completo
# Uso: ./run-e2e-tests.sh [environment]
# environment: local | staging | production (default: local)

set -e

ENV=${1:-local}
echo "🧪 Ejecutando tests E2E en entorno: $ENV"
echo "================================================"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir resultados
print_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ PASSED${NC}: $2"
  else
    echo -e "${RED}❌ FAILED${NC}: $2"
  fi
}

# Verificar variables de entorno
echo ""
echo "🔍 Verificando configuración..."

if [ -z "$DATABASE_URL" ]; then
  echo -e "${YELLOW}⚠️  WARNING${NC}: DATABASE_URL no configurada"
fi

if [ -z "$JWT_SECRET" ]; then
  echo -e "${YELLOW}⚠️  WARNING${NC}: JWT_SECRET no configurada"
fi

# Test 1: Backend Unit Tests
echo ""
echo "📦 Test 1: Backend Unit Tests (Jest)"
echo "-----------------------------------"
cd ../rifa-lovers-backend

npm test -- --testPathPattern="purchases.service.spec.ts" --verbose 2>&1 | tee /tmp/test1.log
TEST1_STATUS=${PIPESTATUS[0]}
print_result $TEST1_STATUS "PurchasesService tests"

npm test -- --testPathPattern="draw.service.spec.ts" --verbose 2>&1 | tee /tmp/test2.log
TEST2_STATUS=${PIPESTATUS[0]}
print_result $TEST2_STATUS "DrawService tests"

# Test 2: Backend E2E Tests
echo ""
echo "🌐 Test 2: Backend E2E Tests"
echo "-----------------------------------"
npm run test:e2e 2>&1 | tee /tmp/test3.log
TEST3_STATUS=${PIPESTATUS[0]}
print_result $TEST3_STATUS "End-to-End API tests"

# Test 3: Database Integrity Check
echo ""
echo "🗄️  Test 3: Database Integrity Check"
echo "-----------------------------------"
npx prisma validate 2>&1 | tee /tmp/test4.log
TEST4_STATUS=${PIPESTATUS[0]}
print_result $TEST4_STATUS "Prisma schema validation"

# Test 4: Frontend Build Check
echo ""
echo "⚛️  Test 4: Frontend Build Check"
echo "-----------------------------------"
cd ../rifa-lovers-frontend

npm run build 2>&1 | tee /tmp/test5.log
TEST5_STATUS=${PIPESTATUS[0]}
print_result $TEST5_STATUS "Frontend production build"

# Test 5: Type Checking
echo ""
echo "🔤 Test 5: TypeScript Type Checking"
echo "-----------------------------------"
npx tsc --noEmit 2>&1 | tee /tmp/test6.log
TEST6_STATUS=${PIPESTATUS[0]}
print_result $TEST6_STATUS "TypeScript type checking"

cd ../scripts

# Resumen
echo ""
echo "================================================"
echo "📊 RESUMEN DE TESTS"
echo "================================================"

TOTAL_TESTS=6
PASSED_TESTS=0

[ $TEST1_STATUS -eq 0 ] && ((PASSED_TESTS++))
[ $TEST2_STATUS -eq 0 ] && ((PASSED_TESTS++))
[ $TEST3_STATUS -eq 0 ] && ((PASSED_TESTS++))
[ $TEST4_STATUS -eq 0 ] && ((PASSED_TESTS++))
[ $TEST5_STATUS -eq 0 ] && ((PASSED_TESTS++))
[ $TEST6_STATUS -eq 0 ] && ((PASSED_TESTS++))

echo "Tests exitosos: $PASSED_TESTS / $TOTAL_TESTS"
echo ""

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
  echo -e "${GREEN}🎉 TODOS LOS TESTS PASARON${NC}"
  exit 0
else
  echo -e "${RED}⚠️  ALGUNOS TESTS FALLARON${NC}"
  echo "Revisa los logs en /tmp/test*.log"
  exit 1
fi
