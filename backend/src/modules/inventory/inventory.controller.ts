import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateMovementDto, MovementQueryDto } from './inventory.dto';
@ApiTags('Inventario')
@Controller('inventory/movements')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}
  @Get() @ApiOperation({ summary: 'Consultar historial paginado; filtro opcional por producto' })
  list(@Query() query: MovementQueryDto) { return this.service.list(query); }
  @Post() @ApiOperation({ summary: 'Registrar entrada o salida atómica de inventario' })
  create(@Body() dto: CreateMovementDto) { return this.service.create(dto); }
}
