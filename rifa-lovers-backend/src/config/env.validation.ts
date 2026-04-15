import { z } from 'zod'

/**
 * Esquema de validación de variables de entorno
 * Fase 13 - Hardening
 */

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es requerida'),
  
  // Supabase
  SUPABASE_URL: z.string().min(1, 'SUPABASE_URL es requerida'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY es requerida'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'SUPABASE_SERVICE_KEY es requerida'),
  
  // Server
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  BACKEND_URL: z.string().default('http://localhost:3000'),
  
  // Flow Payments
  FLOW_API_KEY: z.string().min(1, 'FLOW_API_KEY es requerida'),
  FLOW_SECRET_KEY: z.string().min(1, 'FLOW_SECRET_KEY es requerida'),
  FLOW_BASE_URL: z.string().default('https://sandbox.flow.cl/api'),
  
  // Email (opcionales para desarrollo)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().default('noreply@rifalovers.com'),
})

export type EnvConfig = z.infer<typeof envSchema>

/**
 * Valida las variables de entorno al iniciar la aplicación
 * Lanza error si faltan variables requeridas
 */
export function validateEnv(): EnvConfig {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(e => `  - ${e.path.join('.')}: ${e.message}`).join('\n')
      throw new Error(`Variables de entorno inválidas:\n${missingVars}`)
    }
    throw error
  }
}
