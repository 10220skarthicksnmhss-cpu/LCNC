// src/modules/users/user.repository.ts
import { prisma } from '../../config/db';
import type { AutoSwitchPref, DietaryType } from '@prisma/client';

export interface UpdatePreferencesDto {
  cuisines?:       string[];
  dietaryType?:    DietaryType;
  dailyBudget?:    number;
  alertThreshold?: number;
  autoSwitchPref?: AutoSwitchPref;
  notifPush?:      boolean;
  notifSms?:       boolean;
  notifEmail?:     boolean;
  notifWhatsapp?:  boolean;
}

export const userRepository = {
  async findById(userId: string) {
    return prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true, name: true, email: true, phone: true, avatarUrl: true, isVerified: true, createdAt: true,
        preferences: true,
        addresses: { where: { isDefault: true }, take: 1 },
        paymentMethods: { where: { isDefault: true }, take: 1, select: { id: true, maskedNumber: true, cardBrand: true, provider: true } },
      },
    });
  },

  async updateProfile(userId: string, data: { name?: string; phone?: string; avatarUrl?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
    });
  },

  async upsertPreferences(userId: string, data: UpdatePreferencesDto) {
    return prisma.userPreferences.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  },

  async getPreferences(userId: string) {
    return prisma.userPreferences.findUnique({ where: { userId } });
  },

  async softDelete(userId: string) {
    return prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date() } });
  },
};
