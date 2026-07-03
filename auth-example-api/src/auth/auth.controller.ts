import { Controller, Post, Body, Req, Res, UseGuards, Get } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SessionGuard } from './guards/session.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('web3')
  async loginWeb3(@Body() body: any, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const ip = (req.ip || req.headers['x-forwarded-for']) as string;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await this.authService.web3Login(body.walletAddress, body.signature, ip, userAgent);

    // ОБНОВЕНО: Името на кукито
    res.cookie('auth_session', result.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { 
      message: result.isNewUser ? 'Акаунтът е успешно създаден!' : 'Успешно вписване!',
      isNewUser: result.isNewUser 
    };
  }

  @UseGuards(SessionGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sessionId = req.cookies['auth_session'];
    await this.authService.revokeSession(sessionId);
    res.clearCookie('auth_session');
    return { message: 'Успешно излизане' };
  }

  @UseGuards(SessionGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return { user: req['user'] };
  }
}