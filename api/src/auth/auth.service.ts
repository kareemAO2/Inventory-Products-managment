import { createHash } from 'node:crypto';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { RolesService } from '../roles/roles.service.js';
import { RoleName } from '../roles/constants/default-roles.constant.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import type { JwtPayload } from './interfaces/jwt-payload.interface.js';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DEVELOPMENT_JWT_SECRET = 'inventory-secret-key-2026';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface AuthTokenResult {
  message: string;
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;
  private readonly accessTokenSecret =
    process.env.JWT_SECRET || DEVELOPMENT_JWT_SECRET;
  private readonly refreshTokenSecret =
    process.env.JWT_REFRESH_SECRET || this.accessTokenSecret;

  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async register(registerDto: RegisterDto): Promise<AuthTokenResult> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await this.hashPassword(registerDto.password);
    const role = await this.rolesService.getOrCreateRole(RoleName.STAFF);
    const user = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email.toLowerCase(),
      passwordHash,
      role: role._id,
      isActive: true,
    });

    return this.issueSession(
      user._id.toString(),
      user.email,
      user.name,
      role.name,
      role.permissions,
      'User registered successfully',
    );
  }

  async login(loginDto: LoginDto): Promise<AuthTokenResult> {
    const user = await this.usersService.findByEmailWithRole(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.comparePassword(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'User account is deactivated. Please contact an administrator.',
      );
    }

    const roleName = user.role?.name || RoleName.STAFF;
    const permissions = user.role?.permissions || [];

    return this.issueSession(
      user._id.toString(),
      user.email,
      user.name,
      roleName,
      permissions,
      'Login successful',
    );
  }

  async refreshSession(refreshToken: string | undefined): Promise<AuthTokenResult> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.refreshTokenSecret,
      });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const user = await this.usersService.findByIdWithRole(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const roleName = user.role?.name || RoleName.STAFF;
    const permissions = user.role?.permissions || [];
    const tokens = await this.createTokenPair(
      user._id.toString(),
      user.email,
      roleName,
      permissions,
    );
    const wasRotated = await this.usersService.rotateRefreshSession(
      user._id.toString(),
      this.hashToken(refreshToken),
      this.hashToken(tokens.refreshToken),
      tokens.refreshExpiresAt,
    );

    if (!wasRotated) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    return {
      message: 'Session refreshed',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: roleName,
        permissions,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (refreshToken) {
      await this.usersService.removeRefreshSession(this.hashToken(refreshToken));
    }
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findByIdWithRole(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      role: user.role?.name,
      permissions: user.role?.permissions || [],
    };
  }

  private async issueSession(
    userId: string,
    email: string,
    name: string,
    role: string,
    permissions: string[],
    message: string,
  ): Promise<AuthTokenResult> {
    const tokens = await this.createTokenPair(userId, email, role, permissions);
    await this.usersService.addRefreshSession(
      userId,
      this.hashToken(tokens.refreshToken),
      tokens.refreshExpiresAt,
    );

    return {
      message,
      user: { id: userId, name, email, role, permissions },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private async createTokenPair(
    userId: string,
    email: string,
    role: string,
    permissions: string[],
  ) {
    const commonPayload = { sub: userId, email, role, permissions };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...commonPayload, tokenType: 'access' satisfies JwtPayload['tokenType'] },
        { secret: this.accessTokenSecret, expiresIn: ACCESS_TOKEN_TTL },
      ),
      this.jwtService.signAsync(
        { ...commonPayload, tokenType: 'refresh' satisfies JwtPayload['tokenType'] },
        { secret: this.refreshTokenSecret, expiresIn: REFRESH_TOKEN_TTL },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      refreshExpiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
