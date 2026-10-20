import { Controller, Get, Module, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DatabaseModule } from './database/database.module';
import { PrismaService } from './database/prisma.service';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SalesModule } from './modules/sales/sales.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@ApiTags('Salud')
@Controller('health')
class HealthController {
  constructor(private readonly prisma: PrismaService) {}
  @Get()
  @ApiOperation({ summary: 'Comprueba el backend y una consulta real a PostgreSQL' })
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'up', timestamp: new Date().toISOString() };
    } catch { throw new ServiceUnavailableException('Base de datos no disponible.'); }
  }
}
@Module({
  imports: [DatabaseModule, CategoriesModule, ProductsModule, InventoryModule, SalesModule, DashboardModule],
  controllers: [HealthController],
})
export class AppModule {}
