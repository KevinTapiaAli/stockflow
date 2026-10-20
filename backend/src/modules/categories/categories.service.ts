import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly repository: CategoriesRepository) {}
  list() { return this.repository.list(); }
  async find(id: string) {
    const category = await this.repository.find(id);
    if (!category) throw new NotFoundException('Categoría no encontrada.');
    return category;
  }
  create(dto: CreateCategoryDto) { return this.repository.create({ ...dto, nameKey: dto.name.toLocaleLowerCase('es') }); }
  async update(id: string, dto: UpdateCategoryDto) {
    await this.find(id);
    return this.repository.update(id, { ...dto, ...(dto.name !== undefined ? { nameKey: dto.name.toLocaleLowerCase('es') } : {}) });
  }
  async delete(id: string) {
    const category = await this.find(id);
    if (category._count.products) throw new ConflictException('No se puede eliminar una categoría que contiene productos.');
    await this.repository.delete(id); // La FK protege también frente a inserciones concurrentes.
  }
}
