import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function request(name, method, path, body, status = 200, save) {
  const tests = [`pm.test("HTTP ${status}", () => pm.response.to.have.status(${status}));`];
  if (save) tests.push(`if (pm.response.code === ${status}) pm.collectionVariables.set("${save}", pm.response.json().id);`);
  const item = {
    name,
    request: {
      method,
      header: [{ key: 'Accept', value: 'application/json' }, ...(body ? [{ key: 'Content-Type', value: 'application/json' }] : [])],
      url: { raw: `{{baseUrl}}${path}`, host: ['{{baseUrl}}'], path: path.slice(1).split('?')[0].split('/') },
      ...(body ? { body: { mode: 'raw', raw: JSON.stringify(body, null, 2), options: { raw: { language: 'json' } } } } : {}),
      description: 'Demostración manual. Crea o modifica datos reales cuando corresponde.',
    },
    event: [{ listen: 'test', script: { type: 'text/javascript', exec: tests } }],
  };
  if (path.includes('?')) item.request.url.query = [...new URL(`http://localhost${path}`).searchParams].map(([key, value]) => ({ key, value }));
  return item;
}
function category(name) {
  const item = request('Crear categoría', 'POST', '/api/categories', { name: `${name} {{suffix}}`, description: 'Demostración Postman' }, 201, 'categoryId');
  item.event.push({ listen: 'prerequest', script: { type: 'text/javascript', exec: ['pm.collectionVariables.set("suffix", Date.now().toString());'] } });
  return item;
}
const product = (name, sku) => request('Crear producto con stock cero', 'POST', '/api/products', {
  name, sku: `${sku}-{{suffix}}`, price: '25.50', stock: 0, minStock: 3, categoryId: '{{categoryId}}',
}, 201, 'productId');
const collection = {
  info: { name: 'StockFlow — Segundo Parcial', description: 'Ejecutar carpetas en orden. Variables UUID guardadas automáticamente. Sin autenticación; entorno local. Esta colección no fue ejecutada durante la generación.', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
  variable: [{ key: 'baseUrl', value: 'http://localhost:8080' }, ...['categoryId', 'productId', 'saleId', 'suffix'].map((key) => ({ key, value: '' }))],
  item: [
    { name: '00 Salud', item: [request('Gateway', 'GET', '/gateway-health'), request('Backend y BD', 'GET', '/api/health')] },
    { name: '01 CRUD sin historial', item: [
      category('CRUD'), request('Listar categorías', 'GET', '/api/categories'),
      request('Consultar categoría', 'GET', '/api/categories/{{categoryId}}'),
      request('Editar categoría', 'PATCH', '/api/categories/{{categoryId}}', { description: 'Descripción actualizada' }),
      product('Producto eliminable', 'DEL'),
      request('Listar productos', 'GET', '/api/products?page=1&limit=10'),
      request('Consultar producto', 'GET', '/api/products/{{productId}}'),
      request('Editar producto', 'PATCH', '/api/products/{{productId}}', { name: 'Producto actualizado', price: '28.00' }),
      request('Eliminar producto', 'DELETE', '/api/products/{{productId}}', undefined, 204),
      request('Eliminar categoría vacía', 'DELETE', '/api/categories/{{categoryId}}', undefined, 204),
    ] },
    { name: '02 Operaciones con historial', item: [
      category('Operaciones'), product('Producto con historial', 'MOV'),
      request('Entrada de diez unidades', 'POST', '/api/inventory/movements', { productId: '{{productId}}', type: 'IN', quantity: 10, reason: 'Reposición de demostración' }, 201),
      request('Consultar movimientos', 'GET', '/api/inventory/movements'),
      request('Confirmar venta de dos unidades', 'POST', '/api/sales', { customer: 'Cliente de demostración', items: [{ productId: '{{productId}}', quantity: 2 }] }, 201, 'saleId'),
      request('Consultar stock después de venta (esperado 8)', 'GET', '/api/products/{{productId}}'),
      request('Listar ventas', 'GET', '/api/sales'),
      request('Detalle de venta (total esperado 51.00)', 'GET', '/api/sales/{{saleId}}'),
      request('Anular venta', 'PATCH', '/api/sales/{{saleId}}/cancel', { reason: 'Solicitud del cliente' }),
      request('Repetir anulación (409 esperado)', 'PATCH', '/api/sales/{{saleId}}/cancel', { reason: 'Segundo intento' }, 409),
      request('Consultar stock restituido (esperado 10)', 'GET', '/api/products/{{productId}}'),
      request('Proteger producto con historial (409 esperado)', 'DELETE', '/api/products/{{productId}}', undefined, 409),
      request('Salida superior al stock (409 esperado)', 'POST', '/api/inventory/movements', { productId: '{{productId}}', type: 'OUT', quantity: 999, reason: 'Prueba de stock insuficiente' }, 409),
      request('Dashboard', 'GET', '/api/dashboard/summary'),
    ] },
  ],
};
writeFileSync(resolve(root, 'docs/api/StockFlow.postman_collection.json'), JSON.stringify(collection, null, 2) + '\n');
console.log('Colección Postman generada. No se ejecutaron solicitudes.');
