import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Category } from '../../categories/schemas/category.schema.js';
import { Supplier } from '../../suppliers/schemas/supplier.schema.js';
import { SchemaTypes } from 'mongoose';
import { softDeletePlugin } from '../../common/schemas/soft-delete.plugin.js';
export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
  })
  sku: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, default: 0, min: 0 })
  quantityInStock: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Category.name,
    required: true,
    index: true,
  })
  category: Types.ObjectId;

  @Prop({ required: true, default: 5, min: 0 })
  lowStockThreshold: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Supplier.name,
    required: true,
    index: true,
  })
  supplier: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', default: null })
  created_by: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', default: null })
  updated_by: Types.ObjectId;

  deleted_at?: Date | null;

  created_at?: Date;
  updated_at?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.plugin(softDeletePlugin);
