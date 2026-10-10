import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Permission } from '../enums/permission.enum.js';
import { softDeletePlugin } from '../../common/schemas/soft-delete.plugin.js';

export type RoleDocument = HydratedDocument<Role>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Role {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({
    type: [String],
    enum: Object.values(Permission),
    default: [],
  })
  permissions: Permission[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    default: null,
  })
  created_by?: Types.ObjectId | null;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    default: null,
  })
  updated_by?: Types.ObjectId | null;

  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
RoleSchema.plugin(softDeletePlugin);
