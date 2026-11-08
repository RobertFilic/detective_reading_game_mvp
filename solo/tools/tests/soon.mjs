// Teaser cards and release dates: the countdown per day, the wiggle, and a dated file staying out until its day.
import './brief-auto.mjs';
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 150) => new Promise(r => setTimeout(r, ms));
const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const dated = html.replace("book: { q: 'Ali smem napisati knjigo o tebi?', title: 'in skrivnost hotela Galeb', by: '🦔 Ježek' } },",
  "book: { q: 'Ali smem napisati knjigo o tebi?', title: 'in skrivnost hotela Galeb', by: '🦔 Ježek' }, opens: '2026-11-12', teaser: 'Kdo piše knjige?' },");
if (dated === html) throw new Error('patch failed');

async function open(day, { w = 375, h = 667, patch = false, played = [] } = {}) {
  const p = await b.newPage();
  p.errors = []; p.on('pageerror', e => p.errors.push(e.message));
  await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.evaluateOnNewDocument((t) => {
    const R = Date; const fixed = new R(t).getTime();
    globalThis.Date = class extends R { constructor(...a) { super(...(a.length ? a : [fixed])); } static now() { return fixed; } };
  }, `${day}T09:30:00`);
  if (patch) { await p.setBypassServiceWorker(true); await p.setRequestInterception(true);
    p.on('request', r => r.url().endsWith('/solo/?play') ? r.respond({ status: 200, contentType: 'text/html', body: dated }) : r.continue()); }
  await p.goto('http://localhost:8765/solo/?play');
  await p.evaluate((pl) => { localStorage.clear(); localStorage.setItem('dp_save_version', '4'); localStorage.setItem('dp_tutorial_done', 'true');
    localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏻‍♂️', g: 'm', sk: '🐶', name: 'Klai', id: '9745' }));
    localStorage.setItem('dp_played_v1', JSON.stringify(pl)); }, played);
  await p.reload(); await wait(500);
  return p;
}
const teasers = (p) => p.$$eval('.file-card.teaser', els => els.map(e => e.querySelector('b').textContent + ' | ' + e.querySelector('.when').textContent));

for (const [day, want] of [['2026-11-05', ['Še 7 dni', 'Še 14 dni']], ['2026-11-08', ['Še 4 dnevi', 'Še 11 dni']],
  ['2026-11-10', ['Še 2 dneva', 'Še 9 dni']], ['2026-11-11', ['Jutri!', 'Še 8 dni']]]) {
  const p = await open(day);
  const t = await teasers(p);
  ok(JSON.stringify(t.map(x => x.split(' | ')[1].replace('⏳ ', ''))) === JSON.stringify(want), `${day}: ${t.join(' ; ')}`);
  ok(!p.errors.length, `${day}: no page errors ${p.errors}`);
  await p.close();
}

// on the release day the teaser is gone (a written season would be in FILES by then; COMING keeps only unwritten ones)
for (const [dev, w, h] of [['iphone14', 390, 844], ['plus14', 428, 926], ['land', 844, 390]]) {
  const p = await open('2026-11-05', { w, h, played: [...Array(6)].map((_, i) => 'bip:' + (i + 1)) });
  ok((await teasers(p)).length === 2 && await p.$eval('.soon-head', e => e.textContent.includes('Kmalu')), `${dev}: two teasers under »Kmalu«`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${dev}: no sideways scroll`);
  const hero = await p.evaluate(() => { const g = document.querySelector('.hero .go'); return g && g.getBoundingClientRect().bottom <= innerHeight; });
  if (dev !== 'land') ok(hero, `${dev}: the hero button stays on screen`);   // landscape: the ID card fills the top (as before)
  const before = await p.evaluate(() => S.screen);
  await p.evaluate(() => document.querySelector('.file-card.teaser').scrollIntoView());
  await p.click('.file-card.teaser'); await wait(100);
  ok(await p.$('.file-card.teaser.wiggle') && await p.evaluate(() => S.screen) === before, `${dev}: a teaser wiggles and opens nothing`);
  await p.evaluate(() => scrollTo(0, 0));
  await p.screenshot({ path: `shots/soon-${dev}.png`, fullPage: true });
  ok(!p.errors.length, `${dev}: no page errors ${p.errors}`);
  await p.close();
}

// a written season with a date: out of the game until its day, then a normal adventure
{
  const p = await open('2026-11-11', { patch: true });
  const files = await p.$$eval('.file-card:not(.teaser)', els => els.map(e => e.dataset.file));
  const t = await teasers(p);
  ok(!files.includes('galeb') && t[0] === 'Skrivnost hotela Galeb | ⏳ Jutri!', `day before: galeb is a teaser (${files} ; ${t[0]})`);
  ok(await p.evaluate(() => !CASES.some(c => c.file === 'galeb') && !ALL_KEYS.some(k => k.startsWith('galeb'))), 'day before: its cases are out of the game');
  ok(!p.errors.length, `day before: no page errors ${p.errors}`);
  await p.close();
}
{
  const p = await open('2026-11-12', { patch: true });
  const files = await p.$$eval('.file-card:not(.teaser)', els => els.map(e => e.dataset.file));
  ok(files.includes('galeb') && !(await teasers(p)).some(x => x.startsWith('Skrivnost hotela')), `release day: galeb is playable (${files})`);
  await p.click('.file-card[data-file="galeb"]'); await wait(300);
  ok(await p.evaluate(() => S.screen === 'board' && S.file === 'galeb'), 'release day: its board opens');
  ok(!p.errors.length, `release day: no page errors ${p.errors}`);
  await p.close();
}
await b.close();
