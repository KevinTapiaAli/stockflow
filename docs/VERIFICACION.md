# Registro de verificación — 20 de octubre de 2026

## Alcance autorizado

StockFlow se preparó directamente en la carpeta indicada. Estaba vacía y no contenía un repositorio Git previo. Por instrucción del solicitante no se iniciaron servidores, Docker Compose, navegadores ni procesos persistentes; tampoco se ejecutaron pruebas de integración o rendimiento.

## Comprobaciones realizadas

| Comprobación | Resultado |
|---|---|
| Generar informe HTML desde Markdown | Completada; siete secciones paginadas y diagramas SVG integrados |
| Generar colección Postman | Completada; JSON escrito, sin ejecutar solicitudes |
| Sintaxis Node de seed.cjs | Correcta mediante node --check; no se conectó a PostgreSQL |
| Sintaxis Node de rate-limit.mjs | Correcta mediante node --check; no se emitieron solicitudes |
| Sintaxis PowerShell de manual-demo.ps1 | Correcta mediante el parser; no se ejecutó el flujo |
| Comprobación estructural Node | Correcta: 95 archivos, 11 JSON, 115 importaciones relativas y 10 enlaces locales |
| Sintaxis de scripts de documentación | Correcta mediante node --check |
| Revisión manual de arquitectura | Prefijos /api, DNS Docker, migraciones, DTO, transacciones y cliente coherentes por lectura |
| Revisión de React | Hooks con limpieza de consultas, formularios etiquetados, diálogo nativo, carga/error y confirmaciones |

La comprobación adicional se reproduce con `node scripts/check-static.mjs`: lee JSON, resuelve importaciones relativas, revisa enlaces Markdown locales y saltos LF de scripts Linux. Su salida es una comprobación estructural, no una compilación.

## No verificado por ejecución

- Instalación/resolución de dependencias: no se instalaron paquetes en el host y no hay lockfiles.
- Compilación TypeScript, generación Prisma y compilación Vite.
- Sintaxis efectiva de Nginx y Docker Compose con sus herramientas.
- Aplicación SQL de migraciones y seed sobre PostgreSQL.
- Funcionamiento HTTP, Swagger, formularios en navegador y responsive visual.
- Ventas concurrentes, rollback, anulación simultánea y límites de capacidad.
- CORS, logging, rate limiting y recuperación del backend.
- Construcción de imágenes, salud de servicios y persistencia.
- Renderizado final del PDF; se entrega Markdown y HTML, no PDF.
- Acceso público GitHub: no se creó remoto ni se realizó push.

## Estado de Git

Se inicializó un repositorio local en main. La identidad Git existente se conserva. Se creó un commit auténtico y se prepararon ramas locales develop y feature/stockflow, sin fabricar una cronología de desarrollo. Consultar `git log --oneline --decorate --all` y `git branch` para comprobar el estado actual.

Windows creó .git con el propietario del entorno aislado. Se agregó una entrada safe.directory exclusivamente para la ruta de este proyecto en la configuración Git del usuario, sin comodines ni cambios de credenciales. No se alteraron remotos.

## Validación pendiente del estudiante

1. Copiar .env.example a .env y ejecutar `docker compose up --build -d`.
2. Confirmar tres servicios healthy y único puerto publicado 8080.
3. Abrir frontend/Swagger y ejecutar la colección o el script manual.
4. Probar errores, rollback, concurrencia y persistencia según docs/evidencias.
5. Insertar capturas reales y exportar el informe a PDF; comprobar entre 5 y 8 páginas.
6. Publicar en GitHub y comprobar acceso público.

No interpretar la implementación o una revisión de archivos como evidencia de que estas pruebas pasaron.
