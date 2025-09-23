import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // 1. Cria a instância da aplicação NestJS
  const app = await NestFactory.create(AppModule);

  // 2. Configuração global de validação
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // Remove propriedades não decoradas com @Validator
    forbidNonWhitelisted: true, // Retorna erro se enviar propriedades não permitidas
    transform: true,        // Transforma tipos automaticamente (ex: string para number)
  }));

  // 3. Configuração CORS (Cross-Origin Resource Sharing)
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001', // Domínios permitidos
    credentials: true, // Permite envio de cookies/tokens
  });

  // 4. Inicia o servidor
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
}
bootstrap();
