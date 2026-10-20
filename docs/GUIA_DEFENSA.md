# Guía de defensa — StockFlow

**Estudiante:** Kevin Tapia Ali

**Docente:** Ing. Miguel A. Pacheco

**Materia:** Tecnologías Web II — Segundo Parcial

## 1. Explicación del proyecto en treinta segundos

“StockFlow ayuda a una pequeña empresa a controlar productos, existencias y ventas. React presenta la interfaz; todas sus solicitudes pasan por Nginx. Nginx actúa como API Gateway y reenvía la API a NestJS. NestJS valida las solicitudes, aplica las reglas y guarda datos en PostgreSQL mediante Prisma. Las ventas descuentan inventario dentro de una transacción y las anulaciones lo restituyen una sola vez.”

## 2. Conceptos esenciales

| Concepto | Explicación sencilla | Dónde se ve |
|---|---|---|
| API Gateway | Puerta de entrada común que dirige las solicitudes y aplica reglas compartidas | Servicio gateway y puerto 8080 |
| Proxy inverso | Servidor que recibe una solicitud y la entrega a un servidor interno por cuenta del cliente | `proxy_pass` a backend:3000 |
| Nginx | Servidor HTTP utilizado como proxy y servidor de archivos estáticos | gateway/nginx.conf |
| CORS | Regla que indica al navegador qué origen puede leer una respuesta desde otro origen | `map $http_origin` y cabeceras |
| Rate limiting | Límite de solicitudes por unidad de tiempo para evitar ráfagas excesivas | 10 r/s, burst 40, respuesta 429 |
| Logging | Registro de solicitudes y errores que permite investigar lo sucedido | Logs JSON del Gateway y logs HTTP NestJS |
| Microservicio | Aplicación desplegable con una responsabilidad de negocio delimitada | backend: dominio de inventario y ventas |
| NestJS | Framework de Node que organiza la API en módulos, controllers y servicios | AppModule y módulos de negocio |
| TypeScript | JavaScript con comprobación estática de tipos | Archivos .ts/.tsx y configuración strict |
| DTO | Estructura que define los datos permitidos en una petición | CreateProductDto y CreateSaleDto |
| Dependency Injection | NestJS crea y suministra las dependencias que necesita cada clase | Constructor que recibe un service o repository |
| Repository Pattern | Capa que concentra el acceso a persistencia y las operaciones de transacción | ProductsRepository, SalesRepository |
| Prisma | ORM y herramienta de migraciones que conectan TypeScript con PostgreSQL | schema.prisma y PrismaService |
| PostgreSQL | Base relacional que protege relaciones, tipos e integridad | Tablas, FK, índices y CHECK |
| Docker | Tecnología para empaquetar una aplicación con sus dependencias | Dockerfiles multietapa |
| Docker Compose | Descripción y coordinación de varios servicios relacionados | docker-compose.yml |
| Red bridge | Red virtual compartida por los contenedores | stockflow, DNS db y backend |
| depends_on | Dependencia de arranque; aquí espera healthchecks saludables | db → backend → gateway |
| healthcheck | Comprobación periódica del estado de un servicio | pg_isready, /api/health, /gateway-health |
| Volumen | Almacenamiento que persiste al recrear contenedores | postgres_data |
| Migración | Cambio de esquema versionado y aplicado de forma controlada | prisma/migrations |
| Seed | Carga inicial reproducible de datos de demostración | seed.cjs |
| Transacción | Conjunto de cambios que se confirman todos o se revierten todos | Registro y anulación de venta |
| OpenAPI / Swagger | Contrato de la API y su interfaz interactiva | /api/docs y /api/docs-json |

Un microservicio no necesita dividirse en muchos procesos para cumplir este alcance. Los cinco módulos son partes internas del mismo servicio NestJS.

## 3. Recorrido de una petición

Ejemplo: registrar una entrada de cinco unidades.

1. El usuario elige producto, tipo Entrada, cantidad 5 y motivo.
2. React valida el formulario y envía POST `/api/inventory/movements` mediante el cliente Fetch centralizado.
3. Nginx registra la solicitud, aplica el límite y reenvía el mismo método y JSON.
4. ValidationPipe verifica que solo estén presentes los campos admitidos y que sus valores sean válidos.
5. InventoryController delega al service. El service abre una operación transaccional a través del repository.
6. Prisma incrementa stock y crea el movimiento dentro de una transacción.
7. PostgreSQL confirma ambos cambios. Si hay un error, ninguno queda persistido.
8. NestJS devuelve 201 JSON. Nginx añade cabeceras y React muestra confirmación y recarga el listado.

En un POST de venta, el cliente manda producto y cantidad. El precio viene de la BD. El navegador no puede forzar un precio más bajo añadiendo `total` o `unitPrice`: el DTO rechaza esos campos.

## 4. Cómo demostrar CRUD

Antes de la defensa, probar la secuencia y conservar las capturas reales:

1. Crear una categoría nueva en Swagger o en la interfaz.
2. Crear un producto con SKU único, precio y stock inicial **0**.
3. Consultarlo por ID; buscarlo por SKU desde la interfaz.
4. Editar nombre, descripción o precio.
5. Eliminarlo: debe responder 204 porque no tiene historial.
6. Eliminar la categoría vacía.
7. Crear otro producto y registrar una entrada de stock.
8. Intentar eliminar ese producto: el 409 demuestra conservación del historial.
9. Desactivarlo desde Editar.

No elegir un producto del seed para demostrar DELETE exitoso: estos productos tienen movimientos iniciales y se protegen deliberadamente.

## 5. Cómo explicar integridad y concurrencia

**Pregunta:** “¿Qué ocurre si dos personas venden la última unidad?”

