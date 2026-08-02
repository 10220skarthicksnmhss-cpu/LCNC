// src/modules/ingredients/ingredient.routes.ts
import type { FastifyInstance } from 'fastify';
import { ingredientService } from './ingredient.service';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/AppError';
import { ok } from '../../shared/types/api-response';
import { z } from 'zod';

export async function ingredientRoutes(fastify: FastifyInstance) {
  // Internal API — secured by API key, not JWT
  const apiKeyGuard = async (request: any, _reply: any) => {
    const key = request.headers['x-api-key'];
    if (key !== env.INTERNAL_API_KEY) throw AppError.forbidden('Invalid API key');
  };

  // GET /internal/ingredients — list all
  fastify.get('/', {
    schema: { tags: ['Internal'], summary: 'List all ingredients with current prices', hide: false },
    preHandler: apiKeyGuard,
    handler: async (_req, reply) => {
      const data = await ingredientService.listIngredients();
      return reply.send(ok(data));
    },
  });

  // POST /internal/ingredients/update-prices
  fastify.post('/update-prices', {
    schema: {
      tags: ['Internal'],
      summary: 'Bulk update ingredient prices (triggers meal recalculation)',
      body: {
        type: 'array',
        items: {
          type: 'object',
          required: ['ingredientId', 'pricePerUnit'],
          properties: {
            ingredientId: { type: 'string' },
            pricePerUnit: { type: 'number' },
            source:       { type: 'string' },
          },
        },
      },
    },
    preHandler: apiKeyGuard,
    handler: async (request: any, reply) => {
      const updates = z.array(z.object({
        ingredientId: z.string(),
        pricePerUnit: z.number().positive(),
        source: z.string().optional(),
      })).parse(request.body);

      const result = await ingredientService.bulkUpdatePrices(updates);
      return reply.send(ok(result, 'Prices updated and meals recalculated'));
    },
  });

  // GET /internal/ingredients/:id/history
  fastify.get('/:id/history', {
    schema: {
      tags: ['Internal'],
      summary: 'Get ingredient price history',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      querystring: { type: 'object', properties: { days: { type: 'number', default: 30 } } },
    },
    preHandler: apiKeyGuard,
    handler: async (request: any, reply) => {
      const history = await ingredientService.getPriceHistory(request.params.id, request.query.days);
      return reply.send(ok(history));
    },
  });
}
