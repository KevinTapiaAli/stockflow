import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PageDto } from '../../common/dto';
import { SalesRepository } from './sales.repository';
import { CancelSaleDto, CreateSaleDto } from './sales.dto';

@Injectable()
export class SalesService {
  constructor(private readonly repository: SalesRepository) {}
  list(query: PageDto) { return this.repository.list(query); }
  async find(id: string) {
    const sale = await this.repository.find(id);
    if (!sale) throw new NotFoundException('Venta no encontrada.');
    return sale;
  }
  create(dto: CreateSaleDto) {
    if (new Set(dto.items.map((item) => item.productId)).size !== dto.items.length) {
      throw new BadRequestException('No repita productos: agrupe las cantidades en una sola línea.');
    }
    return this.repository.atomic(async (tx) => {
      let total = new Prisma.Decimal(0);
      const items: Prisma.SaleItemCreateWithoutSaleInput[] = [];
      // Orden estable para reducir bloqueos cruzados entre ventas concurrentes.
      for (const item of [...dto.items].sort((a, b) => a.productId.localeCompare(b.productId))) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new NotFoundException(`Producto ${item.productId} no encontrado.`);
        if (!product.active) throw new ConflictException(`${product.name} está inactivo.`);
        const changed = await tx.product.updateMany({
          where: { id: product.id, active: true, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (changed.count !== 1) throw new ConflictException(`Stock insuficiente para ${product.name}.`);
        const subtotal = product.price.mul(item.quantity);
        total = total.add(subtotal);
        items.push({ product: { connect: { id: product.id } }, productName: product.name,
          sku: product.sku, quantity: item.quantity, unitPrice: product.price, subtotal });
      }
      if (total.greaterThan('999999999999.99')) throw new BadRequestException('El total de la venta excede el límite monetario.');
      const sale = await tx.sale.create({ data: { customer: dto.customer, total, items: { create: items } }, include: { items: true } });
      await tx.inventoryMovement.createMany({ data: sale.items.map((item) => ({
        productId: item.productId, type: 'SALE', quantity: item.quantity,
        reason: 'Venta confirmada', saleId: sale.id,
      })) });
      return sale;
    });
  }
  cancel(id: string, dto: CancelSaleDto) {
    return this.repository.atomic(async (tx) => {
      const sale = await tx.sale.findUnique({ where: { id }, include: { items: true } });
      if (!sale) throw new NotFoundException('Venta no encontrada.');
      if (sale.status === 'CANCELLED') throw new ConflictException('La venta ya fue anulada; no se restituyó stock nuevamente.');
      const changed = await tx.sale.updateMany({ where: { id, status: 'CONFIRMED' },
        data: { status: 'CANCELLED', cancelledAt: new Date(), cancellationReason: dto.reason } });
      if (changed.count !== 1) throw new ConflictException('La venta ya fue anulada.');
      for (const item of [...sale.items].sort((a, b) => a.productId.localeCompare(b.productId))) {
        const restored = await tx.product.updateMany({
          where: { id: item.productId, stock: { lte: 1000000000 - item.quantity } },
          data: { stock: { increment: item.quantity } },
        });
        if (restored.count !== 1) throw new ConflictException('La restitución excede la capacidad máxima de inventario.');
        await tx.inventoryMovement.create({ data: { productId: item.productId, type: 'CANCELLATION',
          quantity: item.quantity, reason: dto.reason, saleId: id } });
      }
      return tx.sale.findUniqueOrThrow({ where: { id }, include: { items: true } });
    });
  }
}
