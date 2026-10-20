# Evidencias reales pendientes

Esta carpeta no contiene capturas ni logs fabricados. Ejecutar el sistema manualmente antes de completar las evidencias. Anotar fecha, entorno, versión Docker y commit real.

| Archivo sugerido | Qué mostrar | Criterio |
|---|---|---|
| `01-docker-desktop.png` | Tres contenedores de StockFlow | Contenerización |
| `02-compose-ps.txt` | `docker compose ps`, estado healthy y solo puerto 8080 | Arranque y aislamiento |
| `03-gateway-logs.txt` | `docker compose logs --tail=40 gateway` con requestId y upstream | Logging y proxy |
| `04-backend-logs.txt` | Logs de NestJS y petición correlacionada | Backend |
| `05-swagger.png` | `/api/docs` y grupos reales | Documentación API |
| `06-postman-crud.png` | Crear, consultar, editar y eliminar producto sin historial | CRUD |
| `07-frontend.png` | Dashboard con datos reales y tabla de productos | Interfaz |
| `08-venta-stock.png` | Stock antes/después y detalle con total calculado | Transacción |
| `09-anulacion.png` | Restitución y segundo intento 409 sin nueva reposición | Integridad |
| `10-rate-limit.txt` | Respuestas 429 generadas por el script manual | Gateway |
| `11-persistencia.png` | Mismo producto antes y después de down/up **sin -v** | Persistencia |
| `12-git-flow.png` | Ramas e historial auténticos de GitHub | Entrega |

## Escenarios adicionales

1. Crear categoría duplicada variando mayúsculas: 409.
2. Crear producto con precio negativo, stock decimal o campos extra: 400.
3. Intentar borrar categoría con producto: 409.
4. Salida superior al stock: 409 y stock inalterado.
5. Venta con dos productos: uno disponible y otro insuficiente. Verificar que ninguno cambió de stock y que no apareció una venta parcial.
6. Enviar dos ventas simultáneas que compitan por la última unidad: solo una puede consumirla.
7. Enviar dos anulaciones simultáneas: solo una debe restituir unidades; la otra debe responder 409.
8. Consultar rutas inexistentes API: 404; rutas UI: página 404.
9. Recargar directamente `/products` o `/sales/<uuid>`: Nginx entrega la SPA.
10. Detener backend después del arranque: Gateway responde 503 JSON. Volver a iniciarlo.
11. OPTIONS con Origin permitido: 204 y una sola cabecera Allow-Origin. Origin distinto: sin cabecera de autorización CORS.

No confundir estos resultados esperados con resultados ejecutados. Registrar el estado observado y cualquier desviación; pegar las evidencias seleccionadas en el informe antes de exportar el PDF.
