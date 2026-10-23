// Inlines every recording in audio/ into index.html as data: URIs and writes dist/.
// Usage: node tools/build.mjs
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, loadData, readIndex } from './lib.mjs';

const TYPES = { m4a: 'audio/mp4', mp3: 'audio/mpeg', aac: 'audio/aac', wav: 'audio/wav' };
const html = readIndex();
const { clipList } = loadData(html);

const audio = {};
const audioDir = join(ROOT, 'audio');
if (existsSync(audioDir)) {
  for (const f of readdirSync(audioDir).sort()) {
    const m = f.match(/^(.+)\.(m4a|mp3|aac|wav)$/);
    if (!m) continue;
    audio[m[1]] = `data:${TYPES[m[2]]};base64,` + readFileSync(join(audioDir, f)).toString('base64');
  }
}

const marker = /\/\*AUDIO-BEGIN\*\/[\s\S]*?\/\*AUDIO-END\*\//;
if (!marker.test(html)) throw new Error('AUDIO-BEGIN / AUDIO-END markers not found in index.html');
const out = html.replace(marker, () => `/*AUDIO-BEGIN*/${JSON.stringify(audio)}/*AUDIO-END*/`);

const dist = join(ROOT, 'dist');
mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, 'index.html'), out);
copyFileSync(join(ROOT, 'sw.js'), join(dist, 'sw.js'));

const needed = clipList().map(([id]) => id);
const missing = needed.filter(id => !audio[id]);
const extra = Object.keys(audio).filter(id => !needed.includes(id));
const mb = (statSync(join(dist, 'index.html')).size / 1e6).toFixed(2);
console.log(`dist/index.html: ${mb} MB · ${needed.length - missing.length}/${needed.length} clips embedded`);
if (missing.length) console.log(`Missing (${missing.length}): ${missing.join(', ')}`);
if (extra.length) console.log(`Unused files in audio/: ${extra.join(', ')}`);
