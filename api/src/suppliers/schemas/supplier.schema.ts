import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { softDeletePlugin } from '../../common/schemas/soft-delete.plugin.js';

export type SupplierDocument = HydratedDocument<Supplier>;

@Schema({ timestamps: true })
export class Supplier {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  contactInfo: string;

  deleted_at?: Date | null;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
SupplierSchema.plugin(softDeletePlugin);
