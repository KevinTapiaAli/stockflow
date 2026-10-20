import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PageDto } from '../../common/dto';
import { SalesService } from './sales.service';
import { CancelSaleDto, CreateSaleDto } from './sales.dto';
@ApiTags('Ventas')
@Controller('sales')
export class SalesController {
  constructor(private readonly service: SalesService) {}
  @Get() @ApiOperation({ summary: 'Listar ventas paginadas, incluidas las anuladas' })
  list(@Query() query: PageDto) { return this.service.list(query); }
  @Get(':id') @ApiOperation({ summary: 'Detalle con precios históricos' })
  find(@Param('id', ParseUUIDPipe) id: string) { return this.service.find(id); }
  @Post() @ApiOperation({ summary: 'Confirmar venta transaccional; precios calculados en servidor' })
  create(@Body() dto: CreateSaleDto) { return this.service.create(dto); }
  @Patch(':id/cancel') @ApiOperation({ summary: 'Anular y restituir stock una sola vez; repetición devuelve 409' })
  cancel(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CancelSaleDto) { return this.service.cancel(id, dto); }
}
