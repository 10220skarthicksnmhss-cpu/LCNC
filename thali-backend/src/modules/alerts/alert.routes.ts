// src/modules/alerts/alert.routes.ts
import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middleware/auth.middleware';
import { alertService } from './alert.service';
import { ok } from '../../shared/types/api-response';
import { z } from 'zod';

const RespondSchema = z.object({
  action:         z.enum(['keep', 'ai_swap', 'pick_other']),
  selectedMealId: z.string().uuid().optional(),
});

export async function alertRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  // GET /alerts/active
  fastify.get('/active', {
    schema: { tags: ['Alerts'], summary: 'Get all active price alerts for current user (with AI suggestions and time remaining)' },
    handler: async (request, reply) => {
      const data = await alertService.getActiveAlerts(request.userId);
      return reply.send(ok(data));
    },
  });

  // POST /alerts/:id/respond
  fastify.post('/:id/respond', {
    schema: {
      tags: ['Alerts'],
      summary: 'Respond to a price alert (keep / ai_swap / pick_other)',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      body: {
        type: 'object',
        required: ['action'],
        properties: {
          action:         { type: 'string', enum: ['keep', 'ai_swap', 'pick_other'] },
          selectedMealId: { type: 'string' },
        },
      },
    },
    handler: async (request: any, reply) => {
      const dto = RespondSchema.parse(request.body);
      const result = await alertService.respond(
        request.userId,
        request.params.id,
        dto.action,
        dto.selectedMealId,
      );
      return reply.send(ok(result, 'Response recorded and order confirmed'));
    },
  });
}
