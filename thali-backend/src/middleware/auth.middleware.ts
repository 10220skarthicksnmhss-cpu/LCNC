// src/middleware/auth.middleware.ts
import type { FastifyRequest, FastifyReply } from 'fastify';
import { tokenService } from '../modules/auth/token.service';
import { prisma } from '../config/db';
import { AppError } from '../shared/errors/AppError';

declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
    userEmail: string;
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw AppError.unauthorized('Missing authorization header');
  }

  const token = authHeader.split(' ')[1];
  const payload = tokenService.verifyAccessToken(token);

  // Ensure user is not deleted
  const user = await prisma.user.findFirst({
    where: { id: payload.sub, deletedAt: null },
    select: { id: true, email: true },
  });
  if (!user) throw AppError.unauthorized('Account not found or deactivated');

  request.userId    = user.id;
  request.userEmail = user.email;
}
