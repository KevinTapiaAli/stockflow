import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ProductQueryDto } from './products.dto';
import { pageResult } from '../../common/dto';

@Injectable()
export class ProductsRepository {
  constructor(private readonly db: PrismaService) {}
  async list(query: ProductQueryDto) {
    const where: Prisma.ProductWhereInput = {
      categoryId: query.categoryId,
      ...(query.active !== undefined ? { active: query.active === 'true' } : {}),
      ...(query.search ? { OR: [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ] } : {}),
    };
    const [data, total] = await this.db.$transaction([
      this.db.product.findMany({ where, include: { category: true }, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (query.page - 1) * query.limit, take: query.limit }),
      this.db.product.count({ where }),
    ], { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
    return pageResult(data, total, query);
  }
  find(id: string) { return this.db.product.findUnique({ where: { id }, include: { category: true } }); }
  atomic<T>(work: (tx: Prisma.TransactionClient) => Promise<T>) { return this.db.atomic(work); }
}
