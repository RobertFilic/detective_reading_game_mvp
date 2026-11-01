// Usage (from solo/, once: cd tools && npm install):
//   node tools/shots.mjs b6            every screen of case b6 on 3 phones/tablets
//   node tools/shots.mjs b6 --out dir  where the PNGs go (default: shots/, git-ignored)
// Serves the repo itself, opens the game with a ready-made detective, and renders each step
// of the case (as the child first sees it) plus the solved screen and the board, on
// iPhone SE, iPad and a landscape phone. Prints any screen that overflows sideways or
// pushes its main button off-screen. Needs Google Chrome (CHROME=path to override).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const id = args.find(a => !a.startsWith('--'));
const out = path.resolve(args.includes('--out') ? args[args.indexOf('--out') + 1] : 'shots');
if (!id) { console.log('usage: node tools/shots.mjs <caseId> [--out dir]'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  let f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(0);
const base = `http://localhost:${server.address().port}`;

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const VIEWS = [['se', 375, 667], ['ipad', 820, 1180], ['land', 852, 393]];
let problems = 0;
for (const [name, w, h] of VIEWS) {
  const p = await browser.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.setRequestInterception(true);
  p.on('request', r => r.url().startsWith(base) ? r.continue() : r.abort());   // no analytics from tests
  await p.evaluateOnNewDocument(() => { if (window.speechSynthesis) speechSynthesis.getVoices = () => []; });
  await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.goto(base + '/solo/?play');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('dp_save_version', '4'); localStorage.setItem('dp_tutorial_done', 'true');
    localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏽‍♀️', g: 'f', sk: '🐶', name: 'Ana', id: '1234' })); });
  await p.reload();
  const steps = await p.evaluate((id) => {
    const c = CASES.find(x => x.id === id);
    if (!c) return null;
    S.file = c.file; S.c = c; S.run = newRun(); S.run.answered = true;
    return c.steps || ['intro', 'story'];
  }, id);
  if (!steps) { console.log(`✘ no case ${id}`); process.exit(1); }
  const shoot = async (label) => {
    await new Promise(r => setTimeout(r, label === 'reveal' ? 2200 : 250));   // the solved screen settles after its animations
    const bad = await p.evaluate(() => {
      const W = document.documentElement.clientWidth, out = [];
      document.querySelectorAll('#app *').forEach(el => { if (el.closest('.pins')) return; const r = el.getBoundingClientRect(); if (r.width && (r.right > W + 1 || r.left < -1)) out.push('overflow: ' + (el.className || el.tagName)); });
      const btn = [...document.querySelectorAll('.footer .btn.big, .screen > .btn.big')].pop();
      if (btn) { const r = btn.getBoundingClientRect(); if (r.bottom > innerHeight + 1) out.push('main button below the screen'); }
      return [...new Set(out)].slice(0, 4);
    });
    if (bad.length) { problems++; console.log(`✘ ${name} ${label}: ${bad.join(', ')}`); }
    await p.screenshot({ path: path.join(out, `${id}-${name}-${label}.png`) });
  };
  for (const st of steps) { await p.evaluate((st) => go(st), st); await shoot(st); }
  await p.evaluate(() => go('reveal')); await shoot('reveal');
  await p.evaluate(() => { S.pinNew = S.c.id; go('board'); }); await shoot('board');
  if (errors.length) { problems++; console.log(`✘ ${name}: page errors ${errors.join(' | ')}`); }
  await p.close();
}
await browser.close();
server.close();
console.log(problems ? `${problems} problem(s); screenshots in ${out}` : `✔ ${id}: screenshots in ${out}`);
