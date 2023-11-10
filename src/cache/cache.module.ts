import { DynamicModule, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { REDIS } from './cache-injection-tokens';
import * as Redis from 'ioredis';

@Module({})
export class CacheModule {
  static register(): DynamicModule {
    return {
      module: CacheModule,
      providers: [
        CacheService,
        {
          provide: REDIS,
          useFactory: () => {
            const redisUrl = new URL(process.env.REDIS_URL);
            const options = {
              host: redisUrl.hostname,
              port: Number(redisUrl.port),
              password: redisUrl.password,
              tls:
                redisUrl.protocol === 'rediss:'
                  ? {}
                  : undefined,
              maxRetriesPerRequest: 1000,
              retryStrategy: (times: number) =>
                Math.min(times * 50, 2000),
              reconnectOnError: function (err) {
                console.error(err.message);
                const targetError = 'READONLY';
                if (
                  err.message.slice(
                    0,
                    targetError.length,
                  ) === targetError
                ) {
                  return 2;
                }
              },
            } as Redis.RedisOptions;
            console.log(options.host);

            return new Redis.Redis(options);
          },
        },
      ],
      exports: [CacheService],
      global: true,
    };
  }
}
