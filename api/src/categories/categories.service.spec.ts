import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CategoriesService } from './categories.service.js';
import { Category } from './schemas/category.schema.js';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryModel: { findOneAndUpdate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    categoryModel = {
      findOneAndUpdate: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ _id: 'category-id' }),
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getModelToken(Category.name),
          useValue: categoryModel,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('soft deletes categories', async () => {
    await service.remove('category-id');

    expect(categoryModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'category-id', deleted_at: null },
      { $set: { deleted_at: expect.any(Date) } },
      { new: true },
    );
  });
});
