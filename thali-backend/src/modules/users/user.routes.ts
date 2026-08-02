// src/modules/users/user.routes.ts
import type { FastifyInstance } from 'fastify';
import { userController } from './user.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

export async function userRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  // GET /users/me
  fastify.get('/me', {
    schema: { tags: ['Users'], summary: 'Get current user profile with preferences' },
    handler: userController.getMe.bind(userController),
  });

  // PATCH /users/me
  fastify.patch('/me', {
    schema: {
      tags: ['Users'],
      summary: 'Update user profile and/or preferences',
      body: { type: 'object' },
    },
    handler: userController.patchMe.bind(userController),
  });
}
