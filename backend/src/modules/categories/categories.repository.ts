import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly db: PrismaService) {}
  list() { return this.db.category.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { products: true } } } }); }
  find(id: string) { return this.db.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } }); }
  create(data: Prisma.CategoryCreateInput) { return this.db.category.create({ data }); }
  update(id: string, data: Prisma.CategoryUpdateInput) { return this.db.category.update({ where: { id }, data }); }
  delete(id: string) { return this.db.category.delete({ where: { id } }); }
}
