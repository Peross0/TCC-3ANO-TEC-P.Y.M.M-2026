import { z } from 'zod';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const toBackendPath = (value) => (value ? path.isAbsolute(value) ? value : path.resolve(backendRoot, value) : value);

const DEVELOPMENT_JWT_SECRET = 'dev-secret-key-for-local-environment-12345';

const envSchema = z.object({
  // Server
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 caracteres').default(DEVELOPMENT_JWT_SECRET),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Database
  DATABASE_PATH: z.string().default('./data/conectafacil.db').transform(toBackendPath),

  // Upload
  UPLOAD_DIR: z.string().default('./uploads/avatars').transform(toBackendPath),
  MAX_AVATAR_MB: z.coerce.number().int().positive().default(2),
  DOCUMENT_UPLOAD_DIR: z.string().default('./uploads/documents').transform(toBackendPath),
  MAX_DOCUMENT_MB: z.coerce.number().int().positive().default(25),
}).superRefine((values, ctx) => {
  if (values.NODE_ENV === 'production' && values.JWT_SECRET === DEVELOPMENT_JWT_SECRET) {
    ctx.addIssue({
      code: 'custom',
      path: ['JWT_SECRET'],
      message: 'JWT_SECRET deve ser configurado explicitamente em produção',
    });
  }
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variáveis de ambiente inválidas:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;