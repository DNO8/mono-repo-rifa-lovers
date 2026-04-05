# 🔐 Módulo de Autenticación - RifaLovers Backend

## Resumen

Sistema de autenticación implementado con **Supabase Auth** + NestJS + Passport.

## Características de Seguridad

- **Supabase Auth**: Autenticación gestionada por Supabase (menos código, más seguridad)
- **JWT Tokens**: Access tokens y refresh tokens gestionados por Supabase
- **Validación de inputs**: class-validator con sanitización
- **Protección de rutas**: Guards para autenticación y roles
- **CORS configurado**: Para comunicación segura con frontend

## Estructura de Archivos

```
src/
├── config/
│   ├── supabase.service.ts
│   ├── supabase.module.ts
│   └── index.ts
├── modules/users/
│   ├── dto/
│   │   ├── index.ts
│   │   ├── register.dto.ts
│   │   ├── login.dto.ts
│   │   ├── update-user.dto.ts
│   │   ├── auth-response.dto.ts
│   │   └── jwt-payload.dto.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── guards/
│   │   └── roles.guard.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   └── users.module.ts
└── common/decorators/
    ├── index.ts
    ├── roles.decorator.ts
    └── current-user.decorator.ts
```

## Endpoints API

### Autenticación

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Registro de nuevo usuario | No requerida |
| POST | `/auth/login` | Inicio de sesión | No requerida |
| POST | `/auth/refresh` | Refrescar access token | No requerida |

### Usuarios

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/users/me` | Obtener perfil del usuario actual | JWT |
| PATCH | `/users/me` | Actualizar perfil del usuario actual | JWT |
| GET | `/users` | Listar usuarios | admin, operator |
| GET | `/users/:id` | Obtener usuario por ID | admin, operator |

## Uso de Decoradores

### Proteger rutas con JWT
```typescript
@UseGuards(AuthGuard('jwt'))
@Get('protected')
getProtectedResource() { }
```

### Proteger rutas por roles
```typescript
@UseGuards(AuthGuard('jwt'), new RolesGuard([UserRole.admin]))
@Get('admin-only')
getAdminResource() { }
```

### Obtener usuario actual
```typescript
@Get('me')
getMe(@CurrentUser() user: User) {
  return user;
}
```

## Configuración de Supabase

1. **Crear proyecto en Supabase**: https://supabase.com

2. **Obtener credenciales**:
   - Project URL (`SUPABASE_URL`)
   - Anon Key (`SUPABASE_ANON_KEY`)
   - Service Role Key (`SUPABASE_SERVICE_KEY`)

3. **Configurar variables de entorno**:
```bash
cp .env.example .env
# Editar .env con tus credenciales de Supabase
```

## Instalación

```bash
# Instalar dependencias
pnpm install

# Generar cliente Prisma
npx prisma generate

# Crear migración de la base de datos
npx prisma migrate dev

# Iniciar servidor
pnpm start:dev
```

## Variables de Entorno Requeridas

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/rifalovers"

# Supabase Auth (REQUERIDO)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Server
PORT=3000
FRONTEND_URL=http://localhost:3001
```

## Modelo de Datos (User)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único (de Supabase Auth) |
| email | String | Email único del usuario |
| firstName | String | Nombre |
| lastName | String | Apellido |
| role | Enum | admin, operator, customer |
| status | Enum | active, blocked |
| organizationId | UUID | Organización (opcional) |

**Nota**: El campo `password` no existe en nuestra base de datos. Supabase Auth gestiona las contraseñas de forma segura.

## Flujo de Autenticación

### Registro
1. Cliente envía email/password a `/auth/register`
2. Backend crea usuario en Supabase Auth
3. Backend crea usuario en nuestra DB con el ID de Supabase
4. Retorna tokens de Supabase

### Login
1. Cliente envía email/password a `/auth/login`
2. Backend autentica con Supabase Auth
3. Backend verifica usuario en nuestra DB
4. Retorna tokens de Supabase

### Acceso a rutas protegidas
1. Cliente envía Bearer token en header
2. Backend valida token con Supabase Auth API
3. Backend verifica usuario en nuestra DB
4. Retorna recurso si todo es válido

## Seguridad Implementada

1. **Contraseñas**: Gestión delegada a Supabase Auth (hash seguro, salt, políticas de seguridad)

2. **Tokens**: JWT firmados por Supabase con expiración configurable

3. **Validación**: DTOs con class-validator

4. **Autorización**: Roles: admin, operator, customer

5. **RLS**: Row Level Security en Supabase para protección adicional

## Diferencias con Auth Propia

| Aspecto | JWT Propia | Supabase Auth |
|---------|------------|---------------|
| Seguridad | Tú la implementas | Expertos de Supabase |
| Password reset | Implementar manual | Incluido |
| Email verification | Implementar manual | Incluido |
| OAuth providers | Implementar manual | Incluido (Google, GitHub, etc.) |
| 2FA/MFA | Implementar manual | Disponible |
| Audit logs | Implementar manual | Incluido |

## Troubleshooting

### Error: "Cannot find module 'passport-custom'"
```bash
pnpm install passport-custom
```

### Error: "Invalid Supabase credentials"
Verificar que las variables de entorno `SUPABASE_URL` y `SUPABASE_SERVICE_KEY` estén correctamente configuradas.

### Error: "User not found in database"
El usuario fue creado en Supabase Auth pero no en nuestra base de datos. Verificar la creación sincronizada en `auth.service.ts`.
