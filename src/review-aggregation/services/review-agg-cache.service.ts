import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class ReviewAggCacheService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  key(recipientId: string): string {
    return `seller:agg:${recipientId}`;
  }

  async get<T>(recipientId: string): Promise<T | null> {
    const raw = await this.redis.get(this.key(recipientId));
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set<T>(recipientId: string, value: T, ttlSeconds = 60): Promise<void> {
    await this.redis.set(this.key(recipientId), JSON.stringify(value), 'EX', ttlSeconds);
  }

  async invalidate(recipientId: string): Promise<void> {
    await this.redis.del(this.key(recipientId));
  }
}
