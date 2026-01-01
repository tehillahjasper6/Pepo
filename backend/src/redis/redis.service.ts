import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  async onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  // Draw locking mechanism
  async acquireDrawLock(giveawayId: string, ttl: number = 30000): Promise<boolean> {
    const lockKey = `draw:lock:${giveawayId}`;
    const result = await this.client.set(lockKey, '1', 'PX', ttl, 'NX');
    return result === 'OK';
  }

  async releaseDrawLock(giveawayId: string): Promise<void> {
    const lockKey = `draw:lock:${giveawayId}`;
    await this.client.del(lockKey);
  }

  async isDrawLocked(giveawayId: string): Promise<boolean> {
    const lockKey = `draw:lock:${giveawayId}`;
    const exists = await this.client.exists(lockKey);
    return exists === 1;
  }

  // Cache management
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.client.set(key, serialized, 'EX', ttl);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }
}

