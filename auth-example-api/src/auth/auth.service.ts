import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { User } from '../user/models/user.model';
import { EventsGateway } from '../websockets/events.gateway';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectRedis() private readonly redis: Redis,
    private readonly eventsGateway: EventsGateway,
  ) {}

  // async web3Login(walletAddress: string, signature: string, ip: string, userAgent: string) {
  //   const lockKey = `lock:auth:${walletAddress.toLowerCase()}`;
  //   const acquired = await this.redis.set(lockKey, 'locked', 'PX', 5000, 'NX');

  //   if (!acquired) {
  //     throw new ConflictException('Заявката ви се обработва от друго устройство. Моля, изчакайте.');
  //   }

  //   try {
  //     if (!signature) throw new UnauthorizedException('Липсва криптографски подпис.');

  //     let isNewUser = false;
  //     let user = await this.userModel.findOne({ where: { walletAddress } });

  //     if (!user) {
  //       user = await this.userModel.create({
  //         walletAddress,
  //         isActive: true
  //       } as any); // Добавяме "as any"

  //       isNewUser = true;
  //     }

  //     user.lastLoginAt = new Date();
  //     await user.save();

  //     const sessionId = await this.createSessionAndNotify(user.id, ip, userAgent);
  //     return { sessionId, isNewUser };

  //   } catch (error: any) {
  //     if (error.name === 'SequelizeUniqueConstraintError') {
  //       const user = await this.userModel.findOne({ where: { walletAddress } });
  //       if(user) {
  //         const sessionId = await this.createSessionAndNotify(user.id, ip, userAgent);
  //         return { sessionId, isNewUser: false };
  //       }
  //     }
  //     throw new InternalServerErrorException('Възникна грешка при автентикация.');
  //   } finally {
  //     await this.redis.del(lockKey);
  //   }
  // }

  async web3Login(
    walletAddress: string,
    signature: string,
    ip: string,
    userAgent: string,
  ) {
    const lockKey = `lock:auth:${walletAddress.toLowerCase()}`;
    const acquired = await this.redis.set(lockKey, 'locked', 'PX', 5000, 'NX');

    if (!acquired) {
      throw new ConflictException(
        'Заявката ви се обработва от друго устройство. Моля, изчакайте.',
      );
    }

    try {
      // Псевдо-проверка на подписа
      if (!signature)
        throw new UnauthorizedException('Липсва криптографски подпис.');

      let isNewUser = false;
      let user = await this.userModel.findOne({ where: { walletAddress } });

      if (!user) {
        // Създаваме нов
        user = await this.userModel.create({ walletAddress, isActive: true });
        isNewUser = true;
      }

      user.lastLoginAt = new Date();
      await user.save();

      const sessionId = await this.createSessionAndNotify(
        user.id,
        ip,
        userAgent,
      );

      // Връщаме флага към контролера
      return { sessionId, isNewUser };
    } finally {
      await this.redis.del(lockKey);
    }
  }

  private async createSessionAndNotify(
    userId: string,
    ip: string,
    userAgent: string,
  ) {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const sessionData = { userId, ip, userAgent, createdAt: new Date() };

    await this.redis.set(
      `session:${sessionId}`,
      JSON.stringify(sessionData),
      'EX',
      604800,
    );
    this.eventsGateway.notifyNewLogin(userId, `${ip} - ${userAgent}`);
    return sessionId;
  }

  async revokeSession(sessionId: string) {
    await this.redis.del(`session:${sessionId}`);
  }
}
