import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { StockMovementType } from '../enums/stock-movement-type.enum.js';
import { Product } from '../../products/schemas/product.schema.js';
import { User } from '../../users/schemas/user.schema.js';

export type StockMovementDocument = HydratedDocument<StockMovement>;

// Immutable audit log: only createdAt is tracked, quantity is never edited directly
@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class StockMovement {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Product.name,
    required: true,
    index: true,
  })
  product: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(StockMovementType),
    required: true,
  })
  type: StockMovementType;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, trim: true })
  reason: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  createdBy: Types.ObjectId;
}

export const StockMovementSchema = SchemaFactory.createForClass(StockMovement);
