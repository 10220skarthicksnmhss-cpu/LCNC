// src/modules/users/user.schema.ts
import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  name:      z.string().min(2).max(100).optional(),
  phone:     z.string().regex(/^\+?[\d\s\-]{10,15}$/).optional(),
  avatarUrl: z.string().url().optional(),
});

export const UpdatePreferencesSchema = z.object({
  cuisines:       z.array(z.string()).min(1).optional(),
  dietary:        z.enum(['veg', 'non-veg', 'vegan']).optional(),
  dailyBudget:    z.number().int().min(80).max(400).optional(),
  alertThreshold: z.number().int().min(5).max(50).optional(),
  autoSwitchPref: z.enum(['always_ask', 'ai_auto_switch', 'keep_original']).optional(),
  notifications:  z.object({
    push:      z.boolean().optional(),
    sms:       z.boolean().optional(),
    email:     z.boolean().optional(),
    whatsapp:  z.boolean().optional(),
  }).optional(),
});

export const PatchMeSchema = z.object({
  name:        z.string().min(2).max(100).optional(),
  phone:       z.string().optional(),
  preferences: UpdatePreferencesSchema.optional(),
});

export type UpdateProfileDto     = z.infer<typeof UpdateProfileSchema>;
export type UpdatePreferencesDto = z.infer<typeof UpdatePreferencesSchema>;
export type PatchMeDto           = z.infer<typeof PatchMeSchema>;
