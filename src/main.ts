import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // 1. Cria a instância da aplicação NestJS
  const app = await NestFactory.create(AppModule);

  // Configuração do Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Task Manager API')
    .setDescription('Complete task management system with authentication')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // Nome importante para referência nos controllers
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

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
  console.log(`Swagger documentation available at http://localhost:${port}/api`);
}
bootstrap();
