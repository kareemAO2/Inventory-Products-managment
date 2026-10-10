import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';
import { Order, OrderDocument } from './schemas/order.schema.js';
import {
  OrderItem,
  OrderItemDocument,
} from '../order-items/schemas/order-item.schema.js';
import {
  Product,
  ProductDocument,
} from '../products/schemas/product.schema.js';
import {
  StockMovement,
  StockMovementDocument,
} from '../stock/schemas/stock-movement.schema.js';
import { StockMovementType } from '../stock/enums/stock-movement-type.enum.js';
import { OrderStatus } from './enums/order-status.enum.js';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(OrderItem.name)
    private readonly orderItemModel: Model<OrderItemDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(StockMovement.name)
    private readonly stockMovementModel: Model<StockMovementDocument>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    return this.orderModel.create({
      customerName: createOrderDto.customerName,
      status: OrderStatus.PENDING,
      totalAmount: 0,
    });
  }

  async findAll() {
    return this.orderModel.find({ deleted_at: null }).exec();
  }

  async findOne(id: string) {
    const order = await this.orderModel
      .findOne({ _id: id, deleted_at: null })
      .exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto, approvedBy: string) {
    if (updateOrderDto.status === OrderStatus.APPROVED) {
      return this.approve(id, approvedBy, updateOrderDto);
    }

    const order = await this.orderModel
      .findByIdAndUpdate(id, updateOrderDto, { new: true, runValidators: true })
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async cancel(id: string) {
    const order = await this.orderModel
      .findOneAndUpdate(
        { _id: id, status: OrderStatus.PENDING, deleted_at: null },
        { $set: { status: OrderStatus.CANCELLED } },
        { new: true, runValidators: true },
      )
      .exec();

    if (!order) {
      const existingOrder = await this.orderModel.findById(id).exec();
      if (!existingOrder) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    return order;
  }

  async ship(id: string) {
    const order = await this.orderModel
      .findOneAndUpdate(
        { _id: id, status: OrderStatus.APPROVED, deleted_at: null },
        { $set: { status: OrderStatus.SHIPPED } },
        { new: true, runValidators: true },
      )
      .exec();

    if (!order) {
      const existingOrder = await this.orderModel
        .findOne({ _id: id, deleted_at: null })
        .select('status')
        .exec();
      if (!existingOrder) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }
      throw new BadRequestException('Only approved orders can be shipped');
    }

    return order;
  }

  private async approve(
    id: string,
    approvedBy: string,
    updateOrderDto: UpdateOrderDto,
  ) {
    const session = await this.orderModel.startSession();

    try {
      return await session.withTransaction(async () => {
        const order = await this.orderModel
          .findOne({ _id: id, deleted_at: null })
          .session(session)
          .exec();
        if (!order) {
          throw new NotFoundException(`Order with ID ${id} not found`);
        }
        if (order.status !== OrderStatus.PENDING) {
          throw new BadRequestException('Only pending orders can be approved');
        }

        const orderItems = await this.orderItemModel
          .find({ order: id, deleted_at: null })
          .populate<{ product: { _id: string; name: string } }>('product')
          .session(session)
          .exec();
        if (orderItems.length === 0) {
          throw new BadRequestException(
            'An order must contain at least one item to be approved',
          );
        }

        for (const item of orderItems) {
          const productUpdate = await this.productModel
            .updateOne(
              {
                _id: item.product._id,
                deleted_at: null,
                quantityInStock: { $gte: item.quantity },
              },
              { $inc: { quantityInStock: -item.quantity } },
              { session },
            )
            .exec();

          if (productUpdate.matchedCount === 0) {
            const productExists = await this.productModel
              .findOne({ _id: item.product._id, deleted_at: null })
              .session(session)
              .select('_id')
              .exec();
            if (!productExists) {
              console.log(item.product);
              throw new NotFoundException(
                `Product with ID ${item.product._id.toString()} not found`,
              );
            }
            throw new BadRequestException(
              `Insufficient stock for product ${item.product.name.toString()}`,
            );
          }

          await this.stockMovementModel.create(
            [
              {
                product: item.product._id,
                type: StockMovementType.OUT,
                quantity: item.quantity,
                reason: `Order ${id} approved`,
                createdBy: approvedBy,
              },
            ],
            { session },
          );
        }

        const orderUpdates: {
          status: OrderStatus;
          customerName?: string;
          totalAmount?: number;
        } = { status: OrderStatus.APPROVED };
        if (updateOrderDto.customerName !== undefined) {
          orderUpdates.customerName = updateOrderDto.customerName;
        }
        if (updateOrderDto.totalAmount !== undefined) {
          orderUpdates.totalAmount = updateOrderDto.totalAmount;
        }

        const approvedOrder = await this.orderModel
          .findOneAndUpdate(
            { _id: id, status: OrderStatus.PENDING, deleted_at: null },
            { $set: orderUpdates },
            { new: true, runValidators: true, session },
          )
          .exec();
        if (!approvedOrder) {
          throw new BadRequestException('Order is no longer pending approval');
        }
        return approvedOrder;
      });
    } finally {
      await session.endSession();
    }
  }

  async remove(id: string) {
    const order = await this.orderModel
      .findOneAndUpdate(
        { _id: id },
        { $set: { deleted_at: new Date() } },
        { new: true },
      )
      .exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }
}
