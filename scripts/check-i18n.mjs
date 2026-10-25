// Verifica que es.json y en.json tengan las mismas claves y que el HTML
// solo use claves (data-section / data-value) que existan en ambos idiomas.
import { readFileSync } from 'node:fs';

const load = (file) => JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));
const flat = (obj) =>
  new Set(
    Object.entries(obj).flatMap(([section, values]) =>
      Object.keys(values).map((k) => `${section}.${k}`),
    ),
  );

const es = flat(load('languages/es.json'));
const en = flat(load('languages/en.json'));
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const used = new Set(
  [...html.matchAll(/data-section="([^"]+)"\s+data-value="([^"]+)"/g)].map(
    (m) => `${m[1]}.${m[2]}`,
  ),
);

const problems = [];
for (const key of es) if (!en.has(key)) problems.push(`Falta en en.json: ${key}`);
for (const key of en) if (!es.has(key)) problems.push(`Falta en es.json: ${key}`);
for (const key of used)
  if (!es.has(key)) problems.push(`El HTML usa una clave inexistente: ${key}`);

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`i18n OK: ${es.size} claves, ${used.size} usadas en el HTML.`);
