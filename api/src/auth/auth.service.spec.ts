import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { RolesService } from '../roles/roles.service.js';
import { RoleName } from '../roles/constants/default-roles.constant.js';
import { Permission } from '../roles/enums/permission.enum.js';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let rolesService: Partial<RolesService>;
  let jwtService: Partial<JwtService>;

  beforeEach(() => {
    usersService = {
      findByEmail: vi.fn(),
      findByEmailWithRole: vi.fn(),
      findByIdWithRole: vi.fn(),
      create: vi.fn(),
      addRefreshSession: vi.fn(),
      rotateRefreshSession: vi.fn(),
      removeRefreshSession: vi.fn(),
    };

    rolesService = {
      getOrCreateRole: vi.fn(),
    };

    jwtService = {
      signAsync: vi.fn().mockResolvedValue('signed-mock-jwt-token'),
      verifyAsync: vi.fn(),
    };

    authService = new AuthService(
      usersService as UsersService,
      rolesService as RolesService,
      jwtService as JwtService,
    );
  });

  describe('bcrypt hashing', () => {
    it('should hash a password and correctly verify it with comparePassword', async () => {
      const rawPassword = 'SecurePassword123!';
      const hash = await authService.hashPassword(rawPassword);

      expect(hash).not.toBe(rawPassword);
      expect(hash).toMatch(/^\$2[aby]\$\d+\$/); // standard bcrypt pattern

      const isValid = await authService.comparePassword(rawPassword, hash);
      expect(isValid).toBe(true);

      const isWrong = await authService.comparePassword('WrongPassword', hash);
      expect(isWrong).toBe(false);
    });
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      vi.spyOn(usersService, 'findByEmail').mockResolvedValue({ _id: '1' } as any);

      await expect(
        authService.register({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password and create user with default Staff role', async () => {
      vi.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      vi.spyOn(rolesService, 'getOrCreateRole').mockResolvedValue({
        _id: 'role-staff-id',
        name: RoleName.STAFF,
        permissions: [Permission.ORDER_CREATE],
      } as any);

      vi.spyOn(usersService, 'create').mockImplementation(async (userData: any) => ({
        _id: 'user-new-id',
        name: userData.name,
        email: userData.email,
        passwordHash: userData.passwordHash,
        role: userData.role,
        isActive: true,
      } as any));

      const result = await authService.register({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('signed-mock-jwt-token');
      expect(result.refreshToken).toBe('signed-mock-jwt-token');
      expect(result.user.name).toBe('Jane Doe');
      expect(result.user.role).toBe(RoleName.STAFF);
      expect(usersService.addRefreshSession).toHaveBeenCalledOnce();
    });
  });

  describe('login', () => {
    it('should throw 401 UnauthorizedException if user is not found', async () => {
      vi.spyOn(usersService, 'findByEmailWithRole').mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'notfound@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw 401 UnauthorizedException if password does not match', async () => {
      const realPasswordHash = await authService.hashPassword('correctPassword');

      vi.spyOn(usersService, 'findByEmailWithRole').mockResolvedValue({
        _id: 'user-1',
        email: 'user@example.com',
        passwordHash: realPasswordHash,
        isActive: true,
        role: { name: 'Staff', permissions: [] },
      } as any);

      await expect(
        authService.login({
          email: 'user@example.com',
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw 401 UnauthorizedException if user account is deactivated', async () => {
      const realPasswordHash = await authService.hashPassword('correctPassword');

      vi.spyOn(usersService, 'findByEmailWithRole').mockResolvedValue({
        _id: 'user-1',
        email: 'user@example.com',
        passwordHash: realPasswordHash,
        isActive: false, // inactive account
        role: { name: 'Staff', permissions: [] },
      } as any);

      await expect(
        authService.login({
          email: 'user@example.com',
          password: 'correctPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return user info and access token on successful login', async () => {
      const password = 'SecretPassword123';
      const passwordHash = await authService.hashPassword(password);

      vi.spyOn(usersService, 'findByEmailWithRole').mockResolvedValue({
        _id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash,
        isActive: true,
        role: {
          name: RoleName.MANAGER,
          permissions: [Permission.PRODUCT_CREATE, Permission.ORDER_APPROVE],
        },
      } as any);

      const result = await authService.login({
        email: 'john@example.com',
        password,
      });

      expect(result.accessToken).toBe('signed-mock-jwt-token');
      expect(result.refreshToken).toBe('signed-mock-jwt-token');
      expect(result.user.email).toBe('john@example.com');
      expect(result.user.role).toBe(RoleName.MANAGER);
      expect(result.user.permissions).toContain(Permission.ORDER_APPROVE);
      expect(usersService.addRefreshSession).toHaveBeenCalledOnce();
    });
  });

  describe('refreshSession', () => {
    it('should rotate a valid refresh token and issue a new access token', async () => {
      vi.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
        sub: 'user-1',
        email: 'jane@example.com',
        role: RoleName.STAFF,
        permissions: [],
        tokenType: 'refresh',
      });
      vi.spyOn(usersService, 'findByIdWithRole').mockResolvedValue({
        _id: 'user-1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        isActive: true,
        role: { name: RoleName.STAFF, permissions: [] },
      } as any);
      vi.spyOn(usersService, 'rotateRefreshSession').mockResolvedValue(true);

      const result = await authService.refreshSession('valid-refresh-token');

      expect(result.accessToken).toBe('signed-mock-jwt-token');
      expect(result.refreshToken).toBe('signed-mock-jwt-token');
      expect(result.user.email).toBe('jane@example.com');
      expect(usersService.rotateRefreshSession).toHaveBeenCalledOnce();
    });

    it('should reject an expired or invalid refresh token', async () => {
      vi.spyOn(jwtService, 'verifyAsync').mockRejectedValue(
        new Error('expired token'),
      );

      await expect(
        authService.refreshSession('expired-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject a refresh token that has already been rotated', async () => {
      vi.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
        sub: 'user-1',
        email: 'jane@example.com',
        role: RoleName.STAFF,
        permissions: [],
        tokenType: 'refresh',
      });
      vi.spyOn(usersService, 'findByIdWithRole').mockResolvedValue({
        _id: 'user-1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        isActive: true,
        role: { name: RoleName.STAFF, permissions: [] },
      } as any);
      vi.spyOn(usersService, 'rotateRefreshSession').mockResolvedValue(false);

      await expect(
        authService.refreshSession('already-rotated-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
