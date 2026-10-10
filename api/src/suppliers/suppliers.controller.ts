import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service.js';
import { CreateSupplierDto } from './dto/create-supplier.dto.js';
import { UpdateSupplierDto } from './dto/update-supplier.dto.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';
import { Permission } from '../roles/enums/permission.enum.js';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @RequirePermissions(Permission.SUPPLIER_CREATE)
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  @RequirePermissions(Permission.SUPPLIER_READ)
  findAll() {
    return this.suppliersService.findAll();
  }

  @Get(':id')
  @RequirePermissions(Permission.SUPPLIER_READ)
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.SUPPLIER_UPDATE)
  update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.SUPPLIER_DELETE)
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}
