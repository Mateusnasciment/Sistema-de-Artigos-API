import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Configuração de CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.setGlobalPrefix('api');

  // Configuração Swagger
  const config = new DocumentBuilder()
    .setTitle('Sistema de Artigos API')
    .setDescription('API REST para gerenciamento de artigos com autenticação JWT e controle de permissões')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Insira o token JWT',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Auth', 'Autenticação e gerenciamento de tokens')
    .addTag('Users', 'Gerenciamento de usuários (requer permissão admin)')
    .addTag('Articles', 'Gerenciamento de artigos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Sistema de Artigos - API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`
╔═══════════════════════════════════════╗
║   Sistema de Artigos API - Rodando   ║
╠═══════════════════════════════════════╣
║  Ambiente: ${process.env.NODE_ENV || 'development'}
║  Porta: ${port}
║  
║  📚 Swagger: http://localhost:${port}/docs
║  🔐 Login: POST /api/auth/login
╚═══════════════════════════════════════╝
  `);
}

bootstrap().catch((error) => {
  console.error('Erro ao iniciar aplicação:', error);
  process.exit(1);
});
