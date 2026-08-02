// src/modules/users/user.service.ts
import { userRepository } from './user.repository';
import { AppError } from '../../shared/errors/AppError';
import { AutoSwitchPref, DietaryType } from '@prisma/client';
import type { PatchMeDto } from './user.schema';

const dietaryMap: Record<string, DietaryType> = {
  veg: DietaryType.VEG, 'non-veg': DietaryType.NON_VEG, vegan: DietaryType.VEGAN,
};
const autoSwitchMap: Record<string, AutoSwitchPref> = {
  always_ask: AutoSwitchPref.ALWAYS_ASK,
  ai_auto_switch: AutoSwitchPref.AI_AUTO_SWITCH,
  keep_original: AutoSwitchPref.KEEP_ORIGINAL,
};

export class UserService {
  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound('User');

    const prefs = user.preferences;
    return {
      id:         user.id,
      name:       user.name,
      email:      user.email,
      phone:      user.phone,
      avatarUrl:  user.avatarUrl,
      isVerified: user.isVerified,
      createdAt:  user.createdAt,
      preferences: prefs ? {
        cuisines:       prefs.cuisines,
        dietary:        prefs.dietaryType.toLowerCase().replace('_', '-'),
        dailyBudget:    prefs.dailyBudget,
        alertThreshold: prefs.alertThreshold,
        autoSwitchPref: prefs.autoSwitchPref.toLowerCase(),
        notifications: {
          push:      prefs.notifPush,
          sms:       prefs.notifSms,
          email:     prefs.notifEmail,
          whatsapp:  prefs.notifWhatsapp,
        },
      } : null,
      defaultAddress: user.addresses[0] ?? null,
      defaultPayment: user.paymentMethods[0] ?? null,
    };
  }

  async patchMe(userId: string, dto: PatchMeDto) {
    const profileUpdate: { name?: string; phone?: string } = {};
    if (dto.name)  profileUpdate.name  = dto.name;
    if (dto.phone) profileUpdate.phone = dto.phone;

    if (Object.keys(profileUpdate).length > 0) {
      await userRepository.updateProfile(userId, profileUpdate);
    }

    if (dto.preferences) {
      const p = dto.preferences;
      await userRepository.upsertPreferences(userId, {
        ...(p.cuisines       && { cuisines:       p.cuisines }),
        ...(p.dietary        && { dietaryType:    dietaryMap[p.dietary] }),
        ...(p.dailyBudget    && { dailyBudget:    p.dailyBudget }),
        ...(p.alertThreshold && { alertThreshold: p.alertThreshold }),
        ...(p.autoSwitchPref && { autoSwitchPref: autoSwitchMap[p.autoSwitchPref] }),
        ...(p.notifications?.push     !== undefined && { notifPush:     p.notifications.push }),
        ...(p.notifications?.sms      !== undefined && { notifSms:      p.notifications.sms }),
        ...(p.notifications?.email    !== undefined && { notifEmail:    p.notifications.email }),
        ...(p.notifications?.whatsapp !== undefined && { notifWhatsapp: p.notifications.whatsapp }),
      });
    }

    return this.getMe(userId);
  }
}

export const userService = new UserService();
