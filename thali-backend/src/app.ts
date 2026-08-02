// src/app.ts — Fastify application factory
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from './config/env';
import { errorHandler } from './shared/errors/error-handler';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/users/user.routes';
import { mealRoutes } from './modules/meals/meal.routes';
import { ingredientRoutes } from './modules/ingredients/ingredient.routes';
import { subscriptionRoutes } from './modules/subscriptions/subscription.routes';
import { alertRoutes } from './modules/alerts/alert.routes';
import { orderRoutes } from './modules/orders/order.routes';
import { homeRoutes } from './modules/home/home.routes';
import { startCronScheduler } from './schedulers/cron.scheduler';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'warn' : 'info',
      ...(env.NODE_ENV === 'development' && {
        transport: { target: 'pino-pretty', options: { colorize: true } },
      }),
    },
    trustProxy: true,
  });

  // ── Plugins ─────────────────────────────────────────────────────────
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  await app.register(helmet, { contentSecurityPolicy: false });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      success: false,
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please slow down.',
    }),
  });

  await app.register(swagger, {
    openapi: {
      info: { title: 'Thali API', description: 'Smart AI-Powered Food Subscription Platform', version: '1.0.0' },
      servers: [{ url: env.API_BASE_URL }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
  });

  // ── Routes ───────────────────────────────────────────────────────────
  await app.register(authRoutes,         { prefix: '/v1/auth' });
  await app.register(userRoutes,         { prefix: '/v1/users' });
  await app.register(mealRoutes,         { prefix: '/v1/meals' });
  await app.register(subscriptionRoutes, { prefix: '/v1/subscriptions' });
  await app.register(alertRoutes,        { prefix: '/v1/alerts' });
  await app.register(orderRoutes,        { prefix: '/v1/orders' });
  await app.register(homeRoutes,         { prefix: '/v1/home' });
  await app.register(ingredientRoutes,   { prefix: '/internal/ingredients' });

  // ── Start cron scheduler ─────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'test') {
    startCronScheduler();
  }

  // ── Error handler ────────────────────────────────────────────────────
  app.setErrorHandler(errorHandler);

  // ── Health check ─────────────────────────────────────────────────────
  app.get('/health', { schema: { hide: true } }, async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  }));

  return app;
}
