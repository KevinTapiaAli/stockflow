import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from './products.dto';

@ApiTags('Productos')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}
  @Get() @ApiOperation({ summary: 'Buscar por nombre/SKU, filtrar y paginar productos' })
  list(@Query() query: ProductQueryDto) { return this.service.list(query); }
  @Get(':id') @ApiOperation({ summary: 'Consultar producto por UUID' })
  find(@Param('id', ParseUUIDPipe) id: string) { return this.service.find(id); }
  @Post() @ApiOperation({ summary: 'Crear producto y movimiento inicial si stock > 0' })
  create(@Body() dto: CreateProductDto) { return this.service.create(dto); }
  @Patch(':id') @ApiOperation({ summary: 'Actualizar producto; stock se modifica mediante inventario' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) { return this.service.update(id, dto); }
  @Delete(':id') @HttpCode(204) @ApiOperation({ summary: 'Eliminar producto sin historial y sin existencias' })
  delete(@Param('id', ParseUUIDPipe) id: string) { return this.service.delete(id); }
}
