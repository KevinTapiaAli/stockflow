import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { PageDto, pageResult } from '../../common/dto';
@Injectable()
export class SalesRepository {
  constructor(private readonly db: PrismaService) {}
  async list(query: PageDto) {
    const [data, total] = await this.db.$transaction([
      this.db.sale.findMany({ include: { _count: { select: { items: true } } },
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], skip: (query.page - 1) * query.limit, take: query.limit }),
      this.db.sale.count(),
    ], { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
    return pageResult(data, total, query);
  }
  find(id: string) { return this.db.sale.findUnique({ where: { id }, include: { items: true } }); }
  atomic<T>(work: (tx: Prisma.TransactionClient) => Promise<T>) { return this.db.atomic(work); }
}
