import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { WebsocketsModule } from '../websockets/websockets.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [WebsocketsModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
