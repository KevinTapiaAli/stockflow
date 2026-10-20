import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';

@ApiTags('Categorías')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}
  @Get() @ApiOperation({ summary: 'Listar categorías y cantidad de productos' })
  list() { return this.service.list(); }
  @Get(':id') @ApiOperation({ summary: 'Consultar categoría por UUID' })
  find(@Param('id', ParseUUIDPipe) id: string) { return this.service.find(id); }
  @Post() @ApiOperation({ summary: 'Crear categoría; nombre único sin distinguir mayúsculas' })
  create(@Body() dto: CreateCategoryDto) { return this.service.create(dto); }
  @Patch(':id') @ApiOperation({ summary: 'Actualizar categoría' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryDto) { return this.service.update(id, dto); }
  @Delete(':id') @HttpCode(204) @ApiOperation({ summary: 'Eliminar categoría vacía; 409 si tiene productos' })
  delete(@Param('id', ParseUUIDPipe) id: string) { return this.service.delete(id); }
}
