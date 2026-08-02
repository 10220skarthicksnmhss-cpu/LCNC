// src/main.ts — Application entry point
import { buildApp } from './app';
import { env } from './config/env';
import { prisma } from './config/db';
import { redis } from './config/redis';

async function bootstrap() {
  const app = await buildApp();

  // Verify DB connection
  await prisma.$connect();
  app.log.info('[DB] PostgreSQL 18 connected');

  // Redis is used for queues/caching — optional for core API
  try {
    await redis.connect();
    app.log.info('[Redis] Connected');
  } catch {
    app.log.warn('[Redis] Not available — BullMQ queues and caching disabled. Install Redis to enable them.');
  }

  await app.listen({ port: env.PORT, host: env.HOST });
  app.log.info(`🚀 Thali API running at http://${env.HOST}:${env.PORT}`);
  app.log.info(`📚 API Docs at http://${env.HOST}:${env.PORT}/docs`);
}

const shutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
};

process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

bootstrap().catch(err => {
  console.error('❌ Failed to start:', err);
  process.exit(1);
});
