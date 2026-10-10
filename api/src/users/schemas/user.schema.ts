import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Role } from '../../roles/schemas/role.schema.js';
import { softDeletePlugin } from '../../common/schemas/soft-delete.plugin.js';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Role.name,
    required: true,
    index: true,
  })
  role: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: [
      {
        _id: false,
        tokenHash: { type: String, required: true },
        expiresAt: { type: Date, required: true },
      },
    ],
    default: [],
  })
  refreshSessions: { tokenHash: string; expiresAt: Date }[];

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

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(softDeletePlugin);
