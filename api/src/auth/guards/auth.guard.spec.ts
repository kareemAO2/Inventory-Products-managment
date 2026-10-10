import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard.js';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;
  let jwtService: JwtService;

  beforeEach(() => {
    reflector = new Reflector();
    jwtService = new JwtService({ secret: 'test-secret' });
    guard = new AuthGuard(reflector, jwtService);
  });

  function createMockExecutionContext(headers: Record<string, string> = {}): ExecutionContext {
    const request = {
      headers,
      user: undefined,
    };
    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: vi.fn(),
        getNext: vi.fn(),
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow access to public routes without token', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const context = createMockExecutionContext();

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw 401 UnauthorizedException when token is missing', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const context = createMockExecutionContext();

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    await expect(guard.canActivate(context)).rejects.toThrow('Authentication token is required');
  });

  it('should throw 401 UnauthorizedException when token is invalid or expired', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const context = createMockExecutionContext({
      authorization: 'Bearer invalid.token.value',
    });

    vi.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('Invalid token'));

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    await expect(guard.canActivate(context)).rejects.toThrow('Authentication token is invalid or expired');
  });

  it('should attach user payload to request and return true when token is valid', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const mockPayload = {
      sub: 'user-123',
      email: 'user@example.com',
      role: 'Manager',
      permissions: ['product:create'],
      tokenType: 'access',
    };

    const context = createMockExecutionContext({
      authorization: 'Bearer valid.jwt.token',
    });

    vi.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);

    const request = context.switchToHttp().getRequest();
    expect(request.user).toEqual({
      userId: 'user-123',
      email: 'user@example.com',
      role: 'Manager',
      permissions: ['product:create'],
    });
  });

  it('should reject a valid refresh token on protected routes', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const context = createMockExecutionContext({
      authorization: 'Bearer refresh-token',
    });
    vi.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
      sub: 'user-123',
      email: 'user@example.com',
      role: 'Manager',
      permissions: [],
      tokenType: 'refresh',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      'Authentication token is invalid or expired',
    );
  });
});
