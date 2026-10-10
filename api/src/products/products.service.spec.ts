import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service.js';
import { Product } from './schemas/product.schema.js';
import { listProductsQuerySchema } from './dto/list-products-query.dto.js';

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: {
    find: ReturnType<typeof vi.fn>;
    countDocuments: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    findOneAndUpdate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    const query = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([{ name: 'T-shirt' }]),
    };
    const countQuery = {
      exec: vi.fn().mockResolvedValue(1),
    };
    productModel = {
      find: vi.fn().mockReturnValue(query),
      countDocuments: vi.fn().mockReturnValue(countQuery),
      findOne: vi.fn().mockReturnValue(query),
      findOneAndUpdate: vi.fn().mockReturnValue(query),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: productModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('lists products with pagination, sorting, filters, and search', async () => {
    const query = listProductsQuerySchema.parse({
      page: '2',
      limit: '10',
      sort: '-price',
      category: '507f1f77bcf86cd799439011',
      minPrice: '10',
      q: 'shirt',
    });

    const result = await service.findAll(query);

    expect(productModel.find).toHaveBeenCalledWith({
      deleted_at: null,
      category: '507f1f77bcf86cd799439011',
      price: { $gte: 10 },
      $or: [
        { name: /shirt/i },
        { sku: /shirt/i },
      ],
    });
    expect(productModel.find.mock.results[0].value.sort).toHaveBeenCalledWith({
      price: -1,
    });
    expect(productModel.find.mock.results[0].value.skip).toHaveBeenCalledWith(
      10,
    );
    expect(productModel.find.mock.results[0].value.limit).toHaveBeenCalledWith(
      10,
    );
    expect(result).toEqual({
      data: [{ name: 'T-shirt' }],
      pagination: { page: 2, limit: 10, total: 1, totalPages: 1 },
    });
  });

  it('lists non-deleted products below their individual stock thresholds', async () => {
    await service.findLowStock();

    expect(productModel.find).toHaveBeenCalledWith({
      deleted_at: null,
      $expr: { $lt: ['$quantityInStock', '$lowStockThreshold'] },
    });
    expect(productModel.find.mock.results[0].value.exec).toHaveBeenCalledOnce();
  });

  it('uses default pagination and rejects invalid list query parameters', () => {
    expect(listProductsQuerySchema.parse({})).toMatchObject({
      page: 1,
      limit: 20,
    });
    expect(() => listProductsQuerySchema.parse({ page: '0' })).toThrow();
    expect(() => listProductsQuerySchema.parse({ limit: '101' })).toThrow();
    expect(() =>
      listProductsQuerySchema.parse({ sort: '-unknown' }),
    ).toThrow();
  });

  it('escapes search terms before building the regular expression', async () => {
    await service.findAll(
      listProductsQuerySchema.parse({ q: 'shirt.*' }),
    );

    const filter = productModel.find.mock.calls[0][0];
    expect(filter.$or[0].name).toEqual(/shirt\.\*/i);
  });

  it('soft deletes products instead of removing them', async () => {
    await service.remove('507f1f77bcf86cd799439011');

    expect(productModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: '507f1f77bcf86cd799439011', deleted_at: null },
      { $set: { deleted_at: expect.any(Date) } },
      { new: true },
    );
  });
});
