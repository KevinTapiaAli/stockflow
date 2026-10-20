import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InventoryRepository } from './inventory.repository';
import { CreateMovementDto, MovementQueryDto } from './inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly repository: InventoryRepository) {}
  list(query: MovementQueryDto) { return this.repository.list(query); }
  create(dto: CreateMovementDto) {
    return this.repository.atomic(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: dto.productId } });
      if (!product) throw new NotFoundException('Producto no encontrado.');
      if (!product.active) throw new ConflictException('Active el producto antes de registrar un movimiento manual.');
      const result = await tx.product.updateMany({
        where: { id: dto.productId, active: true, stock: dto.type === 'OUT' ? { gte: dto.quantity } : { lte: 1000000000 - dto.quantity } },
        data: { stock: dto.type === 'OUT' ? { decrement: dto.quantity } : { increment: dto.quantity } },
      });
      if (result.count !== 1) throw new ConflictException('Stock insuficiente o capacidad máxima excedida.');
      return tx.inventoryMovement.create({ data: dto, include: { product: true } });
    });
  }
}
