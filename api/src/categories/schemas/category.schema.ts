import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { softDeletePlugin } from '../../common/schemas/soft-delete.plugin.js';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description?: string;

  deleted_at?: Date | null;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.plugin(softDeletePlugin);
