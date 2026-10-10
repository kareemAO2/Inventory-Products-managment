import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrderItemsService } from './order-items.service.js';
import { CreateOrderItemDto } from './dto/create-order-item.dto.js';
import { UpdateOrderItemDto } from './dto/update-order-item.dto.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';
import { Permission } from '../roles/enums/permission.enum.js';

@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Post()
  @RequirePermissions(Permission.ORDER_CREATE)
  create(@Body() createOrderItemDto: CreateOrderItemDto) {
    return this.orderItemsService.create(createOrderItemDto);
  }

  @Get()
  @RequirePermissions(Permission.ORDER_READ)
  findAll() {
    return this.orderItemsService.findAll();
  }

  @Get(':id')
  @RequirePermissions(Permission.ORDER_READ)
  findOne(@Param('id') id: string) {
    return this.orderItemsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.ORDER_CREATE)
  update(@Param('id') id: string, @Body() updateOrderItemDto: UpdateOrderItemDto) {
    return this.orderItemsService.update(id, updateOrderItemDto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.ORDER_DELETE)
  remove(@Param('id') id: string) {
    return this.orderItemsService.remove(id);
  }
}
