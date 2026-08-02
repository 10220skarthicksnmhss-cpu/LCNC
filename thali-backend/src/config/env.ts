// src/config/env.ts — Zod-validated environment variables
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV:               z.enum(['development', 'production', 'test']).default('development'),
  PORT:                   z.coerce.number().default(3000),
  HOST:                   z.string().default('0.0.0.0'),
  API_BASE_URL:           z.string().url().default('http://localhost:3000'),

  DATABASE_URL:           z.string().min(1),
  REDIS_URL:              z.string().min(1).default('redis://localhost:6379'),

  JWT_SECRET:             z.string().min(32),
  JWT_REFRESH_SECRET:     z.string().min(32),
  JWT_ACCESS_EXPIRES_IN:  z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  BCRYPT_ROUNDS:          z.coerce.number().default(12),
  CORS_ORIGIN:            z.string().default('http://localhost:5173'),

  FIREBASE_PROJECT_ID:    z.string().optional(),
  FIREBASE_PRIVATE_KEY:   z.string().optional(),
  FIREBASE_CLIENT_EMAIL:  z.string().email().optional(),

  TWILIO_ACCOUNT_SID:     z.string().optional(),
  TWILIO_AUTH_TOKEN:      z.string().optional(),
  TWILIO_FROM_NUMBER:     z.string().optional(),

  SMTP_HOST:              z.string().default('smtp.gmail.com'),
  SMTP_PORT:              z.coerce.number().default(587),
  SMTP_USER:              z.string().optional(),
  SMTP_PASS:              z.string().optional(),
  SMTP_FROM:              z.string().default('noreply@thali.app'),

  INTERNAL_API_KEY:       z.string().min(16),

  PLATFORM_COMMISSION_PCT: z.coerce.number().default(5),
  GST_PCT:                 z.coerce.number().default(5),
  PACKAGING_COST:          z.coerce.number().default(8),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
