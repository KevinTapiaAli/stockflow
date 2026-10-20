const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Una sola transacción; no restablece stock, precios ni nombres existentes.
  await prisma.$transaction(async (tx) => {
    const categories = [
      ['Tecnología', 'Accesorios y equipos para el trabajo diario'],
      ['Papelería', 'Material de escritorio y organización'],
      ['Oficina', 'Complementos para espacios de trabajo'],
    ];
    const ids = [];
    for (const [name, description] of categories) {
      const category = await tx.category.upsert({
        where: { nameKey: name.toLocaleLowerCase('es') },
        update: {},
        create: { name, nameKey: name.toLocaleLowerCase('es'), description },
      });
      ids.push(category.id);
    }
    const products = [
      ['TEC-001', 'Teclado inalámbrico', '185.00', 24, 8, 0],
      ['TEC-002', 'Mouse ergonómico', '95.50', 6, 10, 0],
      ['TEC-003', 'Hub USB de 4 puertos', '120.00', 15, 5, 0],
      ['PAP-001', 'Cuaderno ejecutivo', '32.50', 48, 12, 1],
      ['PAP-002', 'Set de bolígrafos', '18.00', 5, 10, 1],
      ['OFI-001', 'Organizador de escritorio', '65.00', 18, 5, 2],
    ];
    for (const [sku, name, price, stock, minStock, category] of products) {
      if (await tx.product.findUnique({ where: { sku } })) continue;
      await tx.product.create({
        data: {
          sku, name, price, stock, minStock, categoryId: ids[category],
          description: 'Producto de demostración académica.',
          movements: { create: { type: 'IN', quantity: stock, reason: 'Carga inicial de demostración' } },
        },
      });
    }
  });
  console.log('Seed completado: registros ausentes agregados; datos existentes conservados.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
