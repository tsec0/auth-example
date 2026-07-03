import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Request } from 'express';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    // ОБНОВЕНО: Името на кукито
    const sessionId = request.cookies['auth_session'];

    if (!sessionId) {
      throw new UnauthorizedException('Липсва сесия.');
    }

    const sessionDataStr = await this.redis.get(`session:${sessionId}`);
    if (!sessionDataStr) {
      throw new UnauthorizedException('Сесията е изтекла или невалидна.');
    }

    const sessionData = JSON.parse(sessionDataStr);
    const currentUserAgent = request.headers['user-agent'];

    if (sessionData.userAgent !== currentUserAgent) {
      await this.redis.del(`session:${sessionId}`);
      throw new UnauthorizedException('Засечена е аномалия в устройството. Моля, влезте отново.');
    }

    request['user'] = { id: sessionData.userId, role: sessionData.role };
    return true;
  }
}