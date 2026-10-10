import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema.js';
import { DEFAULT_ROLES, RoleName } from './constants/default-roles.constant.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
  ) {}

  async findByName(name: string): Promise<RoleDocument | null> {
    return this.roleModel.findOne({ name }).exec();
  }

  async findById(id: string): Promise<RoleDocument | null> {
    return this.roleModel.findById(id).exec();
  }

  async findAll(): Promise<RoleDocument[]> {
    return this.roleModel.find().exec();
  }

  async create(createRoleDto: CreateRoleDto): Promise<RoleDocument> {
    return this.roleModel.create(createRoleDto);
  }

  async findOne(id: string): Promise<RoleDocument> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleDocument> {
    const role = await this.roleModel
      .findByIdAndUpdate(id, updateRoleDto, { new: true, runValidators: true })
      .exec();
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async remove(id: string): Promise<RoleDocument> {
    const role = await this.roleModel
      .findOneAndUpdate(
        { _id: id },
        { $set: { deleted_at: new Date() } },
        { new: true },
      )
      .exec();
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async getOrCreateRole(
    roleName: string = RoleName.STAFF,
  ): Promise<RoleDocument> {
    let role = await this.findByName(roleName);
    if (!role) {
      role = await this.roleModel
        .findOneAndUpdate(
          { name: roleName },
          { $set: { deleted_at: null } },
          { new: true },
        )
        .setOptions({ withDeleted: true })
        .exec();
    }
    if (!role) {
      const defaultRoleDef = DEFAULT_ROLES[roleName as RoleName];
      role = await this.roleModel.create({
        name: roleName,
        description: defaultRoleDef?.description || `${roleName} Role`,
        permissions: defaultRoleDef?.permissions || [],
      });
    }
    return role;
  }

  async seedDefaultRoles(): Promise<void> {
    try {
      for (const roleDef of Object.values(DEFAULT_ROLES)) {
        let existing = await this.findByName(roleDef.name);
        if (!existing) {
          existing = await this.roleModel
            .findOneAndUpdate(
              { name: roleDef.name },
              { $set: { deleted_at: null } },
              { new: true },
            )
            .setOptions({ withDeleted: true })
          .exec();
        }
        if (!existing) {
          await this.roleModel.create(roleDef);
          this.logger.log(`Default role seeded: ${roleDef.name}`);
        }
      }
    } catch (error) {
      this.logger.warn(
        `Could not seed default roles (database might not be connected yet): ${(error as Error).message}`,
      );
    }
  }
}
