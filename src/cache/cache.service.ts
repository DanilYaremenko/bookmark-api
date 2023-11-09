import { Inject, Injectable } from '@nestjs/common';
import { REDIS } from './cache-injection-tokens';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  constructor(
    @Inject(REDIS)
    private readonly redis: Redis,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`CacheService.get error: ${error}`);
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttl?:
      | number
      | (() => number)
      | Promise<number>
      | (() => Promise<number>),
  ): Promise<'OK'> {
    try {
      let ttlValue: number | undefined;
      if (ttl) {
        ttlValue = await (typeof ttl === 'function'
          ? ttl()
          : ttl);
      }
      return this.redis.set(
        key,
        JSON.stringify(value),
        'EX',
        ttlValue,
      );
    } catch (error) {
      console.error(`CacheService.set error: ${error}`);
      throw error;
    }
  }

  async wrap<T>(
    key: string,
    func: (() => T) | Promise<T> | (() => Promise<T>),
    ttl?:
      | number
      | (() => number)
      | Promise<number>
      | (() => Promise<number>),
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached) return cached;

    const value = await (typeof func === 'function'
      ? func()
      : func);

    await this.set(key, value, ttl);
    return value;
  }

  async delete(key: string): Promise<number> {
    try {
      return await this.redis.del(key);
    } catch (error) {
      console.error(`CacheService.delete error: ${error}`);
      throw error;
    }
  }

  async deleteMany(keys: string[]): Promise<number> {
    try {
      return await this.redis.del(...keys);
    } catch (error) {
      console.error(
        `CacheService.deleteMany error: ${error}`,
      );
      throw error;
    }
  }

  async clear(): Promise<'OK'> {
    try {
      return await this.redis.flushdb();
    } catch (error) {
      console.error(`CacheService.clear error: ${error}`);
      throw error;
    }
  }
}
