import { readFile, mkdir, writeFile } from 'node:fs/promises';
const { version } = JSON.parse(await readFile('package.json', 'utf8'));
const parts = await Promise.all(['presets', 'model', 'layout', 'card'].map(async name =>
  (await readFile(`src/${name}.js`, 'utf8')).replace(/^import .*from '.+?';\n/gm, '').replace(/^export /gm, '')));
await mkdir('dist', { recursive: true });
await writeFile('dist/f1-circle-of-doom-card.js', `/* F1 Circle of Doom Card v${version} | MIT | maikelfuhrmann */\n${parts.join('\n')}`);
console.log('Built dist/f1-circle-of-doom-card.js');
