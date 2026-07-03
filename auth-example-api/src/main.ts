import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser(process.env.COOKIE_SECRET));

  app.enableCors({
    origin: 'process.env.FRONTEND_URL || http://localhost:8080',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true}));
  
  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Сървърът е стартиран на порт ${process.env.PORT || 3000}`);
}
bootstrap();
