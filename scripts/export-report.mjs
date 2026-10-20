import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(resolve(root, 'docs/INFORME_TECNICO.md'), 'utf8');
const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function inline(text) {
  return escape(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
}
// Renderizador acotado al Markdown del informe. No depende de red ni paquetes.
function render(markdown) {
  const lines = markdown.trim().split(/\r?\n/);
  let output = '', paragraph = [], list = false, table = false, code = null;
  function flush() { if (paragraph.length) { output += `<p>${inline(paragraph.join(' '))}</p>`; paragraph = []; } }
  function close() { flush(); if (list) { output += '</ul>'; list = false; } if (table) { output += '</tbody></table>'; table = false; } }
  for (const line of lines) {
    if (line.startsWith('```')) {
      if (code !== null) { output += `<pre><code>${escape(code.join('\n'))}</code></pre>`; code = null; }
      else { close(); code = []; }
      continue;
    }
    if (code !== null) { code.push(line); continue; }
    if (!line.trim()) { close(); continue; }
    const image = line.match(/^!\[(.+)\]\((c4\/[\w-]+\.svg)\)$/);
    if (image) {
      close();
      const content = readFileSync(resolve(root, 'docs', image[2]));
      output += `<figure><img alt="${escape(image[1])}" src="data:image/svg+xml;base64,${content.toString('base64')}"/><figcaption>${escape(image[1])}</figcaption></figure>`;
      continue;
    }
    const heading = line.match(/^(#{1,3}) (.+)$/);
    if (heading) { close(); output += `<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`; continue; }
    if (line.startsWith('|')) {
      flush();
      if (/^\|[\s:|-]+\|$/.test(line)) continue;
      const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
      if (!table) { output += `<table><thead><tr>${cells.map((cell) => `<th>${inline(cell)}</th>`).join('')}</tr></thead><tbody>`; table = true; }
      else output += `<tr>${cells.map((cell) => `<td>${inline(cell)}</td>`).join('')}</tr>`;
      continue;
    }
    if (line.startsWith('- ')) {
      flush(); if (!list) { output += '<ul>'; list = true; }
      output += `<li>${inline(line.slice(2))}</li>`; continue;
    }
    if (line.startsWith('> ')) { close(); output += `<blockquote>${inline(line.slice(2))}</blockquote>`; continue; }
    paragraph.push(line.trim());
  }
  close();
  return output;
}
const sections = source.split('<!-- PAGE -->');
const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Informe técnico StockFlow · Kevin Tapia Ali</title>
<style>
@page{size:A4;margin:16mm}
*{box-sizing:border-box}body{margin:0;background:#e8eeeb;font-family:Arial,sans-serif;color:#243c32;font-size:10pt;line-height:1.5}
.page{width:210mm;min-height:297mm;margin:10mm auto;padding:18mm;background:white;display:flex;flex-direction:column;box-shadow:0 4px 25px #22332219}
.page-body{flex:1}h1{font-size:25pt;line-height:1.25;letter-spacing:-.7pt;margin:18mm 0 12mm;color:#153c2c}h2{font-size:14pt;line-height:1.3;margin:6mm 0 3mm;color:#205c43}h3{font-size:12pt;margin:6mm 0}p{margin:3mm 0;text-align:justify}ul{padding-left:5mm}li{margin:1mm 0}strong{color:#254c39}table{width:100%;border-collapse:collapse;font-size:9pt;margin:4mm 0}td,th{border:1px solid #d9e4dd;padding:2mm;text-align:left;vertical-align:top}th{background:#edf4ee}figure{margin:4mm 0}img{width:100%;height:auto}figcaption{font-size:8pt;color:#647c6c;text-align:center}pre{background:#f2f6f2;padding:3mm;white-space:pre-wrap;font-size:9pt}code{font-family:Consolas,monospace}blockquote{margin:3mm 0;padding:3mm;border:1px dashed #96af9e;background:#f5f8f3;font-size:9pt}footer{border-top:1px solid #d6e3d9;padding-top:3mm;margin-top:6mm;display:flex;justify-content:space-between;font-size:8pt;color:#6f8274}.cover h2{font-size:34pt;margin-top:12mm}.cover h3{font-size:17pt;margin-bottom:15mm}.cover p{text-align:left;margin-top:7mm}.cover{border-top:6mm solid #21563e}
.print-note{max-width:210mm;margin:15px auto;padding:12px;background:#fff7db;font-size:12px}
@media print{body{background:white}.print-note{display:none}.page{width:auto;min-height:264mm;padding:0;margin:0;box-shadow:none;break-after:page}.page:last-child{break-after:auto}.cover{padding-top:7mm}h2,h3{break-after:avoid}figure,tr,blockquote{break-inside:avoid}p{orphans:2;widows:2}}
</style></head><body><div class="print-note">Exportar: Ctrl+P → PDF, A4, escala 100%, sin encabezados/pies del navegador. Revisar 7 páginas. Reemplazar espacios de evidencia antes de entregar.</div>
${sections.map((section, index) => `<section class="page ${index === 0 ? 'cover' : ''}"><div class="page-body">${render(section)}</div><footer><span>StockFlow · Tecnologías Web II · Kevin Tapia Ali</span><span>${index + 1} / ${sections.length}</span></footer></section>`).join('\n')}
</body></html>`;
writeFileSync(resolve(root, 'docs/INFORME_TECNICO.html'), html, 'utf8');
console.log(`Informe HTML generado: ${sections.length} secciones paginadas, SVG integrados. No se generó PDF.`);
