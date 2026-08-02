// src/modules/auth/token.service.ts
import { createHmac, randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/db';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/AppError';

export interface AccessTokenPayload {
  sub: string;   // userId
  email: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;   // unique token id
}

export class TokenService {
  /** Sign a short-lived access token */
  signAccessToken(userId: string, email: string): string {
    return jwt.sign(
      { sub: userId, email } satisfies AccessTokenPayload,
      env.JWT_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
    );
  }

  /** Verify an access token and return its payload */
  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
    } catch {
      throw AppError.unauthorized('Invalid or expired access token');
    }
  }

  /** Generate a refresh token, store its hash in DB, and return the raw token */
  async createRefreshToken(userId: string): Promise<string> {
    const rawToken = randomBytes(48).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt  = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return rawToken;
  }

  /** Rotate refresh token: revoke old, issue new */
  async rotateRefreshToken(rawToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = this.hashToken(rawToken);

    const stored = await prisma.refreshToken.findFirst({
      where: { tokenHash, revoked: false },
      include: { user: { select: { id: true, email: true, deletedAt: true } } },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw AppError.unauthorized('Refresh token invalid or expired');
    }
    if (stored.revoked) {
      // Token reuse detected — revoke all tokens for this user
      await prisma.refreshToken.updateMany({ where: { userId: stored.userId }, data: { revoked: true } });
      throw AppError.unauthorized('Token reuse detected. Please log in again.');
    }
    if (stored.user.deletedAt) {
      throw AppError.unauthorized('Account is deactivated');
    }

    // Revoke the used token
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

    // Issue new pair
    const accessToken = this.signAccessToken(stored.userId, stored.user.email);
    const refreshToken = await this.createRefreshToken(stored.userId);

    return { accessToken, refreshToken };
  }

  /** Revoke a specific refresh token (logout) */
  async revokeRefreshToken(rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    await prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revoked: true } });
  }

  private hashToken(token: string): string {
    return createHmac('sha256', env.JWT_REFRESH_SECRET).update(token).digest('hex');
  }
}

export const tokenService = new TokenService();
