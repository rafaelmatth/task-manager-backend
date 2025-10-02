import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { Task } from '../tasks/entities/task.entity';
import { TaskFiltersDto } from '../tasks/dto/task-filters.dto';

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

  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (ttlSeconds) {
      await this.redisClient.setex(key, ttlSeconds, data);
    } else {
      await this.redisClient.set(key, data);
    }
  }

  // Métodos específicos para tasks
  async getTasks(userId: number, filters: TaskFiltersDto): Promise<{ tasks: Task[]; total: number } | null> {
    const key = this.buildTaskKey(userId, filters);
    return this.getJson(key);
  }

  async setTasks(userId: number, filters: TaskFiltersDto, data: { tasks: Task[]; total: number }, ttlSeconds = 300): Promise<void> {
    const key = this.buildTaskKey(userId, filters);
    await this.setJson(key, data, ttlSeconds);
  }

  async invalidateUserTasks(userId: number): Promise<void> {
    const pattern = `user:${userId}:tasks:*`;
    // Usar SCAN em vez de KEYS para evitar bloqueio em produção
    const stream = this.redisClient.scanStream({
      match: pattern,
      count: 100, // Processar em lotes de 100
    });

    let deletedCount = 0;
    stream.on('data', (keys: string[]) => {
      if (keys.length) {
        deletedCount += keys.length;
        this.redisClient.del(keys);
      }
    });
    stream.on('end', () => this.logger.log(`🗑️  Invalidados ${deletedCount} caches para usuário ${userId}`));
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

  private buildTaskKey(userId: number, filters: object): string {
    const filterString = JSON.stringify(filters);
    return `user:${userId}:tasks:${Buffer.from(filterString).toString('base64')}`;
  }
}
