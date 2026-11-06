// Prints only the part of index.html an agent needs, so nobody reads the whole 300 KB file:
//   node tools/case.mjs p1 p2          the source of these cases (as written, with comments)
//   node tools/case.mjs --file pokal   every case of a file, plus its FILES entry
//   node tools/case.mjs --format       the case data format (the comment above const RUNG and above FILES)
//   node tools/case.mjs --cast pokal   the CHARACTERS lines of a file's cast (names, emoji, name patterns)
//   node tools/case.mjs --list         one line per case: id, steps, culprit, question
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const html = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../index.html'), 'utf8');
const lines = html.split('\n');
const args = process.argv.slice(2);
const at = (re, from = 0) => lines.findIndex((l, i) => i >= from && re.test(l));

// the comment block right above a line (contiguous // lines)
const commentAbove = (i) => { let k = i; while (k > 0 && /^\s*\/\//.test(lines[k - 1])) k--; return lines.slice(k, i).join('\n'); };
// the object literals (2-space indent) inside an array that starts at line i
function blocks(i) {
  const out = [];
  let start = null, lead = null;
  for (let k = i + 1; k < lines.length && !/^\];/.test(lines[k]); k++) {
    if (start === null && /^  \/\//.test(lines[k]) && lead === null) lead = k;
    if (start === null && /^  \{/.test(lines[k])) start = lead ?? k;
    if (start !== null && /^  \},?\s*$/.test(lines[k])) {
      const text = lines.slice(start, k + 1).join('\n');
      out.push({ id: (text.match(/\bid: '([^']+)'/) || [])[1], file: (text.match(/\bfile: '([^']+)'/) || [])[1], text });
      start = null; lead = null;
    } else if (start === null && !/^  \/\//.test(lines[k])) lead = null;
  }
  return out;
}
const casesAt = at(/^const CASES = \[/), filesAt = at(/^const FILES = \[/), charsAt = at(/^const CHARACTERS = \{/);
const CASES = blocks(casesAt);
// FILES entries are one object per entry, possibly over several lines
const FILES = [];
for (let k = filesAt + 1, buf = []; k < lines.length && !/^\];/.test(lines[k]); k++) {
  if (/^  \{ id: '/.test(lines[k]) && buf.length) { FILES.push(buf.join('\n')); buf = []; }
  if (/^  \{ id: '/.test(lines[k]) || buf.length) buf.push(lines[k]);
  if (/^\];/.test(lines[k + 1]) && buf.length) FILES.push(buf.join('\n'));
}

if (!args.length) { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(0, 6).join('\n')); process.exit(0); }
if (args[0] === '--format') {
  console.log(commentAbove(at(/^const RUNG = /)));
  console.log('\n' + commentAbove(filesAt));
} else if (args[0] === '--list') {
  for (const c of CASES) {
    const steps = (c.text.match(/steps: \[([^\]]*)\]/) || [])[1] || '';
    console.log(`${c.id}\t${c.file}\t${steps.replace(/'/g, '')}\tculprit ${(c.text.match(/culprit: '([^']+)'/) || [])[1]}\t${(c.text.match(/question: '([^']+)'/) || [])[1]}`);
  }
} else if (args[0] === '--file') {
  const f = args[1];
  console.log(FILES.find(t => t.includes(`id: '${f}'`)) || `(no FILES entry ${f})`);
  for (const c of CASES.filter(x => x.file === f)) console.log('\n' + c.text);
} else if (args[0] === '--cast') {
  const entry = FILES.find(t => t.includes(`id: '${args[1]}'`)) || '';
  const cast = (entry.match(/cast: \[([^\]]*)\]/) || [, ''])[1].match(/'([^']+)'/g)?.map(x => x.slice(1, -1)) || [];
  for (let k = charsAt + 1; !/^\};/.test(lines[k]); k++) if (cast.some(id => lines[k].startsWith(`  ${id}: `))) console.log(lines[k]);
} else {
  for (const id of args) {
    const c = CASES.find(x => x.id === id);
    console.log(c ? c.text : `(no case ${id})`);
  }
}
