import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export function readIndex() {
  return readFileSync(join(ROOT, 'index.html'), 'utf8');
}

// Evaluates the "// CASES-BEGIN … // CASES-END" block of index.html (plain data, no DOM).
export function loadData(html = readIndex()) {
  const m = html.match(/\/\/ CASES-BEGIN([\s\S]*?)\/\/ CASES-END/);
  if (!m) throw new Error('CASES-BEGIN / CASES-END markers not found in index.html');
  return new Function(`${m[1]}\nreturn { LEVEL_RULES, CHARACTERS, UI_AUDIO, CASES, clipList, FILES, RUNG };`)();
}