El stock se descuenta con una condición `stock >= cantidad` dentro de una transacción serializable. Si dos transacciones entran en conflicto, PostgreSQL aborta una. La aplicación reintenta hasta tres veces y vuelve a evaluar el stock. No basta con leer una cantidad y escribir después un valor calculado en memoria.

**Pregunta:** “¿Puede una venta quedar a medias?”

Los detalles, los descuentos y los movimientos pertenecen a la misma transacción. Si el segundo producto no tiene stock, se revierte también el descuento del primero. La prueba manual consiste en enviar una venta con un producto disponible y otro insuficiente.

**Pregunta:** “¿Qué evita anular dos veces?”

Solo se cambia de estado cuando la venta continúa CONFIRMED. La transición, la restitución y los movimientos se confirman juntos. Una segunda solicitud encuentra CANCELLED y responde 409.

**Pregunta:** “¿Por qué dinero como cadena?”

PostgreSQL almacena decimales exactos y Prisma opera con Decimal. La cadena JSON evita presentar un número flotante como fuente de verdad. React usa centavos enteros para su estimación. El servidor calcula el total definitivo.

**Pregunta:** “¿Por qué conservar el nombre y el precio en SaleItem?”

Si el producto cambia mañana, el detalle de una venta anterior debe seguir mostrando el nombre, SKU y precio registrados al vender.

**Pregunta:** “¿Cómo se corrige una entrada equivocada?”

Con un movimiento compensatorio y un motivo claro. No se borra ni modifica silenciosamente el movimiento original.

## 6. Cómo explicar los diagramas C4

**Nivel 1 — contexto:** mostrar quién usa StockFlow y qué problema resuelve. El actor es el administrador del negocio. El sistema es una caja de software; aquí no se detallan tecnologías internas.

**Nivel 2 — contenedores:** abrir la caja. React funciona dentro del navegador. Nginx sirve React y recibe todas las llamadas API. NestJS gestiona el negocio y PostgreSQL almacena los datos. Las flechas indican los protocolos y dependencias.

Un contenedor C4 es una unidad de aplicación/datos, no necesariamente un contenedor Docker. Por eso React aparece como contenedor lógico aunque su compilación se incluya en la imagen de Nginx.

No existe flecha directa navegador → PostgreSQL ni navegador → NestJS. Los servicios internos no publican puertos al host.

## 7. Preguntas frecuentes sobre infraestructura

**¿Qué diferencia hay entre /gateway-health y /api/health?** El primero confirma que Nginx responde. El segundo pasa por Nginx y verifica NestJS con una consulta real a PostgreSQL.

**¿depends_on mantiene todo saludable para siempre?** No. Ordena el arranque. Un healthcheck informa fallos posteriores; la política unless-stopped reinicia procesos que terminan, no cualquier contenedor unhealthy.

**¿Por qué no usar localhost entre contenedores?** Cada contenedor tiene su propio localhost. Se usan los nombres DNS de Compose: db y backend.

**¿Qué pasa con los datos al ejecutar down?** Se eliminan contenedores y red, pero el volumen se conserva. Con down --volumes se elimina también la BD.

**¿Cómo funciona el seed?** Busca categorías normalizadas y SKU existentes. Agrega lo ausente y no restablece stock ni precios. No usa borrados previos.

**¿Qué pasa si NestJS falla?** Nginx devuelve 503 JSON. Los logs indican el estado del upstream. Cuando se recupera, el resolver Docker permite localizarlo nuevamente.

**¿Por qué hay multistage?** La imagen final no necesita las herramientas de compilación del frontend. El backend elimina herramientas de desarrollo pero conserva una CLI Prisma aislada para migraciones.

**¿El sistema tiene login?** No. Es una demostración local sin autenticación, enlazada a 127.0.0.1. Las funciones transversales exigidas se cubren con CORS, logging y rate limiting.

**¿CORS impide que cualquier programa llame la API?** No. Lo aplican los navegadores. Un cliente como cURL puede hacer peticiones; para controlar identidad se necesita autenticación.

## 8. Guion de exposición de cinco minutos

| Tiempo | Contenido y demostración |
|---|---|
| 0:00–0:40 | Presentación y problema: inventario manual, ventas sin stock y falta de historial. Objetivo y alcance local. |
| 0:40–1:25 | C4 Nivel 1 y Nivel 2. Explicar el único puerto 8080 y los servicios internos. |
| 1:25–2:10 | Mostrar Compose y estado healthy. Abrir Swagger por el Gateway. Mostrar una cabecera X-Request-ID y su log. |
| 2:10–3:05 | CRUD breve: categoría y producto sin stock, consulta, edición y eliminación. Si el tiempo es limitado, mostrar capturas reales previas. |
| 3:05–4:05 | Registrar entrada y venta. Mostrar stock antes/después y total del servidor. Anular y demostrar segundo intento 409. |
| 4:05–4:40 | Mostrar persistencia y resultado real del rate limiting. Explicar DTO, Repository y DI señalando archivos. |
| 4:40–5:00 | Conclusión: integridad, trazabilidad y despliegue local reproducible. Aclarar límites: sin login y evidencias de lo efectivamente probado. |

## 9. Preparación antes del examen

- Confirmar que las imágenes ya están construidas para no depender de descargas durante la defensa.
- Revisar que los tres servicios estén healthy y que Swagger cargue.
- Tener a mano C4, PDF y URL pública del repositorio.
- Ejecutar y capturar las pruebas manuales, especialmente rollback, anulación y persistencia.
- Conservar IDs reales para consultar después.
- No borrar el volumen antes de mostrar persistencia.
- Si una prueba falla, describir el fallo observado y revisar logs; no afirmar que pasó.
