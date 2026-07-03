import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // <-- 1. Импортираме ConfigService

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. Вземаме инстанцията на ConfigService от вече създаденото приложение
  const configService = app.get(ConfigService);

  app.use(helmet());
  // 3. Извличаме тайните сигурно чрез configService
  const cookieSecret = configService.get<string>('COOKIE_SECRET');
  app.use(cookieParser(cookieSecret));

  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:8080'); // Вторият параметър е fallback (по подразбиране)

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true}));
  
  // 4. Вземаме порта
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`🚀 Сървърът е стартиран на порт ${port}`);
}
bootstrap();
