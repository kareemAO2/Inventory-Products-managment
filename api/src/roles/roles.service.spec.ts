import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from './schemas/role.schema.js';
import { RolesService } from './roles.service.js';

describe('RolesService', () => {
  let service: RolesService;
  let roleModel: {
    findOne: ReturnType<typeof vi.fn>;
    findOneAndUpdate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    roleModel = {
      findOne: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      }),
      findOneAndUpdate: vi.fn().mockReturnValue({
        setOptions: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue({ _id: 'role-id' }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getModelToken(Role.name),
          useValue: roleModel,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('soft deletes roles', async () => {
    await service.remove('role-id');

    expect(roleModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'role-id' },
      { $set: { deleted_at: expect.any(Date) } },
      { new: true },
    );
  });

  it('restores a soft-deleted role instead of recreating its unique name', async () => {
    const restoredRole = { _id: 'role-id', name: 'Staff', deleted_at: null };
    roleModel.findOneAndUpdate.mockReturnValueOnce({
      setOptions: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue(restoredRole),
    });

    await expect(service.getOrCreateRole('Staff')).resolves.toBe(restoredRole);
    expect(roleModel.findOneAndUpdate).toHaveBeenCalledWith(
      { name: 'Staff' },
      { $set: { deleted_at: null } },
      { new: true },
    );
  });
});
