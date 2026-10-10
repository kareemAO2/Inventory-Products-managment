import {
  BadRequestException,
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateStockDto } from './dto/create-stock.dto.js';
import {
  StockMovement,
  StockMovementDocument,
} from './schemas/stock-movement.schema.js';
import {
  Product,
  ProductDocument,
} from '../products/schemas/product.schema.js';
import { StockMovementType } from './enums/stock-movement-type.enum.js';

@Injectable()
export class StockService {
  constructor(
    @InjectModel(StockMovement.name)
    private readonly stockMovementModel: Model<StockMovementDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(createStockDto: CreateStockDto) {
    const session = await this.stockMovementModel.startSession();
    try {
      return await session.withTransaction(async () => {
        const stockChange =
          createStockDto.type === StockMovementType.IN
            ? createStockDto.quantity
            : -createStockDto.quantity;
        const productUpdate = await this.productModel
          .updateOne(
            {
              _id: createStockDto.product,
              deleted_at: null,
              ...(createStockDto.type === StockMovementType.OUT
                ? { quantityInStock: { $gte: createStockDto.quantity } }
                : {}),
            },
            { $inc: { quantityInStock: stockChange } },
            { session },
          )
          .exec();

        if (productUpdate.matchedCount === 0) {
          const productExists = await this.productModel
            .findOne({ _id: createStockDto.product, deleted_at: null })
            .session(session)
            .select('_id')
            .exec();

          if (!productExists) {
            throw new NotFoundException(
              `Product with ID ${createStockDto.product} not found`,
            );
          }
          throw new BadRequestException(
            'Insufficient stock for this outgoing movement',
          );
        }

        const [movement] = await this.stockMovementModel.create(
          [
            {
              product: createStockDto.product,
              type: createStockDto.type,
              quantity: createStockDto.quantity,
              reason: createStockDto.reason,
              createdBy: createStockDto.created_by,
            },
          ],
          { session },
        );

        return movement;
      });
    } finally {
      await session.endSession();
    }
  }

  async findAll() {
    return this.stockMovementModel.find().populate('product').exec();
  }

  async findOne(id: string) {
    const movement = await this.stockMovementModel.findById(id).exec();
    if (!movement) {
      throw new NotFoundException(`Stock movement with ID ${id} not found`);
    }
    return movement;
  }

  update(id: string): never {
    throw new MethodNotAllowedException(
      `Stock movement ${id} is immutable; create a new movement to correct stock`,
    );
  }

  remove(id: string): never {
    throw new MethodNotAllowedException(
      `Stock movement ${id} is immutable and cannot be deleted`,
    );
  }
}
