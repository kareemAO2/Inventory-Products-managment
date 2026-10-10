import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Permission } from '../roles/enums/permission.enum.js';
import { OrderStatus } from './enums/order-status.enum.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @RequirePermissions(Permission.ORDER_CREATE)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @RequirePermissions(Permission.ORDER_READ)
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @RequirePermissions(Permission.ORDER_READ)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @RequirePermissions(Permission.ORDER_APPROVE)
  @Patch(':id/approve')
  approve(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.ordersService.update(
      id,
      { status: OrderStatus.APPROVED },
      userId,
    );
  }

  @RequirePermissions(Permission.ORDER_CANCEL)
  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.ordersService.cancel(id);
  }

  @RequirePermissions(Permission.ORDER_SHIP)
  @Patch(':id/ship')
  ship(@Param('id') id: string) {
    return this.ordersService.ship(id);
  }

  @RequirePermissions(Permission.ORDER_DELETE)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
