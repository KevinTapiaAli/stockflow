import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardRepository } from './dashboard.repository';
@Injectable()
class DashboardService {
  constructor(private readonly repository: DashboardRepository) {}
  summary() { return this.repository.summary(); }
}
@ApiTags('Dashboard')
@Controller('dashboard')
class DashboardController {
  constructor(private readonly service: DashboardService) {}
  @Get('summary') @ApiOperation({ summary: 'Indicadores reales; ingresos excluyen ventas anuladas, bajo stock solo activos' })
  summary() { return this.service.summary(); }
}
@Module({ controllers: [DashboardController], providers: [DashboardService, DashboardRepository] })
export class DashboardModule {}
