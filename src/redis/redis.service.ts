import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.redisClient.on('connect', () => {
      this.logger.log('✅ Conectado ao Redis');
    });

    this.redisClient.on('error', (error) => {
      this.logger.error('❌ Erro no Redis:', error);
    });
  }

  async onModuleInit() {
    try {
      await this.redisClient.connect();
      this.logger.log('📡 RedisService inicializado');
    } catch (error) {
      this.logger.error('Falha ao conectar com Redis:', error);
    }
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  // Métodos básicos
  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redisClient.setex(key, ttlSeconds, value);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return result === 1;
  }

  // Métodos para objetos JSON
  async getJson<T>(key: string): Promise<T | null> {
    const data = await this.redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  async setJson(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (ttlSeconds) {
      await this.redisClient.setex(key, ttlSeconds, data);
    } else {
      await this.redisClient.set(key, data);
    }
  }

  // Métodos específicos para tasks
  async getTasks(userId: number, filters: any): Promise<any> {
    const key = this.buildTaskKey(userId, filters);
    return this.getJson(key);
  }

  async setTasks(userId: number, filters: any, data: any, ttlSeconds = 300): Promise<void> {
    const key = this.buildTaskKey(userId, filters);
    await this.setJson(key, data, ttlSeconds);
  }

  async invalidateUserTasks(userId: number): Promise<void> {
    const pattern = `user:${userId}:tasks:*`;
    const keys = await this.redisClient.keys(pattern);
    
    if (keys.length > 0) {
      await this.redisClient.del(...keys);
      this.logger.log(`🗑️  Invalidados ${keys.length} caches para usuário ${userId}`);
    }
  }

  // Métodos de utilidade
  async keys(pattern: string): Promise<string[]> {
    return this.redisClient.keys(pattern);
  }

  async flushAll(): Promise<void> {
    await this.redisClient.flushall();
  }

  async info(): Promise<string> {
    return this.redisClient.info();
  }

  private buildTaskKey(userId: number, filters: any): string {
    const filterString = JSON.stringify(filters);
    return `user:${userId}:tasks:${Buffer.from(filterString).toString('base64')}`;
  }
}
