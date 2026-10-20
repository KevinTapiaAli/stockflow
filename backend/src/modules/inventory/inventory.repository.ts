import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { pageResult } from '../../common/dto';
import { MovementQueryDto } from './inventory.dto';

@Injectable()
export class InventoryRepository {
  constructor(private readonly db: PrismaService) {}
  async list(query: MovementQueryDto) {
    const where = { productId: query.productId };
    const [data, total] = await this.db.$transaction([
      this.db.inventoryMovement.findMany({ where, include: { product: true },
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], skip: (query.page - 1) * query.limit, take: query.limit }),
      this.db.inventoryMovement.count({ where }),
    ], { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
    return pageResult(data, total, query);
  }
  atomic<T>(work: (tx: Prisma.TransactionClient) => Promise<T>) { return this.db.atomic(work); }
}
