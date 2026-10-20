import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ignored = new Set(['.git', 'node_modules', 'dist', '.tmp']);
function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name)) return [];
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}
const files = walk(root);
const problems = [];
let jsonCount = 0, importCount = 0, linkCount = 0;
for (const path of files) {
  const extension = extname(path);
  if (!['.json', '.ts', '.tsx', '.md', '.sh'].includes(extension)) continue;
  const source = readFileSync(path, 'utf8');
  if (extension === '.json') {
    try { JSON.parse(source); jsonCount++; } catch (error) { problems.push(`${relative(root, path)}: ${error.message}`); }
  }
  if (['.ts', '.tsx'].includes(extension)) {
    for (const match of source.matchAll(/(?:from\s+|import\s*)['"](\.[^'"]+)['"]/g)) {
      const target = resolve(dirname(path), match[1]);
      if (![target, `${target}.ts`, `${target}.tsx`, `${target}.json`, resolve(target, 'index.ts'), resolve(target, 'index.tsx')].some(existsSync)) {
        problems.push(`${relative(root, path)}: importación local ausente ${match[1]}`);
      }
      importCount++;
    }
  }
  if (extension === '.md') {
    for (const match of source.matchAll(/!?\[[^\]]+\]\(([^)]+)\)/g)) {
      if (/^(https?:|#)/.test(match[1])) continue;
      const target = match[1].split('#')[0];
      if (!existsSync(resolve(dirname(path), target))) problems.push(`${relative(root, path)}: enlace local ausente ${target}`);
      linkCount++;
    }
  }
  if (extension === '.sh' && source.includes('\r')) problems.push(`${relative(root, path)}: el script Linux contiene CRLF`);
}
console.log(`${files.length} archivos; ${jsonCount} JSON válidos; ${importCount} importaciones locales revisadas; ${linkCount} enlaces locales revisados.`);
console.log('Alcance: estructura, JSON, rutas y LF. No compila TypeScript ni valida runtime, SQL, Nginx o Docker.');
if (problems.length) { console.error(problems.join('\n')); process.exitCode = 1; }
