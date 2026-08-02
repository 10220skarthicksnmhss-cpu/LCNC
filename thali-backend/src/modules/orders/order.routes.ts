// src/modules/orders/order.routes.ts
import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middleware/auth.middleware';
import { orderService } from './order.service';
import { ok } from '../../shared/types/api-response';

export async function orderRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', {
    schema: {
      tags: ['Orders'],
      summary: 'Get order history with monthly stats and decision trails',
      querystring: {
        type: 'object',
        properties: {
          period: { type: 'string', enum: ['week', 'month', 'custom'], default: 'month' },
          from:   { type: 'string' },
          to:     { type: 'string' },
          page:   { type: 'number', default: 1 },
          limit:  { type: 'number', default: 20 },
        },
      },
    },
    handler: async (request: any, reply) => {
      const result = await orderService.getHistory(request.userId, request.query);
      return reply.send(result);
    },
  });

  fastify.get('/:id', {
    schema: {
      tags: ['Orders'],
      summary: 'Get a single order with status history',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
    },
    handler: async (request: any, reply) => {
      const order = await orderService.getOrderById(request.userId, request.params.id);
      return reply.send(ok(order));
    },
  });
}
