import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';
import { Permission } from '../roles/enums/permission.enum.js';
import type { UserDocument } from './schemas/user.schema.js';
import { Types } from 'mongoose';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions(Permission.USER_CREATE)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService
      .createManagedUser(createUserDto)
      .then((user) => this.toPublicUser(user));
  }

  @Get()
  @RequirePermissions(Permission.USER_READ)
  findAll() {
    return this.usersService
      .findAll()
      .then((users) => users.map((user) => this.toPublicUser(user)));
  }

  @Get(':id')
  @RequirePermissions(Permission.USER_READ)
  findOne(@Param('id') id: string) {
    return this.usersService
      .findOne(id)
      .then((user) => this.toPublicUser(user));
  }

  @Patch(':id')
  @RequirePermissions(Permission.USER_UPDATE)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService
      .update(id, updateUserDto)
      .then((user) => this.toPublicUser(user));
  }

  @Delete(':id')
  @RequirePermissions(Permission.USER_DELETE)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  private toPublicUser(user: UserDocument) {
    const roleValue: unknown = user.role;
    const populatedRole =
      typeof roleValue === 'object' &&
      roleValue !== null &&
      'name' in roleValue &&
      typeof roleValue.name === 'string' &&
      '_id' in roleValue &&
      roleValue._id instanceof Types.ObjectId &&
      'permissions' in roleValue &&
      Array.isArray(roleValue.permissions)
        ? {
            id: roleValue._id.toHexString(),
            name: roleValue.name,
            permissions: roleValue.permissions.filter(
              (permission): permission is string =>
                typeof permission === 'string',
            ),
          }
        : null;
    const roleId = populatedRole?.id ?? user.role.toString();
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      role: populatedRole?.name ?? roleId,
      roleId,
      permissions: populatedRole?.permissions ?? [],
    };
  }
}
