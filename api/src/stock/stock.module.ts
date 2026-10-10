import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockService } from './stock.service.js';
import { StockController } from './stock.controller.js';
import {
  StockMovement,
  StockMovementSchema,
} from './schemas/stock-movement.schema.js';
import { Product, ProductSchema } from '../products/schemas/product.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockMovement.name, schema: StockMovementSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [StockController],
  providers: [StockService],
  exports: [MongooseModule, StockService],
})
export class StockModule {}
