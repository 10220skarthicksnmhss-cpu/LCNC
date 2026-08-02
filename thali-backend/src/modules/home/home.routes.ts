// src/modules/home/home.routes.ts
import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middleware/auth.middleware';
import { homeService } from './home.service';
import { ok } from '../../shared/types/api-response';

export async function homeRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', {
    schema: {
      tags: ['Home'],
      summary: 'Single API call for Home screen — greeting, today orders, active alert, stats, recommendations',
    },
    handler: async (request, reply) => {
      const data = await homeService.getDashboard(request.userId);
      return reply.send(ok(data));
    },
  });
}
