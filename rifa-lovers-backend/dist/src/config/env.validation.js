"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = validateEnv;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL es requerida'),
    SUPABASE_URL: zod_1.z.string().min(1, 'SUPABASE_URL es requerida'),
    SUPABASE_ANON_KEY: zod_1.z.string().min(1, 'SUPABASE_ANON_KEY es requerida'),
    SUPABASE_SERVICE_KEY: zod_1.z.string().min(1, 'SUPABASE_SERVICE_KEY es requerida'),
    PORT: zod_1.z.string().default('3000'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    FRONTEND_URL: zod_1.z.string().default('http://localhost:5173'),
    BACKEND_URL: zod_1.z.string().default('http://localhost:3000'),
    FLOW_API_KEY: zod_1.z.string().min(1, 'FLOW_API_KEY es requerida'),
    FLOW_SECRET_KEY: zod_1.z.string().min(1, 'FLOW_SECRET_KEY es requerida'),
    FLOW_BASE_URL: zod_1.z.string().default('https://sandbox.flow.cl/api'),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().default('587'),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    FROM_EMAIL: zod_1.z.string().default('noreply@rifalovers.com'),
});
function validateEnv() {
    try {
        return envSchema.parse(process.env);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const missingVars = error.issues.map(e => `  - ${e.path.join('.')}: ${e.message}`).join('\n');
            throw new Error(`Variables de entorno inválidas:\n${missingVars}`);
        }
        throw error;
    }
}
//# sourceMappingURL=env.validation.js.map