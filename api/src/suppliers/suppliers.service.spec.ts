import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SuppliersService } from './suppliers.service.js';
import { Supplier } from './schemas/supplier.schema.js';

describe('SuppliersService', () => {
  let service: SuppliersService;
  let supplierModel: { findOneAndUpdate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    supplierModel = {
      findOneAndUpdate: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ _id: 'supplier-id' }),
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        {
          provide: getModelToken(Supplier.name),
          useValue: supplierModel,
        },
      ],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('soft deletes suppliers', async () => {
    await service.remove('supplier-id');

    expect(supplierModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'supplier-id', deleted_at: null },
      { $set: { deleted_at: expect.any(Date) } },
      { new: true },
    );
  });
});
