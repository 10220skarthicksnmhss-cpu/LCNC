// src/config/redis.ts — Redis and BullMQ connection
import { Redis } from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // required by BullMQ
  enableReadyCheck: false,
  lazyConnect: true,
});

redis.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});

redis.on('connect', () => {
  console.log('[Redis] Connected');
});

// BullMQ requires a separate connection config object
export const bullMQRedisOptions = {
  connection: {
    host: new URL(env.REDIS_URL.replace('redis://', 'http://')).hostname,
    port: parseInt(new URL(env.REDIS_URL.replace('redis://', 'http://')).port || '6379'),
  },
};
