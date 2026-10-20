import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from './products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly repository: ProductsRepository) {}
  list(query: ProductQueryDto) { return this.repository.list(query); }
  async find(id: string) {
    const product = await this.repository.find(id);
    if (!product) throw new NotFoundException('Producto no encontrado.');
    return product;
  }
  create(dto: CreateProductDto) {
    return this.repository.atomic(async (tx) => {
      if (!await tx.category.findUnique({ where: { id: dto.categoryId } })) throw new NotFoundException('Categoría no encontrada.');
      return tx.product.create({ data: {
        ...dto, ...(dto.stock ? { movements: { create: { type: 'IN', quantity: dto.stock, reason: 'Stock inicial' } } } : {}),
      }, include: { category: true } });
    });
  }
  update(id: string, dto: UpdateProductDto) {
    return this.repository.atomic(async (tx) => {
      if (!await tx.product.findUnique({ where: { id } })) throw new NotFoundException('Producto no encontrado.');
      if (dto.categoryId && !await tx.category.findUnique({ where: { id: dto.categoryId } })) throw new NotFoundException('Categoría no encontrada.');
      return tx.product.update({ where: { id }, data: dto, include: { category: true } });
    });
  }
  async delete(id: string) {
    await this.repository.atomic(async (tx) => {
      const product = await tx.product.findUnique({ where: { id }, include: { _count: { select: { movements: true, saleItems: true } } } });
      if (!product) throw new NotFoundException('Producto no encontrado.');
      if (product.stock || product._count.movements || product._count.saleItems) {
        throw new ConflictException('El producto tiene existencias o historial. Desactívelo para conservar la trazabilidad.');
      }
      await tx.product.delete({ where: { id } });
    });
  }
}
