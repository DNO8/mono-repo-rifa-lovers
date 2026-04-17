import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    DATABASE_URL: z.ZodString;
    SUPABASE_URL: z.ZodString;
    SUPABASE_ANON_KEY: z.ZodString;
    SUPABASE_SERVICE_KEY: z.ZodString;
    PORT: z.ZodDefault<z.ZodString>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        production: "production";
        test: "test";
        development: "development";
    }>>;
    FRONTEND_URL: z.ZodDefault<z.ZodString>;
    BACKEND_URL: z.ZodDefault<z.ZodString>;
    FLOW_API_KEY: z.ZodString;
    FLOW_SECRET_KEY: z.ZodString;
    FLOW_BASE_URL: z.ZodDefault<z.ZodString>;
    SMTP_HOST: z.ZodOptional<z.ZodString>;
    SMTP_PORT: z.ZodDefault<z.ZodString>;
    SMTP_USER: z.ZodOptional<z.ZodString>;
    SMTP_PASS: z.ZodOptional<z.ZodString>;
    FROM_EMAIL: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export type EnvConfig = z.infer<typeof envSchema>;
export declare function validateEnv(): EnvConfig;
export {};
