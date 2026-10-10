import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ZodError } from 'zod';
import { UsersService } from './users.service.js';
import { User } from './schemas/user.schema.js';
import { Role } from '../roles/schemas/role.schema.js';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: {
    create: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    findByIdAndUpdate: ReturnType<typeof vi.fn>;
    findOneAndUpdate: ReturnType<typeof vi.fn>;
    updateOne: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    userModel = {
      create: vi.fn(),
      findOne: vi.fn(),
      findById: vi.fn(),
      find: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      findOneAndUpdate: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ _id: '507f1f77bcf86cd799439011' }),
      }),
      updateOne: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
      }),
      updateMany: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
        {
          provide: getModelToken(Role.name),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects invalid user data before creating a user', async () => {
    await expect(service.create({ email: 'invalid' })).rejects.toBeInstanceOf(
      ZodError,
    );
  });

  it('rejects invalid user IDs before querying', async () => {
    await expect(service.findOne('invalid-id')).rejects.toBeInstanceOf(
      ZodError,
    );
  });

  it('soft deletes users', async () => {
    await service.remove('507f1f77bcf86cd799439011');

    expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: '507f1f77bcf86cd799439011' },
      { $set: { deleted_at: expect.any(Date) } },
      { new: true },
    );
  });

  it('stores only a refresh-token hash and expiration for a new session', async () => {
    const expiresAt = new Date('2026-10-16T00:00:00.000Z');

    await service.addRefreshSession(
      '507f1f77bcf86cd799439011',
      'hashed-token',
      expiresAt,
    );

    expect(userModel.updateOne).toHaveBeenNthCalledWith(
      1,
      { _id: '507f1f77bcf86cd799439011' },
      { $pull: { refreshSessions: { expiresAt: { $lte: expect.any(Date) } } } },
    );
    expect(userModel.updateOne).toHaveBeenNthCalledWith(
      2,
      { _id: '507f1f77bcf86cd799439011' },
      {
        $push: {
          refreshSessions: { tokenHash: 'hashed-token', expiresAt },
        },
      },
    );
  });

  it('atomically rotates only a live matching refresh session', async () => {
    const rotated = await service.rotateRefreshSession(
      '507f1f77bcf86cd799439011',
      'old-hash',
      'new-hash',
      new Date('2026-10-16T00:00:00.000Z'),
    );

    expect(rotated).toBe(true);
    expect(userModel.updateOne).toHaveBeenCalledWith(
      {
        _id: '507f1f77bcf86cd799439011',
        refreshSessions: {
          $elemMatch: {
            tokenHash: 'old-hash',
            expiresAt: { $gt: expect.any(Date) },
          },
        },
      },
      {
        $set: {
          'refreshSessions.$.tokenHash': 'new-hash',
          'refreshSessions.$.expiresAt': new Date('2026-10-16T00:00:00.000Z'),
        },
      },
    );
  });

  it('removes a refresh session on logout', async () => {
    await service.removeRefreshSession('hashed-token');

    expect(userModel.updateMany).toHaveBeenCalledWith(
      { 'refreshSessions.tokenHash': 'hashed-token' },
      { $pull: { refreshSessions: { tokenHash: 'hashed-token' } } },
    );
  });
});
