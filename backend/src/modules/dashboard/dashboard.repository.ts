import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
@Injectable()
export class DashboardRepository {
  constructor(private readonly db: PrismaService) {}
  summary() {
    return this.db.$transaction(async (tx) => {
      const [products, categories, lowStock, sales, confirmedSales, amount, recentMovements, lowStockProducts] = await Promise.all([
        tx.product.count(), tx.category.count(),
        tx.product.count({ where: { active: true, stock: { lte: tx.product.fields.minStock } } }),
        tx.sale.count(), tx.sale.count({ where: { status: 'CONFIRMED' } }),
        tx.sale.aggregate({ where: { status: 'CONFIRMED' }, _sum: { total: true } }),
        tx.inventoryMovement.findMany({ take: 6, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], include: { product: true } }),
        tx.product.findMany({ where: { active: true, stock: { lte: tx.product.fields.minStock } },
          take: 6, orderBy: [{ stock: 'asc' }, { id: 'asc' }], include: { category: true } }),
      ]);
      return { products, categories, lowStock, sales, confirmedSales,
        totalRevenue: amount._sum.total ?? new Prisma.Decimal(0), recentMovements, lowStockProducts };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  }
}
