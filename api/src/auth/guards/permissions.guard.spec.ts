import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard.js';
import { Permission } from '../../roles/enums/permission.enum.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  function createMockExecutionContext(user?: any): ExecutionContext {
    const request = { user };
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

  it('should return true for public routes', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return true;
      return null;
    });

    const context = createMockExecutionContext();
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true if no permissions are required', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === PERMISSIONS_KEY) return [];
      return null;
    });

    const context = createMockExecutionContext({ userId: '1' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw 401 UnauthorizedException if user is not present on request', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === PERMISSIONS_KEY) return [Permission.PRODUCT_CREATE];
      return null;
    });

    const context = createMockExecutionContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw 403 ForbiddenException when user lacks required permission', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === PERMISSIONS_KEY) return [Permission.ORDER_APPROVE];
      return null;
    });

    const context = createMockExecutionContext({
      userId: 'staff-1',
      role: 'Staff',
      permissions: [Permission.ORDER_CREATE, Permission.ORDER_READ],
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(/Missing required permission/);
  });

  it('should return true when user has all required permissions', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return false;
      if (key === PERMISSIONS_KEY) return [Permission.ORDER_CREATE, Permission.ORDER_READ];
      return null;
    });

    const context = createMockExecutionContext({
      userId: 'staff-1',
      role: 'Staff',
      permissions: [Permission.ORDER_CREATE, Permission.ORDER_READ],
    });

    expect(guard.canActivate(context)).toBe(true);
  });
});
