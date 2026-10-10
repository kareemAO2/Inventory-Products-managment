import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSupplierDto } from './dto/create-supplier.dto.js';
import { UpdateSupplierDto } from './dto/update-supplier.dto.js';
import { Supplier, SupplierDocument } from './schemas/supplier.schema.js';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<SupplierDocument>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto) {
    return await this.supplierModel.create(createSupplierDto);
  }

  async findAll() {
    return this.supplierModel.find({ deleted_at: null }).exec();
  }

  async findOne(id: string) {
    const supplier = await this.supplierModel
      .findOne({ _id: id, deleted_at: null })
      .exec();
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    const supplier = await this.supplierModel
      .findOneAndUpdate(
        { _id: id, deleted_at: null },
        updateSupplierDto,
        { new: true },
      )
      .exec();

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  async remove(id: string) {
    const supplier = await this.supplierModel
      .findOneAndUpdate(
        { _id: id, deleted_at: null },
        { $set: { deleted_at: new Date() } },
        { new: true },
      )
      .exec();
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }
}
