import { Controller, Get, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { RedisService } from './redis.service';

interface RedisTestValue {
  message: string;
  timestamp: string;
}

@ApiTags('Redis')
@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Public()
  @Get('info')
  @ApiOperation({ summary: 'Get Redis information' })
  async getInfo() {
    const info = await this.redisService.info();
    return { info };
  }

  @Public()
  @Get('keys')
  @ApiOperation({ summary: 'List all Redis keys' })
  async getKeys() {
    const keys = await this.redisService.keys('*');
    return { keys, count: keys.length };
  }

  @Public()
  @Delete('flush')
  @ApiOperation({ summary: 'Flush all Redis data' })
  async flushAll() {
    await this.redisService.flushAll();
    return { message: 'Redis flushed successfully' };
  }

  @Public()
  @Get('test')
  @ApiOperation({ summary: 'Test Redis connection' })
  async testConnection() {
    const testKey = 'redis:test';
    const testValue: RedisTestValue = { 
      message: 'Hello ioredis!', 
      timestamp: new Date().toISOString() 
    };

    await this.redisService.setJson(testKey, testValue, 60);
    const retrieved = await this.redisService.getJson<RedisTestValue>(testKey);

    return {
      operation: 'redis_test',
      set: testValue,
      retrieved: retrieved,
      success: retrieved !== null,
      match: JSON.stringify(testValue) === JSON.stringify(retrieved)
    };
  }
}
