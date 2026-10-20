# Contrato REST de StockFlow

Base local: `http://localhost:8080/api`. Swagger: `/api/docs`; OpenAPI JSON: `/api/docs-json`. No requiere token; es una demostración local sin autenticación. Todos los cuerpos son JSON. Los UUID de este documento son ilustrativos: usar los devueltos por la API.

## Convenciones

- UUID como cadenas. Fechas ISO 8601 en UTC; la interfaz las presenta en la zona horaria del navegador.
- Dinero en bolivianos (BOB) como **cadenas decimales de dos posiciones** en respuestas: `"25.50"`. Las peticiones de precio admiten hasta ocho enteros y dos decimales, sin separadores de miles. PostgreSQL y Prisma mantienen aritmética decimal.
- Cantidades como enteros. Stock y mínimo: 0 a 1.000.000.000. Movimiento manual: 1 a 1.000.000. Venta: 1 a 10.000 unidades por producto y máximo 50 productos distintos.
- Propiedades adicionales y valores `null` no admitidos se rechazan con 400. Los PATCH aceptan campos omitidos; un cuerpo vacío no modifica datos.
- Nombres y descripciones se recortan. Categorías únicas sin distinguir mayúsculas; SKU normalizado a mayúsculas, caracteres `A-Z`, dígitos, `_` y `-`.
- `page=1`, `limit=10` por defecto. `limit` máximo 100, `page` máximo 100.000.
- Sin eliminación de ventas ni movimientos. Producto con historial: DELETE devuelve 409; usar PATCH `{"active":false}`. Producto nuevo sin stock ni historial: DELETE 204.

## Endpoints

| Método | Ruta | Parámetros / cuerpo | Éxito | Errores relevantes |
|---|---|---|---|---|
| GET | `/categories` | Sin parámetros | 200, arreglo | 500 |
| GET | `/categories/:id` | UUID | 200, categoría con `_count.products` | 400, 404 |
| POST | `/categories` | `name`, `description?` | 201, categoría | 400, 409 |
| PATCH | `/categories/:id` | Campos opcionales de categoría | 200 | 400, 404, 409 |
| DELETE | `/categories/:id` | Categoría sin productos | 204, sin cuerpo | 404, 409 |
| GET | `/products` | `search?`, `categoryId?`, `active=true/false?`, `page?`, `limit?` | 200, página | 400 |
| GET | `/products/:id` | UUID | 200, producto y categoría | 400, 404 |
| POST | `/products` | `name`, `sku`, `price`, `categoryId`, `description?`, `stock?`, `minStock?`, `active?` | 201 | 400, 404, 409 |
| PATCH | `/products/:id` | Campos opcionales del producto, **excepto stock** | 200 | 400, 404, 409 |
| DELETE | `/products/:id` | Sin stock, movimientos ni ventas | 204, sin cuerpo | 404, 409 |
| GET | `/inventory/movements` | `productId?`, `page?`, `limit?` | 200, página | 400 |
| POST | `/inventory/movements` | `productId`, `type: IN/OUT`, `quantity`, `reason` | 201, movimiento con producto | 400, 404, 409 |
| GET | `/sales` | `page?`, `limit?` | 200, página; `_count.items` | 400 |
| GET | `/sales/:id` | UUID | 200, venta con `items` | 400, 404 |
| POST | `/sales` | `customer`, `items: [{productId, quantity}]` | 201, venta con `items` | 400, 404, 409 |
| PATCH | `/sales/:id/cancel` | `reason` | 200, venta anulada | 400, 404, 409 |
| GET | `/dashboard/summary` | Sin parámetros | 200, indicadores | 500 |
| GET | `/health` | Sin parámetros | 200, consulta real a BD | 503 |
| GET | `/docs` | Interfaz Swagger | 200 HTML | 503 |
| GET | `/docs-json` | Especificación OpenAPI | 200 JSON | 503 |
| GET | `/gateway-health` **fuera de `/api`** | Salud Nginx | 200 JSON | — |

Los endpoints API pueden devolver 429 por límite de solicitudes y 503 si el Gateway no alcanza el backend. Los errores de validación y negocio mantienen su código. Nginx transforma indisponibilidad 502/503/504 en una respuesta pública 503 JSON.

## Peticiones

Crear categoría:

```json
{"name":"Tecnología","description":"Accesorios para oficina"}
```

Crear producto (reemplazar el UUID):

```json
{"name":"Mouse inalámbrico","sku":"TEC-100","price":"95.50","stock":12,"minStock":5,"categoryId":"11111111-1111-4111-8111-111111111111"}
```

Actualizar producto:

```json
{"price":"99.00","active":true}
```

Entrada de inventario:

```json
{"productId":"22222222-2222-4222-8222-222222222222","type":"IN","quantity":5,"reason":"Reposición de proveedor"}
```

Venta:

```json
{"customer":"Cliente de mostrador","items":[{"productId":"22222222-2222-4222-8222-222222222222","quantity":2}]}
```

No se reciben precios ni totales desde el navegador. Una venta con un producto sin stock se revierte por completo. Los precios, nombres y SKU quedan copiados en SaleItem para preservar el detalle histórico.

Anulación:

```json
{"reason":"Solicitud del cliente"}
```

Una segunda anulación devuelve 409 y no repone existencias. También se permite restituir stock a productos que fueron desactivados después de la venta.

## Respuestas ilustrativas, no evidencias

Página vacía:

```json
{"data":[],"meta":{"total":0,"page":1,"limit":10,"totalPages":0}}
```

Detalle de venta, ejemplo parcial de los campos monetarios:

```json
{
  "id":"33333333-3333-4333-8333-333333333333",
  "customer":"Cliente de mostrador",
  "total":"191.00",
  "status":"CONFIRMED",
  "createdAt":"2026-10-20T16:00:00.000Z",
  "cancelledAt":null,
  "cancellationReason":null,
  "items":[{
    "id":"44444444-4444-4444-8444-444444444444",
    "saleId":"33333333-3333-4333-8333-333333333333",
    "productId":"22222222-2222-4222-8222-222222222222",
    "productName":"Mouse inalámbrico",
    "sku":"TEC-100",
    "quantity":2,
    "unitPrice":"95.50",
    "subtotal":"191.00"
  }]
}
```

Error de negocio:

```json
{
  "statusCode":409,
  "message":"Stock insuficiente para Mouse inalámbrico.",
  "path":"/api/sales",
  "timestamp":"2026-10-20T16:00:00.000Z",
  "requestId":"identificador-de-la-solicitud"
}
```

En validación, `message` puede ser un arreglo de mensajes. Gateway usa `{statusCode,message,requestId}` para 429/503. Otros errores generados directamente por Nginx, como cuerpo mayor de 1 MB (413), pueden devolver HTML; el cliente Fetch tiene un mensaje alternativo.

Dashboard:

```json
{
  "products":6,"categories":3,"lowStock":2,"sales":0,"confirmedSales":0,
  "totalRevenue":"0.00","recentMovements":[],"lowStockProducts":[]
}
```

Es un ejemplo de estructura, no una salida capturada. Los arreglos contienen hasta seis movimientos/productos. `products` incluye inactivos; `lowStock` cuenta solo activos con `stock <= minStock`; `sales` incluye anuladas; ingresos excluyen anuladas.
