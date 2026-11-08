// The browser tests: each file plays part of the game like a child, by taps, on iPhone 14, iPad and a
// landscape phone, and prints ✔/✘ per check. Needs Google Chrome and `cd tools && npm install`.
//   node tools/tests/run.mjs                 every test file, 4 at a time
//   node tools/tests/run.mjs muzej when      only these files
//   node tools/tests/run.mjs -j 2            2 at a time (a slower computer)
//   node tools/tests/run.mjs --shots         also save each test's screenshots in tools/tests/shots/
// Serves the repo on localhost:8765 (or uses a server already there). Exits 1 if any check fails.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, '../../..'), PORT = 8765;
const args = process.argv.slice(2);
const jobs = args.includes('-j') ? +args[args.indexOf('-j') + 1] : 4;
const shots = args.includes('--shots');
const named = args.filter((a, i) => !a.startsWith('-') && args[i - 1] !== '-j');
const ALL = fs.readdirSync(HERE).filter(f => f.endsWith('.mjs') && !['run.mjs', 'setup.mjs', 'brief-auto.mjs'].includes(f)).map(f => f.slice(0, -4)).sort();
const tests = named.length ? named : ALL;
for (const t of tests) if (!ALL.includes(t)) { console.log(`✘ no test ${t} (have: ${ALL.join(', ')})`); process.exit(1); }
if (shots) fs.mkdirSync(path.join(HERE, 'shots'), { recursive: true });

// a static server for the repo, unless one is already on the port
const up = await new Promise(r => http.get(`http://localhost:${PORT}/solo/`, res => { res.resume(); r(res.statusCode === 200); }).on('error', () => r(false)));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg' };
const server = up ? null : http.createServer((req, res) => {
  let f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT);

const run = (t) => new Promise(done => {
  const t0 = Date.now();
  const child = spawn(process.execPath, ['--import', './setup.mjs', `${t}.mjs`], { cwd: HERE, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...(shots ? { SHOTS: '1' } : {}) } });
  let out = '';
  // a stuck test (Chrome hung, a tap that never lands) is stopped after 8 minutes and counted as failing
  const limit = setTimeout(() => { out += '\n✘ stopped after 8 minutes'; child.kill(); }, 8 * 60e3);
  child.stdout.on('data', d => out += d); child.stderr.on('data', d => out += d);
  child.on('close', code => {
    clearTimeout(limit);
    const lines = out.split('\n'), pass = lines.filter(l => l.startsWith('✔')).length, fail = lines.filter(l => l.startsWith('✘'));
    // a crash with no ✘ line still counts as a failure, with its last lines shown
    const crashed = code !== 0 && !fail.length;
    done({ t, pass, fail: crashed ? ['✘ crashed (exit ' + code + '): ' + lines.filter(Boolean).slice(-4).join(' | ')] : fail, s: (Date.now() - t0) / 1000 });
  });
});

// the slowest files start first (times from the last run, kept in .durations.json), so none starts last and runs alone
const DUR = path.join(HERE, '.durations.json');
let last = {}; try { last = JSON.parse(fs.readFileSync(DUR, 'utf8')); } catch {}
const t0 = Date.now(), results = [], queue = [...tests];
queue.sort((a, b) => (last[b] ?? 1e9) - (last[a] ?? 1e9));
await Promise.all(Array.from({ length: Math.min(jobs, queue.length) }, async () => {
  while (queue.length) { const r = await run(queue.shift()); results.push(r); console.log(`${r.fail.length ? '✘' : '✔'} ${r.t}: ${r.pass} ok, ${r.fail.length} fail (${r.s.toFixed(0)} s)`); r.fail.slice(0, 8).forEach(l => console.log('    ' + l)); }
}));
if (server) server.close();
for (const r of results) if (!r.fail.length) last[r.t] = Math.round(r.s);
fs.writeFileSync(DUR, JSON.stringify(last, null, 1));
const bad = results.filter(r => r.fail.length);
console.log(`\n${bad.length ? '✘' : '✔'} ${results.reduce((a, r) => a + r.pass, 0)} checks in ${results.length} files, ${bad.length} file(s) failing · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
process.exit(bad.length ? 1 : 0);
