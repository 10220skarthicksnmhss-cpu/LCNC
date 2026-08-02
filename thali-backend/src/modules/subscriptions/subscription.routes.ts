// src/modules/subscriptions/subscription.routes.ts
import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  subscriptionService,
  CreateSubscriptionSchema,
  UpdateSubscriptionSchema,
} from './subscription.service';
import { ok } from '../../shared/types/api-response';

export async function subscriptionRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  // GET /subscriptions
  fastify.get('/', {
    schema: { tags: ['Subscriptions'], summary: 'List all active and paused subscriptions for current user' },
    handler: async (request, reply) => {
      const data = await subscriptionService.list(request.userId);
      return reply.send(ok(data));
    },
  });

  // POST /subscriptions
  fastify.post('/', {
    schema: {
      tags: ['Subscriptions'],
      summary: 'Create a new meal subscription',
      body: { type: 'object', required: ['mealId', 'deliveryTime'] },
    },
    handler: async (request, reply) => {
      const dto = CreateSubscriptionSchema.parse(request.body);
      const sub = await subscriptionService.create(request.userId, dto);
      return reply.status(201).send(ok(sub, 'Subscription created'));
    },
  });

  // PATCH /subscriptions/:id
  fastify.patch('/:id', {
    schema: {
      tags: ['Subscriptions'],
      summary: 'Update threshold, auto-switch, status (pause/resume)',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      body: { type: 'object' },
    },
    handler: async (request: any, reply) => {
      const dto = UpdateSubscriptionSchema.parse(request.body);
      const sub = await subscriptionService.update(request.userId, request.params.id, dto);
      return reply.send(ok(sub, 'Subscription updated'));
    },
  });

  // DELETE /subscriptions/:id
  fastify.delete('/:id', {
    schema: {
      tags: ['Subscriptions'],
      summary: 'Cancel a subscription',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
    },
    handler: async (request: any, reply) => {
      await subscriptionService.cancel(request.userId, request.params.id);
      return reply.send(ok(null, 'Subscription cancelled'));
    },
  });
}
