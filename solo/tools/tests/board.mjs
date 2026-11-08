import './brief-auto.mjs';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = await b.newPage();
await p.setViewport({ width: 820, height: 1180, hasTouch: true });
const errors = []; p.on('pageerror', e => errors.push(e.message));
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
await p.goto('http://localhost:8765/solo/');
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('dp_tutorial_done', 'true'); localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏽‍♀️', g: 'f', sk: '🐶', name: 'Test', id: '1234' })); });
await p.reload(); await new Promise(r => setTimeout(r, 800));
const st = () => p.evaluate(() => ({ screen: S.screen, file: S.file, no: S.c && S.c.no, culprit: S.c && S.c.culprit, evs: S.c && S.c.sentences.filter(s => s.role === 'evidence').map(s => s.id), suggest: S.suggest }));
async function solve() {
  const s = await st();
  await p.click('[data-act="toStory"]'); await p.click('[data-act="know"]');
  await p.click(`[data-act="pick"][data-id="${s.culprit}"]`);
  for (const ev of s.evs) await p.click(`[data-sid="${ev}"]`);
  await p.click('[data-act="confirm"]');
  ok((await st()).screen === 'reveal', `${s.file} ${s.no} solved`);
  await p.click('[data-act="next"]');
}
const ticks = () => p.$$eval('.folder.solved', els => els.map(e => Number(e.dataset.no)));

await p.click('[data-act="age"][data-age="6-7"]');
ok(await p.$('[data-act="orderMode"][data-mode="board"].btn:not(.secondary)'), 'board is the default mode');
await p.click('[data-act="startSession"]'); await p.click('[data-act="begin"]');
ok((await p.$$('.file-card:not(.teaser)')).length === 5, 'five adventures: space, farm and three seasons');
await p.click('.file-card[data-file="vesolje"]');
let s = await st();
ok(s.screen === 'board' && (await p.$$('.folder')).length === 6, 'board shows 6 cases');
const lv = await p.$$eval('.folder .lvl', els => els.map(e => [...e.textContent.matchAll(/🔍/gu)].length));
ok(JSON.stringify(lv) === '[1,2,2,3,4,5]', `difficulty climbs 🔍 → 🔍🔍🔍🔍🔍: ${lv}`);
ok(s.suggest === 1 && (await p.$$('.folder.suggest')).length === 1, `the fact case glows as the suggestion (case ${s.suggest})`);
await p.screenshot({ path: 'shots/b1-board.png' });

await p.click('.folder[data-no="1"]'); await solve();
ok((await st()).screen === 'board' && (await ticks()).includes(1), 'back on the board, solved case has ✔');
ok((await st()).suggest === 2 || (await st()).suggest === 3, 'next suggestion is a 🔍🔍 case');
await p.click('.folder[data-no="5"]'); await solve();   // a hard one, chosen freely
await p.click('.folder[data-no="1"]'); await solve();   // replay
ok((await ticks()).length === 2, 'replaying keeps the tick, no double count');
await p.click('.folder[data-no="2"]');
ok(await p.evaluate(() => analyzeAll().at(-1).wantMore), 'picking a 4th case after 3 counts as wanting more');
await solve();
await p.click('[data-act="moreNo"]');
ok((await st()).screen === 'thanks', '"Dovolj za danes" ends the session');

// second session: ticks persist; solve the rest → trophy
await p.evaluate(() => ACTIONS.toSetup());
await p.click('[data-act="age"][data-age="6-7"]');
ok((await p.content()).includes('rešenih: 3 / 30'), 'setup shows 3 / 30 solved');
await p.click('[data-act="startSession"]'); await p.click('[data-act="begin"]'); await p.click('.file-card[data-file="vesolje"]');
ok((await ticks()).length === 3, 'ticks persist across sessions');
for (;;) {
  const open = await p.$$eval('.folder:not(.solved)', els => els.map(e => Number(e.dataset.no)));
  if (!open.length) break;
  await p.click(`.folder[data-no="${open[0]}"]`); await solve();
}
ok(await p.$('.trophy'), 'all 6 solved → trophy banner');

// fixed mode runs through every adventure in order
await p.evaluate(() => ACTIONS.toSetup());
p.on('dialog', d => d.accept());
await p.click('[data-act="age"][data-age="8-9"]');
await p.click('[data-act="resetBoard"]');
ok((await p.content()).includes('rešenih: 0 / 30'), 'reset clears the ticks');
await p.click('[data-act="orderMode"][data-mode="fixed"]');
ok((await p.$$('[data-act="startAt"]')).length === 30, 'Po vrsti lists all 30 cases to start from');
await p.click('[data-act="startSession"]'); await p.click('[data-act="begin"]');
s = await st();
ok(s.file === 'vesolje' && s.no === 1 && s.screen === 'intro', 'Po vrsti starts at 🚀 1 without the board (level B falls back to A)');
for (let i = 0; i < 6; i++) { await solve(); await p.click('[data-act="moreYes"]'); }
s = await st();
ok(s.file === 'kmetija' && s.no === 1, 'after the 6 space cases Po vrsti goes on to 🐄 1');
ok(errors.length === 0, 'no page errors ' + errors.join('|'));
await b.close();
