// src/modules/auth/auth.service.ts
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/db';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/AppError';
import { tokenService } from './token.service';
import type { RegisterDto, LoginDto } from './auth.schema';
import { AutoSwitchPref, DietaryType } from '@prisma/client';

const dietaryMap: Record<string, DietaryType> = {
  'veg': DietaryType.VEG,
  'non-veg': DietaryType.NON_VEG,
  'vegan': DietaryType.VEGAN,
};

const autoSwitchMap: Record<string, AutoSwitchPref> = {
  true:  AutoSwitchPref.AI_AUTO_SWITCH,
  false: AutoSwitchPref.ALWAYS_ASK,
};

export class AuthService {
  async register(dto: RegisterDto) {
    // Uniqueness check
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, ...(dto.phone ? [{ phone: dto.phone }] : [])] },
    });
    if (existing) {
      throw AppError.conflict('An account with this email or phone already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, env.BCRYPT_ROUNDS);
    const prefs = dto.preferences;

    const user = await prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        preferences: {
          create: {
            cuisines:      prefs?.cuisines ?? ['Indian'],
            dietaryType:   dietaryMap[prefs?.dietary ?? 'veg'],
            dailyBudget:   prefs?.budget ?? 150,
            alertThreshold: prefs?.threshold ?? 20,
            autoSwitchPref: prefs?.autoSwitch !== false
              ? AutoSwitchPref.AI_AUTO_SWITCH
              : AutoSwitchPref.ALWAYS_ASK,
          },
        },
      },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    });

    const accessToken  = tokenService.signAccessToken(user.id, user.email);
    const refreshToken = await tokenService.createRefreshToken(user.id);

    return { user, accessToken, refreshToken };
  }

  async login(dto: LoginDto) {
    const user = await prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
      select: { id: true, name: true, email: true, phone: true, passwordHash: true },
    });

    if (!user) throw AppError.unauthorized('Invalid email or password');

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) throw AppError.unauthorized('Invalid email or password');

    const { passwordHash: _, ...safeUser } = user;

    const accessToken  = tokenService.signAccessToken(user.id, user.email);
    const refreshToken = await tokenService.createRefreshToken(user.id);

    return { user: safeUser, accessToken, refreshToken };
  }

  async refresh(rawToken: string) {
    return tokenService.rotateRefreshToken(rawToken);
  }

  async logout(rawToken: string) {
    await tokenService.revokeRefreshToken(rawToken);
  }
}

export const authService = new AuthService();
