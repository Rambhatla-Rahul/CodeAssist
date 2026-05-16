import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { user } = req as any;
    const cookie = await this.authService.getCookieWithJwtToken(user.id, user.email);
    res.setHeader('Set-Cookie', cookie);
    return { message: 'Login successful' };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    const cookie = await this.authService.getCookieForLogOut();
    res.setHeader('Set-Cookie', cookie);
    return { message: 'Logout successful' };
  }
}
