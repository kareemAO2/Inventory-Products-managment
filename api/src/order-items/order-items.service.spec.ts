import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { OrderItemsService } from './order-items.service.js';
import { OrderItem } from './schemas/order-item.schema.js';
import { Order } from '../orders/schemas/order.schema.js';
import { Product } from '../products/schemas/product.schema.js';
import { OrderStatus } from '../orders/enums/order-status.enum.js';

const query = (result: unknown) => ({
  session: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  exec: vi.fn().mockResolvedValue(result),
});

describe('OrderItemsService', () => {
  let service: OrderItemsService;
  let orderItemModel: Record<string, ReturnType<typeof vi.fn>>;
  let orderModel: Record<string, ReturnType<typeof vi.fn>>;
  let productModel: Record<string, ReturnType<typeof vi.fn>>;
  let session: {
    withTransaction: ReturnType<typeof vi.fn>;
    endSession: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    session = {
      withTransaction: vi.fn(async (callback: () => Promise<unknown>) =>
        callback(),
      ),
      endSession: vi.fn().mockResolvedValue(undefined),
    };
    orderItemModel = {
      create: vi.fn().mockResolvedValue([{ _id: 'item-id' }]),
      find: vi.fn(),
      findById: vi.fn(),
    };
    orderModel = {
      startSession: vi.fn().mockResolvedValue(session),
      findOne: vi.fn().mockReturnValue(query({
        _id: 'order-id',
        status: OrderStatus.PENDING,
      })),
      updateOne: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ matchedCount: 1 }),
      }),
    };
    productModel = {
      findOne: vi.fn().mockReturnValue(query({ price: 7.5 })),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderItemsService,
        { provide: getModelToken(OrderItem.name), useValue: orderItemModel },
        { provide: getModelToken(Order.name), useValue: orderModel },
        { provide: getModelToken(Product.name), useValue: productModel },
      ],
    }).compile();

    service = module.get<OrderItemsService>(OrderItemsService);
  });

  it('creates priced order items and updates the order total atomically', async () => {
    const result = await service.create({
      order: 'order-id',
      product: 'product-id',
      quantity: 3,
    });

    expect(result).toEqual({ _id: 'item-id' });
    expect(session.withTransaction).toHaveBeenCalledOnce();
    expect(orderItemModel.create).toHaveBeenCalledWith(
      [
        {
          order: 'order-id',
          product: 'product-id',
          quantity: 3,
          unitPrice: 7.5,
        },
      ],
      { session },
    );
    expect(orderModel.updateOne).toHaveBeenCalledWith(
      { _id: 'order-id', status: OrderStatus.PENDING, deleted_at: null },
      { $inc: { totalAmount: 22.5 } },
      { session },
    );
    expect(session.endSession).toHaveBeenCalledOnce();
  });
});
