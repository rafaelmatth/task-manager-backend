import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    // 1. Configuração das variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,       // Disponível em todos os módulos
      envFilePath: '.env',  // Arquivo de configuração
    }),

    // 2. Configuração do TypeORM (PostgreSQL)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Usa ConfigModule para acessar variáveis
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'], // Onde encontrar entidades
        synchronize: configService.get('NODE_ENV') !== 'production', // Sincroniza schema em dev
        logging: configService.get('NODE_ENV') === 'development', // Logs SQL em dev
      }),
      inject: [ConfigService], // Injeta o serviço de configuração
    }),

    // 3. Configuração do Cache (Redis)
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: () => redisStore({
          socket: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
          },
          ttl: 300, // 5 minutes
        }),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule { }
