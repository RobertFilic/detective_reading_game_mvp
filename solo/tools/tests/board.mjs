import './brief-auto.mjs';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = await b.newPage();
await p.setViewport({ width: 820, height: 1180, hasTouch: true });
const errors = []; p.on('pageerror', e => errors.push(e.message));
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 150) => new Promise(r => setTimeout(r, ms));
await p.goto('http://localhost:8765/solo/');
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('dp_tutorial_done', 'true'); localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏽‍♀️', g: 'f', sk: '🐶', name: 'Test', id: '1234' })); });
await p.reload(); await wait(800);
const st = () => p.evaluate(() => ({ screen: S.screen, file: S.file, no: S.c && S.c.no }));
const ticks = () => p.$$eval('.folder.solved', els => els.map(e => Number(e.dataset.no)));
const open = await p.evaluate(() => FILES.map(f => f.id));   // the adventures out today (a dated one joins on its day)
const total = await p.evaluate(() => ALL_KEYS.length);

await p.click('[data-act="age"][data-age="6-7"]');
ok(await p.$('[data-act="orderMode"][data-mode="board"].btn:not(.secondary)'), 'board is the default mode');
await p.click('[data-act="startSession"]'); await p.click('[data-act="begin"]');
ok((await p.$$('.file-card:not(.teaser)')).length === open.length, `${open.length} adventures: ${open.join(', ')}`);
ok(!(await p.$('.file-card[data-file="vesolje"], .file-card[data-file="kmetija"]')), 'the old space and farm adventures are gone');
ok(total === open.length * 6, `every adventure has 6 cases (${total})`);
await p.click('.file-card[data-file="bip"]');
ok((await st()).screen === 'board' && (await p.$$('.folder')).length === 6, 'board shows 6 cases');
ok((await p.$$('.folder.locked')).length === 5 && !(await p.$('.folder.locked[data-no="1"]')), 'a season opens one case at a time: only case 1 is open');
await p.click('.folder[data-no="3"]'); await wait();
ok((await st()).screen === 'board' && (await p.evaluate(() => document.body.innerText)).includes('se odpre, ko rešiš primer 2'), 'a locked case says which case opens it');
await p.screenshot({ path: 'shots/b1-board.png' });
await p.click('.folder[data-no="1"]'); await wait();
ok((await st()).screen === 'call' && (await st()).no === 1, 'case 1 opens on the phone call');

// solved cases (set as saves): ticks, the next case opens, the setup counts them
await p.evaluate(() => { localStorage.setItem('dp_played_v1', JSON.stringify(['bip:1', 'bip:2', 'bip:3'])); toBoard(); });
await wait();
ok(JSON.stringify(await ticks()) === '[1,2,3]', 'solved cases have ✔');
ok(!(await p.$('.folder.locked[data-no="4"]')) && await p.$('.folder.locked[data-no="5"]'), 'case 4 opens after case 3, case 5 waits');
await p.evaluate(() => ACTIONS.toSetup());
await p.click('[data-act="age"][data-age="6-7"]');
ok((await p.content()).includes(`rešenih: 3 / ${total}`), `setup shows 3 / ${total} solved`);
await p.evaluate(() => { localStorage.setItem('dp_played_v1', JSON.stringify([1, 2, 3, 4, 5, 6].map(n => 'bip:' + n))); });
await p.click('[data-act="startSession"]'); await p.click('[data-act="begin"]'); await p.click('.medal[data-file="bip"]'); await wait();
ok((await ticks()).length === 6 && await p.$('.trophy'), 'all 6 solved → a medal on the shelf, and its board has the trophy banner');

// fixed mode runs through every adventure in order
await p.evaluate(() => ACTIONS.toSetup());
p.on('dialog', d => d.accept());
await p.click('[data-act="age"][data-age="8-9"]');
await p.click('[data-act="resetBoard"]');
ok((await p.content()).includes(`rešenih: 0 / ${total}`), 'reset clears the ticks');
await p.click('[data-act="orderMode"][data-mode="fixed"]');
ok((await p.$$('[data-act="startAt"]')).length === total, `Po vrsti lists all ${total} cases to start from`);
await p.click('[data-act="startSession"]'); await p.click('[data-act="begin"]'); await wait();
const s = await st();
ok(s.file === 'bip' && s.no === 1 && s.screen === 'call', 'Po vrsti starts at 👾 1 without the board (level B falls back to A)');
ok(errors.length === 0, 'no page errors ' + errors.join('|'));
await b.close();
