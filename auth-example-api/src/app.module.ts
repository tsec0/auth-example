import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RedisModule } from '@nestjs-modules/ioredis';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { User } from './user/models/user.model';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // 1. Зареждане на .env файла (isGlobal прави process.env достъпен навсякъде)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // По подразбиране търси този файл в главната папка
    }),

    // 2. Връзка с PostgreSQL
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      models: [User],
      autoLoadModels: true,
      // ВНИМАНИЕ: За production е препоръчително synchronize да е false 
      // и да се ползват миграции, но за старта на проекта е true, 
      // за да създаде таблиците автоматично.
      synchronize: true, 
    }),

    // 2. Връзка с Redis
    RedisModule.forRoot({
      type: 'single',
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    }),

    // 3. Нашите бизнес модули
    UserModule,
    WebsocketsModule,
    AuthModule,
  ],
})
export class AppModule {}
