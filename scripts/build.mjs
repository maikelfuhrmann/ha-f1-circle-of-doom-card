import { readFile, mkdir, writeFile } from 'node:fs/promises';
const model = (await readFile('src/model.js', 'utf8')).replace(/^export /gm, '');
const card = (await readFile('src/card.js', 'utf8')).replace(/^import .*from '\.\/model\.js';\n/m, '');
await mkdir('dist', { recursive: true });
await writeFile('dist/f1-circle-of-doom-card.js', `/* F1 Circle of Doom Card v0.1.0 | MIT | maikelfuhrmann */\n${model}\n${card}`);
console.log('Built dist/f1-circle-of-doom-card.js');
