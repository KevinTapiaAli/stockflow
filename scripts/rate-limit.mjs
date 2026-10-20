// Ejecución manual y acotada; no inicia procesos ni servidores.
const origin = process.argv[2] ?? 'http://localhost:8080';
const results = await Promise.all(Array.from({ length: 120 }, async () => {
  try { const response = await fetch(`${origin}/api/categories`); await response.arrayBuffer(); return response.status; }
  catch { return 'conexion_fallida'; }
}));
const counts = results.reduce((summary, status) => { summary[status] = (summary[status] ?? 0) + 1; return summary; }, {});
console.log('Distribución de respuestas:', counts);
if (!counts[429]) console.log('No se observó 429. La concurrencia o la velocidad del entorno pueden impedir saturar el límite.');
