import Redis from 'ioredis';
import { env } from './env.js';

let redis = null;
let isRedisReady = false;

if (env.redisUrl) {
  try {
    redis = new Redis(env.redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 5000,
      retryStrategy(times) {
        // Exponential backoff capped at 30 seconds
        return Math.min(times * 1000, 30000);
      },
    });

    redis.on('connect', () => {
      isRedisReady = true;
      console.log('[Redis] Connected successfully.');
    });

    redis.on('ready', () => {
      isRedisReady = true;
    });

    redis.on('error', (err) => {
      isRedisReady = false;
      console.warn('[Redis] Connection warning:', err.message);
    });

    redis.on('close', () => {
      isRedisReady = false;
    });

    // Attempt initial connect asynchronously
    redis.connect().catch((err) => {
      isRedisReady = false;
      console.warn('[Redis] Initial connection error:', err.message);
    });
  } catch (err) {
    console.warn('[Redis] Initialization failed:', err.message);
    redis = null;
    isRedisReady = false;
  }
}

export async function getCache(key) {
  if (!redis || !isRedisReady) return null;
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[Redis] Error getting key "${key}":`, err.message);
    return null;
  }
}

export async function setCache(key, value, ttlSeconds = env.cacheTtlSeconds) {
  if (!redis || !isRedisReady) return;
  try {
    const payload = JSON.stringify(value);
    if (ttlSeconds && ttlSeconds > 0) {
      await redis.set(key, payload, 'EX', ttlSeconds);
    } else {
      await redis.set(key, payload);
    }
  } catch (err) {
    console.warn(`[Redis] Error setting key "${key}":`, err.message);
  }
}

export async function deleteCache(...keys) {
  if (!redis || !isRedisReady || keys.length === 0) return;
  try {
    const filtered = keys.filter(Boolean);
    if (filtered.length > 0) {
      await redis.del(...filtered);
    }
  } catch (err) {
    console.warn('[Redis] Error deleting keys:', err.message);
  }
}

export async function deletePattern(pattern) {
  if (!redis || !isRedisReady) return;
  try {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys && keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');
  } catch (err) {
    console.warn(`[Redis] Error deleting pattern "${pattern}":`, err.message);
  }
}

export async function invalidateUserCache(userId) {
  if (!userId) return;
  await deleteCache(`cache:user:${userId}:me`);
}

export async function invalidateReadingsCache(userId) {
  if (!userId) return;
  await deletePattern(`cache:readings:${userId}:*`);
}

export { redis };

