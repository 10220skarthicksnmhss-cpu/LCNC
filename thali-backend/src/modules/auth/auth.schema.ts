// src/modules/auth/auth.schema.ts
import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s\-]{10,15}$/).optional(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  preferences: z
    .object({
      cuisines:      z.array(z.string()).min(1).default(['Indian']),
      dietary:       z.enum(['veg', 'non-veg', 'vegan']).default('veg'),
      budget:        z.number().int().min(80).max(400).default(150),
      threshold:     z.number().int().min(5).max(50).default(20),
      autoSwitch:    z.boolean().default(true),
    })
    .optional(),
});

export const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const LogoutSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto    = z.infer<typeof LoginSchema>;
export type RefreshDto  = z.infer<typeof RefreshSchema>;
export type LogoutDto   = z.infer<typeof LogoutSchema>;
