import type { Request, Response } from 'express';
import { AuthController } from './auth.controller.js';
import type { AuthService, AuthTokenResult } from './auth.service.js';

describe('AuthController refresh-token cookie handling', () => {
  let controller: AuthController;
  let authService: {
    login: ReturnType<typeof vi.fn>;
    register: ReturnType<typeof vi.fn>;
    refreshSession: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let response: {
    cookie: ReturnType<typeof vi.fn>;
    clearCookie: ReturnType<typeof vi.fn>;
  };
  const tokenResult: AuthTokenResult = {
    message: 'Login successful',
    user: {
      id: 'user-1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'Staff',
      permissions: [],
    },
    accessToken: 'short-lived-access-token',
    refreshToken: 'long-lived-refresh-token',
  };

  beforeEach(() => {
    authService = {
      login: vi.fn().mockResolvedValue(tokenResult),
      register: vi.fn().mockResolvedValue(tokenResult),
      refreshSession: vi.fn().mockResolvedValue({
        ...tokenResult,
        message: 'Session refreshed',
      }),
      logout: vi.fn().mockResolvedValue(undefined),
    };
    response = {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    };
    controller = new AuthController(authService as unknown as AuthService);
  });

  function createRequest(cookies: Record<string, string> = {}): Request {
    return {
      cookies,
      get: vi.fn().mockReturnValue('http://localhost:5173'),
    } as unknown as Request;
  }

  it('sets refresh token as an HttpOnly cookie and omits it from login JSON', async () => {
    const result = await controller.login(
      { email: 'jane@example.com', password: 'password123' },
      createRequest(),
      response as unknown as Response,
    );

    expect(response.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'long-lived-refresh-token',
      expect.objectContaining({
        httpOnly: true,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }),
    );
    expect(result).toEqual({
      message: 'Login successful',
      user: tokenResult.user,
      accessToken: 'short-lived-access-token',
    });
    expect(result).not.toHaveProperty('refreshToken');
  });

  it('reads the refresh token from the cookie and rotates it on refresh', async () => {
    const result = await controller.refresh(
      createRequest({ refreshToken: 'current-refresh-token' }),
      response as unknown as Response,
    );

    expect(authService.refreshSession).toHaveBeenCalledWith(
      'current-refresh-token',
    );
    expect(response.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'long-lived-refresh-token',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(result).not.toHaveProperty('refreshToken');
  });

  it('revokes and clears the refresh-token cookie on logout', async () => {
    await controller.logout(
      createRequest({ refreshToken: 'current-refresh-token' }),
      response as unknown as Response,
    );

    expect(authService.logout).toHaveBeenCalledWith('current-refresh-token');
    expect(response.clearCookie).toHaveBeenCalledWith(
      'refreshToken',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
  });
})
