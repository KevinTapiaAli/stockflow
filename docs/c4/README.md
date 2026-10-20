# Modelo C4 de StockFlow

Los archivos `.mmd` contienen notación Mermaid C4 editable. Las versiones `.svg` se pueden insertar directamente en el informe, en Word o en una presentación; no necesitan servicios externos. Ambas representan la misma arquitectura.

- **Nivel 1:** el administrador interactúa con el sistema StockFlow. No existen actores de pago, bancos ni integraciones externas.
- **Nivel 2:** React es un contenedor lógico que se ejecuta en el navegador. Sus archivos se construyen en una etapa Docker y se sirven desde Nginx; no hay un cuarto servidor frontend.
- Nginx publica `127.0.0.1:8080 → 80`; conserva `/api/` al reenviar a `backend:3000`.
- NestJS usa Prisma para acceder a `db:5432` por la red bridge.
- PostgreSQL persiste en `postgres_data`; en Docker el nombre real del volumen normalmente es `stockflow_postgres_data`.

Las flechas expresan solicitudes/dependencias; las respuestas regresan por el mismo camino. El navegador descarga HTML, JS y CSS del Gateway y solicita JSON a ese mismo Gateway.

En un editor compatible, abrir `contexto.mmd` y `contenedores.mmd` con soporte Mermaid C4. Si se modifica la arquitectura, actualizar también los SVG y regenerar el HTML del informe.
