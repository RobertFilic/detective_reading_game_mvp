// 🎄 Praznični primeri: the advent band on the start screen (six windows, countdown vs open vs done, a wiggle that
// opens nothing) and Ajda's suitcase on the ID card (a slot fills when its season's final is solved).
// The clock is faked. The real data has only COMING placeholders; a patched page turns 👾 bip into the first holiday season.
import './brief-auto.mjs';
import puppeteer from 'puppeteer-core';
import { readFileSync, mkdirSync } from 'node:fs';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 150) => new Promise(r => setTimeout(r, ms));
const SHOTS = new URL('./shots/', import.meta.url).pathname; mkdirSync(SHOTS, { recursive: true });
const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
// bip becomes the first window (opens 11-26) and brings its object; the real 11-26 season (igrace) or its placeholder
// leaves the band, so the test keeps a season whose cases it can solve by taps
const patched = html
  .replace("{ id: 'bip', icon: '👾', hue: 300,", "{ id: 'bip', icon: '👾', hue: 300, group: 'praznik', opens: '2026-11-26', kovcek: { icon: '🥄', name: 'Bipova žlica' },")
  .replace(/  \{ id: 'praznik1'.*\n/, '')
  .replace(/(\{ id: 'igrace'[\s\S]*?)group: 'praznik',\s*/, '$1');
if (patched === html || patched.includes("id: 'praznik1'") || /\{ id: 'igrace'[^\n]*\n?[^{]*group: 'praznik'/.test(patched.slice(patched.indexOf("{ id: 'igrace'"), patched.indexOf("{ id: 'igrace'") + 800))) throw new Error('patch failed');

async function open(day, { w = 390, h = 844, patch = false, played = [] } = {}) {
  const p = await b.newPage();
  p.errors = []; p.on('pageerror', e => p.errors.push(e.message));
  await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.evaluateOnNewDocument((t) => {
    const R = Date; const fixed = new R(t).getTime();
    globalThis.Date = class extends R { constructor(...a) { super(...(a.length ? a : [fixed])); } static now() { return fixed; } };
  }, `${day}T09:30:00`);
  if (patch) { await p.setBypassServiceWorker(true); await p.setRequestInterception(true);
    p.on('request', r => r.url().endsWith('/solo/?play&igra=primeri') ? r.respond({ status: 200, contentType: 'text/html', body: patched }) : r.continue()); }
  await p.goto('http://localhost:8765/solo/?play&igra=primeri');
  await p.evaluate((pl) => { localStorage.clear(); localStorage.setItem('dp_save_version', '4'); localStorage.setItem('dp_tutorial_done', 'true');
    localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏻‍♂️', g: 'm', sk: '🐶', name: 'Klai', id: '9745' }));
    localStorage.setItem('dp_played_v1', JSON.stringify(pl)); }, played);
  await p.reload(); await wait(500);
  return p;
}
const wins = (p) => p.$$eval('.ui-adv .ui-win', els => els.map(e => ({ date: e.querySelector('.ui-win-date').textContent, pic: e.querySelector('.ui-win-pic').textContent,
  tag: (e.querySelector('.ui-tag, .ui-count') || {}).textContent, soon: e.classList.contains('is-soon'), done: e.classList.contains('is-done'), act: e.dataset.act, file: e.dataset.file || '' })));
const slots = (p) => p.$$eval('.ui-slots .ui-slot', els => els.map(e => ({ full: e.classList.contains('is-full'), open: e.classList.contains('is-open'), btn: e.tagName === 'BUTTON', name: e.querySelector('.ui-slot-name').textContent, pic: e.querySelector('.ui-slot-pic').textContent })));
const card = async (p) => { await p.evaluate(() => { ACTIONS.editCard(); S.mk.step = 4; render(); }); await wait(200); };
const six = [...Array(6)].map((_, i) => 'bip:' + (i + 1));
const fits = (p) => p.evaluate(() => { const W = document.documentElement.clientWidth, out = [];
  document.querySelectorAll('#app *').forEach(el => { const r = el.getBoundingClientRect(); if (r.width && (r.right > W + 1 || r.left < -1)) out.push(el.className || el.tagName); });
  return { sideways: document.documentElement.scrollWidth > innerWidth, out: [...new Set(out)].slice(0, 5) }; });

// the real data on 11-18: six windows, all counting down, the list below has no holiday teaser
for (const [dev, w, h] of [['iphone14', 390, 844], ['ipad', 820, 1180], ['land', 852, 393], ['small', 340, 700]]) {
  const p = await open('2026-11-18', { w, h });
  const ws = await wins(p);
  ok(ws.length === 6 && ws.every(x => x.soon && x.act === 'teaser'), `${dev}: six windows, none open`);
  ok(JSON.stringify(ws.map(x => x.tag)) === JSON.stringify(['Še 8 dni', 'Še 15 dni', 'Še 22 dni', 'Še 29 dni', 'Še 36 dni', 'Še 43 dni']), `${dev}: countdowns ${ws.map(x => x.tag)}`);
  ok(ws.map(x => x.date).join() === '26. 11.,3. 12.,10. 12.,17. 12.,24. 12.,31. 12.', `${dev}: dates ${ws.map(x => x.date)}`);
  ok(await p.$$eval('.file-card.teaser', els => els.every(e => !/Adventni|Miklav|cirkus|predstava|Sveti|Silvest/.test(e.textContent))), `${dev}: the »Kmalu« list holds no holiday season`);
  const g = await p.$$eval('.ui-adv .ui-win', els => { const r = els.map(e => e.getBoundingClientRect()); return { rows: new Set(r.map(x => Math.round(x.top))).size, minH: Math.min(...r.map(x => x.height)), minW: Math.min(...r.map(x => x.width)) }; });
  ok(g.rows === (w >= 560 ? 1 : 2) && g.minH >= 56 && g.minW >= 56, `${dev}: ${g.rows} row(s) of windows, ≥ 56 px (${Math.round(g.minW)}×${Math.round(g.minH)})`);
  const f = await fits(p); ok(!f.sideways && !f.out.length, `${dev}: no sideways scroll ${f.out}`);
  const before = await p.evaluate(() => S.screen);
  await p.evaluate(() => document.querySelector('.ui-win').scrollIntoView());
  await p.click('.ui-adv .ui-win'); await wait(100);
  ok(await p.$('.ui-win.is-wiggle') && await p.evaluate(() => S.screen) === before, `${dev}: a closed window wiggles and opens nothing`);
  await p.evaluate(() => document.querySelector('.ui-adv').scrollIntoView({ block: 'center' }));
  await p.screenshot({ path: SHOTS + `praznik-band-${dev}.png` });
  await card(p);
  const sl = await slots(p);
  ok(sl.length === 6 && sl.every(x => !x.full && !x.open && !x.btn), `${dev}: the suitcase has six empty slots, none to tap yet`);
  const f2 = await fits(p); ok(!f2.sideways && !f2.out.length, `${dev}: ID card with suitcase, no sideways scroll ${f2.out}`);
  const foot = await p.evaluate(() => { const g = document.querySelector('.ui-foot .ui-btn'); return g && g.getBoundingClientRect().bottom <= innerHeight; });
  ok(foot, `${dev}: the »Začni« button of the ID card stays on screen`);
  await p.screenshot({ path: SHOTS + `praznik-card-${dev}.png` });
  ok(!p.errors.length, `${dev}: no page errors ${p.errors}`);
  await p.close();
}

// the first season is written: open window, the others count down (12-01)
for (const [dev, w, h] of [['iphone14', 390, 844], ['land', 852, 393]]) {
  let p = await open('2026-12-01', { w, h, patch: true });
  let ws = await wins(p);
  ok(!ws[0].soon && ws[0].act === 'openFile' && ws[0].file === 'bip' && ws[0].tag === 'NOVO' && ws[0].pic === '👾', `${dev}: window 1 is open, NOVO`);
  ok(ws.slice(1).every(x => x.soon) && JSON.stringify(ws.slice(1).map(x => x.tag)) === JSON.stringify(['Še 2 dneva', 'Še 9 dni', 'Še 16 dni', 'Še 23 dni', 'Še 30 dni']), `${dev}: five countdowns ${ws.slice(1).map(x => x.tag)}`);
  ok(ws.length === 6, `${dev}: still six windows (bip took its placeholder's place)`);
  ok(await p.evaluate(() => !document.querySelector('.file-card[data-file="bip"]') || document.querySelector('.file-card.hero[data-file="bip"]')), `${dev}: the season has no second card in the list`);
  await p.evaluate(() => document.querySelector('.ui-adv').scrollIntoView({ block: 'center' }));
  await p.screenshot({ path: SHOTS + `praznik-open-${dev}.png` });
  // the card: an empty slot of an open season is a button; tapping it saves the card and opens the season
  await card(p);
  let sl = await slots(p);
  ok(sl[0].open && sl[0].btn && !sl[0].full && sl[0].pic === '?' && sl.slice(1).every(x => !x.open && !x.btn), `${dev}: slot 1 invites, the rest are plain outlines`);
  await p.evaluate(() => { S.mk.name = 'Nika'; });
  await p.click('.ui-slot.is-open'); await wait(300);
  ok(await p.evaluate(() => S.screen === 'board' && S.file === 'bip' && profile().name === 'Nika'), `${dev}: tapping the slot opens the season and keeps the card`);
  ok(!p.errors.length, `${dev}: no page errors ${p.errors}`);
  await p.close();

  // two cases solved: the window counts them, the slot is still empty
  p = await open('2026-12-01', { w, h, patch: true, played: ['bip:1', 'bip:2'] });
  ws = await wins(p);
  ok(ws[0].tag === '✔ 2 / 6' && !ws[0].done, `${dev}: window 1 counts 2 / 6`);
  ok(await p.$('.file-card.hero[data-file="bip"]'), `${dev}: the season played last is the big card, and still opens from its window`);
  await p.click('.ui-adv .ui-win:not(.is-soon)'); await wait(250);
  ok(await p.evaluate(() => S.screen === 'board' && S.file === 'bip'), `${dev}: the open window opens the season`);
  await p.evaluate(() => ACTIONS.toFiles()); await wait(200);

  // the final is solved: the window shows the object, the suitcase slot fills (saved data only, no new key)
  await p.evaluate(() => { store.write(PLAYED_KEY, ['bip:1', 'bip:2', 'bip:3', 'bip:4', 'bip:5']); ACTIONS.toFiles(); }); await wait(200);
  ok((await wins(p))[0].done === false, `${dev}: five of six: not done`);
  await card(p);
  ok((await slots(p))[0].full === false, `${dev}: five of six: the slot is empty`);
  await p.evaluate(() => { store.write(PLAYED_KEY, [...store.read(PLAYED_KEY, []), 'bip:6']); ACTIONS.toFiles(); }); await wait(200);
  ws = await wins(p);
  ok(ws[0].done && ws[0].pic === '🥄' && ws[0].tag === '✔', `${dev}: final solved: the window shows the spoon`);
  ok(!(await p.$('.file-card[data-file="bip"]')) && !(await p.$('.medal[data-file="bip"]')), `${dev}: a solved holiday season is not in the list or on the medal shelf`);
  await p.evaluate(() => document.querySelector('.ui-adv').scrollIntoView({ block: 'center' }));
  await p.screenshot({ path: SHOTS + `praznik-done-${dev}.png` });
  await card(p);
  sl = await slots(p);
  ok(sl[0].full && sl[0].pic === '🥄' && sl[0].name === 'Bipova žlica' && !sl[0].btn && sl.slice(1).every(x => !x.full), `${dev}: the suitcase holds Bipova žlica, five empty`);
  const f = await fits(p); ok(!f.sideways && !f.out.length, `${dev}: full slot, no sideways scroll ${f.out}`);
  await p.screenshot({ path: SHOTS + `praznik-card-full-${dev}.png` });
  // the save belongs to the detective: another detective's suitcase starts empty
  ok(await p.evaluate(() => Object.keys(localStorage).every(k => !/kovcek|praznik/i.test(k))), `${dev}: no new storage key`);
  ok(!p.errors.length, `${dev}: no page errors ${p.errors}`);
  await p.close();
}
await b.close();
