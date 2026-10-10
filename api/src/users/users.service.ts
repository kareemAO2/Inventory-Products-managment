import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { User, UserDocument } from './schemas/user.schema.js';
import { Role, type RoleDocument } from '../roles/schemas/role.schema.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';

const objectIdSchema = z.union([
  z.instanceof(Types.ObjectId),
  z.string().regex(/^[\da-f]{24}$/i, 'Must be a valid ID'),
]);
const emailSchema = z.string().trim().email('Must be a valid email address');
const createUserSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    email: emailSchema,
    passwordHash: z.string().min(1, 'Password is required'),
    role: objectIdSchema,
    isActive: z.boolean().optional(),
    created_by: objectIdSchema.nullable().optional(),
    updated_by: objectIdSchema.nullable().optional(),
  })
  .strict();
const updateUserSchema = z
  .object({
    name: z.string().trim().min(1, 'Name cannot be empty').optional(),
    email: emailSchema.optional(),
    role: objectIdSchema.optional(),
  })
  .strict()
  .refine((user) => Object.keys(user).length > 0, {
    message: 'At least one user field must be provided',
  });

export type PopulatedUser = Omit<UserDocument, 'role'> & {
  role?: RoleDocument;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
  ) {}

  async create(userData: Partial<User>): Promise<UserDocument> {
    createUserSchema.parse(userData);
    return this.userModel.create(userData);
  }

  async createManagedUser(input: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): Promise<UserDocument> {
    const passwordHash = await bcrypt.hash(input.password, 10);
    return this.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      role: new Types.ObjectId(input.role),
      isActive: true,
    });
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    emailSchema.parse(email);
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByEmailWithRole(email: string): Promise<PopulatedUser | null> {
    emailSchema.parse(email);
    const user = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .populate('role')
      .exec();
    return user as unknown as PopulatedUser | null;
  }

  async findByIdWithRole(id: string): Promise<PopulatedUser | null> {
    objectIdSchema.parse(id);
    const user = await this.userModel.findById(id).populate('role').exec();
    return user as unknown as PopulatedUser | null;
  }

  async addRefreshSession(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    const now = new Date();
    await this.userModel
      .updateOne(
        { _id: userId },
        {
          $pull: { refreshSessions: { expiresAt: { $lte: now } } },
        },
      )
      .exec();
    await this.userModel
      .updateOne(
        { _id: userId },
        { $push: { refreshSessions: { tokenHash, expiresAt } } },
      )
      .exec();
  }

  async rotateRefreshSession(
    userId: string,
    oldTokenHash: string,
    newTokenHash: string,
    expiresAt: Date,
  ): Promise<boolean> {
    const result = await this.userModel
      .updateOne(
        {
          _id: userId,
          refreshSessions: {
            $elemMatch: {
              tokenHash: oldTokenHash,
              expiresAt: { $gt: new Date() },
            },
          },
        },
        {
          $set: {
            'refreshSessions.$.tokenHash': newTokenHash,
            'refreshSessions.$.expiresAt': expiresAt,
          },
        },
      )
      .exec();

    return result.modifiedCount === 1;
  }

  async removeRefreshSession(tokenHash: string): Promise<void> {
    await this.userModel
      .updateMany(
        { 'refreshSessions.tokenHash': tokenHash },
        { $pull: { refreshSessions: { tokenHash } } },
      )
      .exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel
      .find({ deleted_at: null })
      .populate('role')
      .exec();
  }

  async findOne(id: string): Promise<UserDocument> {
    objectIdSchema.parse(id);
    const user = await this.userModel
      .findOne({ _id: id, deleted_at: null })
      .populate('role')
      .exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    objectIdSchema.parse(id);
    updateUserSchema.parse(updateUserDto);
    const updated = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .populate('role')
      .exec();
    if (!updated) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    objectIdSchema.parse(id);
    const result = await this.userModel
      .findOneAndUpdate(
        { _id: id },
        { $set: { deleted_at: new Date() } },
        { new: true },
      )
      .exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { deleted: true };
  }
}
