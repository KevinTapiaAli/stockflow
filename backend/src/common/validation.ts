import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
const labels: Record<string, string> = {
  name: 'nombre', sku: 'SKU', description: 'descripción', price: 'precio', stock: 'stock',
  minStock: 'stock mínimo', active: 'estado activo', categoryId: 'categoría', productId: 'producto',
  type: 'tipo', quantity: 'cantidad', reason: 'motivo', customer: 'cliente', items: 'productos',
  page: 'página', limit: 'tamaño de página', search: 'búsqueda',
};
export function validationException(errors: ValidationError[]) {
  const messages: string[] = [];
  function visit(error: ValidationError, prefix = '') {
    const label = `${prefix}${labels[error.property] ?? error.property}`;
    if (error.constraints) {
      messages.push(error.constraints.whitelistValidation
        ? `El campo «${label}» no está permitido en esta operación.`
        : `El campo «${label}» es obligatorio o tiene un formato/rango inválido. Consulte los límites en la documentación de la API.`);
    }
    error.children?.forEach((child) => visit(child, `${label} / `));
  }
  errors.forEach((error) => visit(error));
  return new BadRequestException(messages);
}
