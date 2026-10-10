import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { Public } from './decorators/public.decorator.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import type { AuthenticatedUser } from './interfaces/jwt-payload.interface.js';
import type { AuthTokenResult } from './auth.service.js';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.assertTrustedOrigin(request);
    return this.setRefreshCookieAndReturn(
      await this.authService.register(registerDto),
      response,
    );
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.assertTrustedOrigin(request);
    return this.setRefreshCookieAndReturn(
      await this.authService.login(loginDto),
      response,
    );
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.assertTrustedOrigin(request);
    return this.setRefreshCookieAndReturn(
      await this.authService.refreshSession(
        request.cookies?.[REFRESH_COOKIE_NAME],
      ),
      response,
    );
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    this.assertTrustedOrigin(request);
    await this.authService.logout(request.cookies?.[REFRESH_COOKIE_NAME]);
    response.clearCookie(REFRESH_COOKIE_NAME, this.getCookieOptions());
  }

  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getProfile(user.userId);
  }

  private setRefreshCookieAndReturn(
    result: AuthTokenResult,
    response: Response,
  ) {
    response.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
      ...this.getCookieOptions(),
      maxAge: REFRESH_COOKIE_MAX_AGE,
    });

    return {
      message: result.message,
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  private getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
    };
  }

  private assertTrustedOrigin(request: Request): void {
    const origin = request.get('origin');
    if (!origin) {
      return;
    }

    const allowedOrigins = (
      process.env.CLIENT_ORIGINS ??
      'http://localhost:5173,http://127.0.0.1:5173'
    )
      .split(',')
      .map((allowedOrigin) => allowedOrigin.trim());

    if (!allowedOrigins.includes(origin)) {
      throw new ForbiddenException('Request origin is not allowed');
    }
  }
}
