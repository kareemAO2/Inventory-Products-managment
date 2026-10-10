import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { Types } from 'mongoose';

describe('UsersController', () => {
  let controller: UsersController;
  const usersService = {
    createManagedUser: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('does not expose password hashes in managed-user responses', async () => {
    usersService.createManagedUser.mockResolvedValue({
      _id: new Types.ObjectId(),
      name: 'New teammate',
      email: 'new@example.com',
      passwordHash: 'private-hash',
      role: new Types.ObjectId(),
      isActive: true,
    });

    const response = await controller.create({
      name: 'New teammate',
      email: 'new@example.com',
      password: 'not-a-hash',
      role: new Types.ObjectId().toString(),
    });

    expect(response).not.toHaveProperty('passwordHash');
    expect(response).not.toHaveProperty('refreshSessions');
    expect(response).toMatchObject({
      name: 'New teammate',
      email: 'new@example.com',
      permissions: [],
    });
  });
});
