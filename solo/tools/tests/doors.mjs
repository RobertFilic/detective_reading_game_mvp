// Two games, one detective (docs/TWO_GAMES.md) on iPhone 14, iPad and a landscape phone: »Igraj zdaj« → the office
// (the detective, the rank, one door per game) → each game's own dashboard, with the shared band on top (the small
// card goes back to the office, the tabs switch games). One rank for every game: a case 3 points, a room 1, hidden
// from the child, the best rank kept. The owl's one-time tip at the rooms' door; the waiting board offers a room.
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 300) => new Promise(r => setTimeout(r, ms));
const B = 'http://localhost:8765';
const kid = (o = {}) => ({ dp_save_version: '4', dp_tutorial_done: 'true', dp_profile_v1: JSON.stringify({ av: '🕵🏽‍♀️', g: 'f', sk: '🦊', name: 'Nika', id: '1234', ...(o.p || {}) }),
  dp_played_v1: JSON.stringify(o.played || []), dp_kjekdo_v1: JSON.stringify(o.rooms || []), dp_kjekdo_intro_v1: '1', ...(o.extra || {}) });

async function open(dev, w, h, url, store) {
  const p = await b.newPage();
  p.errors = []; p.on('pageerror', e => p.errors.push(e.message));
  await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: dev !== 'ipad', deviceScaleFactor: 2 });
  await p.goto(B + url);
  await p.evaluate((s) => { localStorage.clear(); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, store);
  await p.reload(); await wait(500);
  return p;
}
const st = (p) => p.evaluate(() => S.screen);
const wide = (p) => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const tap = async (p, sel) => { await p.$eval(sel, e => e.scrollIntoView({ block: 'center' })); await p.tap(sel); await wait(); };

for (const [dev, w, h] of [['iphone14', 390, 844], ['ipad', 820, 1180], ['land', 844, 390]]) {
  // 2 cases (6 points) + 3 rooms (3 points) = 9: Detektivka, 5 solved
  const p = await open(dev, w, h, '/', kid({ played: ['bip:1', 'bip:2'], rooms: [1, 2, 3] }));
  await Promise.all([p.waitForNavigation(), p.$eval('#play', e => e.click())]); await wait(500);
  ok(await st(p) === 'office' && !(await p.$('.dp-band')), `${dev}: »Igraj zdaj« lands in the office`);
  ok(await p.$eval('.ui-badge-rank', e => e.textContent) === '🕵️ Detektivka · ✔ 5', `${dev}: one rank for both games: 2 cases + 3 rooms = Detektivka, ✔ 5`);
  ok(!(await p.evaluate(() => document.body.innerText)).match(/točk|\b9\b/), `${dev}: no points on screen`);
  ok(await p.$eval('.door-primeri', e => e.textContent.includes('Detektivski primeri') && e.textContent.includes('Kdo je bil?') && e.textContent.includes('Primer 3'))
    && await p.$eval('a.door-sobe', e => e.getAttribute('href') === '../kje-je-kdo/' && e.textContent.includes('Kje je bil kdo?') && !!e.querySelector('.dp-board')
      && e.textContent.includes(`Uganka ${DP.nextRoom(DP.roomsSolved()).room.id} te čaka`) && !!e.querySelector('.door-tag') === DP.nextRoom(DP.roomsSolved()).fresh), `${dev}: a door per game: where the cases are (Primer 3), the room the rooms' list starts with, NOVA SOBA when it is the newest`);
  ok(await p.$$eval('.door', els => els.every(e => e.getBoundingClientRect().height >= 56 && e.getBoundingClientRect().right <= innerWidth)) && await wide(p), `${dev}: the doors are big and fit the width`);
  if (process.env.SHOTS) await p.screenshot({ path: `shots/doors-${dev}-office.png` });

  // the cases' dashboard: the band, nothing of the rooms
  await tap(p, '.door-primeri');
  ok(await st(p) === 'files' && await p.$('.dp-band') && !(await p.$('.ui-badge')) && !(await p.$('.door')), `${dev}: the cases' door opens their dashboard, with the band and no badge`);
  ok(await p.$eval('#dpMe', e => e.textContent.includes('Nika') && e.textContent.includes('Detektivka · ✔ 5') && e.getBoundingClientRect().height >= 48), `${dev}: the small card: name, rank, total`);
  ok(await p.$('.dp-tab.is-on[data-tab="primeri"]') && await p.$eval('a.dp-tab[data-tab="sobe"]', e => e.getAttribute('href') === '../kje-je-kdo/'), `${dev}: tabs: Primeri on, Sobe a link to the rooms`);
  ok(await p.$$eval('.dp-tab', els => els.every(e => e.getBoundingClientRect().height >= 48)) && await wide(p), `${dev}: tabs ≥ 48 px, no sideways scroll`);
  if (process.env.SHOTS) await p.screenshot({ path: `shots/doors-${dev}-primeri.png` });
  await tap(p, '#dpMe');
  ok(await st(p) === 'office', `${dev}: the small card goes back to the office`);
  await tap(p, '.door-primeri');
  await p.goBack(); await wait(400);
  ok(await st(p) === 'office', `${dev}: back from the dashboard is the office`);

  // the rooms: the same band, the rank counted the same way
  await Promise.all([p.waitForNavigation(), p.$eval('a.door-sobe', e => e.click())]); await wait(500);
  ok(p.url().endsWith('/kje-je-kdo/') && await p.$('header.top.dp-band') && !(await p.$eval('#list', e => e.hidden)), `${dev}: the rooms' door opens the rooms list, under the band`);
  ok(await p.$eval('#back', e => e.classList.contains('dp-me') && e.getAttribute('href') === '../solo/?play&igra=pisarna' && e.textContent.includes('Detektivka · ✔ 5')), `${dev}: the small card: same rank and total, back to the office`);
  ok(await p.$('.dp-tab.is-on[data-tab="sobe"]') && await p.$eval('a.dp-tab[data-tab="primeri"]', e => e.getAttribute('href') === '../solo/?play&igra=primeri'), `${dev}: tabs: Sobe on, Primeri a link to the cases`);
  ok(await p.$eval('#capsBtn', e => e.getBoundingClientRect().height >= 48 && !!e.closest('.dp-band')) && await wide(p), `${dev}: »ABC« stays in the band; no sideways scroll`);
  if (process.env.SHOTS) await p.screenshot({ path: `shots/doors-${dev}-sobe.png` });
  // in a room the header is the plain one again
  await p.$eval('.lvl.main', e => e.click()); await wait(300);
  ok(!(await p.$('header.top.dp-band')) && await p.$eval('#back', e => e.textContent === '←') && await p.$eval('#dpTabs', e => e.hidden), `${dev}: in a room: the plain header with ←`);
  await p.evaluate(() => { closeSheet(); showList(); }); await wait(200);
  ok(await p.$('header.top.dp-band'), `${dev}: back on the list: the band again`);
  // the Primeri tab goes straight to the cases' dashboard
  await Promise.all([p.waitForNavigation(), p.$eval('a.dp-tab[data-tab="primeri"]', e => e.click())]); await wait(500);
  ok(await st(p) === 'files', `${dev}: the rooms' Primeri tab opens the cases' dashboard`);
  await Promise.all([p.waitForNavigation(), p.$eval('a.dp-tab[data-tab="sobe"]', e => e.click())]); await wait(500);
  await Promise.all([p.waitForNavigation(), p.$eval('#back', e => e.click())]); await wait(500);
  ok(await st(p) === 'office', `${dev}: the rooms' small card opens the office`);
  ok(!p.errors.length, `${dev}: no page errors ${p.errors.join('|')}`);
  await p.close();
}

// one rank: the best rank reached is kept, the rank-up comes after a room too
{
  const p = await open('iphone14', 390, 844, '/solo/?play', kid({ p: { rk: 3 } }));
  ok(await p.$eval('.ui-badge-rank', e => e.textContent) === '🎖️ Inšpektorica · ✔ 0', 'a rank reached before is never lost (stored rk 3, nothing solved)');
  await p.close();
}
{
  // 2 cases (6) + 2 rooms (2) = 8: one more room makes 9, Detektivka
  const p = await open('iphone14', 390, 844, '/kje-je-kdo/', kid({ played: ['bip:1', 'bip:2'], rooms: [1, 2] }));
  ok(await p.$eval('#back', e => e.textContent.includes('Vajenka · ✔ 4')), 'rooms: Vajenka with 2 cases and 2 rooms');
  await p.evaluate(() => { start(3); closeSheet(); for (const q of L.people) S.pos[q.id] = q.at; answer(L.culprit, document.body); }); await wait(300);
  ok(await p.$eval('#sheet', e => e.textContent.includes('Napredovala si! Zdaj si 🕵️ Detektivka.')), 'a solved room can bring the rank-up: »Napredovala si! Zdaj si 🕵️ Detektivka.«');
  ok(await p.evaluate(() => JSON.parse(localStorage.getItem('dp_profile_v1')).rk === 1), 'and the rank is kept on the ID card (rk 1)');
  ok(await p.$eval('#sheet a.big', e => e.textContent === 'Moja pisarna' && e.getAttribute('href') === '../solo/?play&igra=pisarna'), 'the solved sheet offers »Moja pisarna«');
  await p.evaluate(() => { closeSheet(); showList(); }); await wait(200);
  ok(await p.$eval('#back', e => e.textContent.includes('Detektivka · ✔ 5')), 'the band shows the new rank');
  await p.close();
}
{
  // a case solved in solo/ gives the rank-up there, counting the rooms too: 2 cases + 3 rooms = 9 → the 3rd case is the step
  const p = await open('iphone14', 390, 844, '/solo/?play', kid({ played: ['bip:1'], rooms: [1, 2, 3] }));
  ok(await p.$eval('.ui-badge-rank', e => e.textContent) === '🔰 Vajenka · ✔ 4', 'solo: Vajenka with 1 case and 3 rooms (6 points)');
  await p.evaluate(() => { S.file = 'bip'; S.c = caseFor('bip', 2); S.run = newRun(); markSolved(S.c); });
  ok(await p.evaluate(() => S.run.rankUp && S.run.rankUp.f === 'Detektivka' && profile().rk === 1), 'solo: the 2nd case + 3 rooms make 9: the rank-up, kept on the card');
  await p.close();
}

// the owl's tip at the rooms' door: once, after the first real case, only while no room is solved
{
  const p0 = await open('iphone14', 390, 844, '/solo/?play', kid({ played: ['bip:1'] }));
  ok(await p0.$('.office .dp-who') && !(await p0.$('.coach')), 'while »Kdo danes igra?« shows, no owl tip (one thing at a time)');
  await p0.close();
  const p = await open('iphone14', 390, 844, '/solo/?play', kid({ played: ['bip:1'], extra: { dp_visits_v1: JSON.stringify({ n: 1, last: Date.now(), asked: true }) } }));
  ok(await p.$('.door-sobe.coach-target') && (await p.$eval('.coach .say', e => e.textContent)).includes('skrivnostne sobe') && !(await p.$('.coach [data-coach="ok"]')), 'after the first case the owl points at the rooms\' door, with no button to press');
  ok(await p.evaluate(() => { const c = document.querySelector('.coach').getBoundingClientRect(), d = document.querySelector('.door-primeri').getBoundingClientRect(); return c.top >= d.bottom || c.bottom <= d.top; }), 'the tip never covers the cases\' door');
  await tap(p, '.door-primeri');
  ok(await st(p) === 'files', 'the cases\' door still works while the tip shows');
  await tap(p, '#dpMe');
  ok(await st(p) === 'office' && !(await p.$('.coach')), 'back in the office: the tip was once');
  ok(await p.evaluate(() => localStorage.getItem('dp_sobe_tip_v1') === 'true' && KID_KEYS.includes('dp_sobe_tip_v1')), 'it is remembered per detective');
  await p.close();
  const q = await open('iphone14', 390, 844, '/solo/?play', kid({ played: ['bip:1'], rooms: [1] }));
  ok(!(await q.$('.coach')), 'a child who already solved a room gets no tip');
  await q.close();
  const r = await open('iphone14', 390, 844, '/solo/?play', kid());
  ok(!(await r.$('.coach')), 'no tip before the first real case');
  await r.close();
}

// the waiting board: the next case isn't out yet → a room meanwhile
{
  const p = await open('iphone14', 390, 844, '/solo/?play&igra=primeri', kid({ played: ['bip:1', 'bip:2', 'bip:3', 'bip:4', 'bip:5', 'bip:6'] }));
  await p.evaluate(() => { FILES.find(f => f.id === 'bip').soon = 1; S.file = 'bip'; toBoard(); }); await wait(200);
  ok(await p.$eval('.waiting', e => e.textContent.includes('odpri skrivnostno sobo')) && await p.$eval('.waiting a.waiting-sobe', e => e.getAttribute('href') === '../kje-je-kdo/' && e.getBoundingClientRect().height >= 44), 'the waiting board offers »🚪 Odpri sobo«');
  ok(await wide(p), 'the waiting board fits the width');
  await p.close();
}

// several detectives: the rooms' links skip »Kdo igra?«; plain »Igraj zdaj« still asks
{
  const p = await open('iphone14', 390, 844, '/solo/?play', kid({ played: ['bip:1'] }));
  await p.evaluate(() => { newDetective(); }); await wait(100);
  await p.evaluate(() => { localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏻‍♂️', g: 'm', sk: '🐶', name: 'Tim', id: '4321' })); localStorage.setItem('dp_tutorial_done', 'true'); localStorage.setItem('dp_sobe_tip_v1', 'true'); });
  await p.goto(B + '/solo/?play'); await wait(500);
  ok(await st(p) === 'who', 'two detectives: »Igraj zdaj« asks who plays');
  await p.goto(B + '/solo/?play&igra=pisarna'); await wait(500);
  ok(await st(p) === 'office' && await p.$eval('.ui-band-name', e => e.textContent) === 'Tim', 'from the rooms (igra=pisarna): straight to the office of the one playing');
  await p.goto(B + '/solo/?play&igra=primeri'); await wait(500);
  ok(await st(p) === 'files', 'from the rooms (igra=primeri): straight to the cases');
  ok(!p.errors.length, 'no page errors ' + p.errors.join('|'));
  await p.close();
}
// »Kdo danes igra?« (docs/marketing/ANALYTICS.md §2): the 1st sitting, then every 3rd, once per sitting in either game
{
  const p = await open('iphone14', 390, 844, '/solo/?play', kid());
  const evs = []; p.on('request', r => { if (r.url().endsWith('/api/e')) { try { evs.push(JSON.parse(r.postData())); } catch (e) {} } });
  ok(await p.$('.office .dp-who') && (await p.$eval('.dp-who', e => e.textContent)).includes('Kdo danes igra?'), 'the 1st sitting: the office asks »Kdo danes igra?«');
  ok(await p.$$eval('.dp-who-btn', els => els.length === 2 && els.every(e => e.getBoundingClientRect().height >= 56)) && await p.$eval('.dp-who-x', e => e.getBoundingClientRect().height >= 44), 'two big answers and a ✕');
  await tap(p, '.dp-who-btn[data-with="adult"]'); await wait(200);
  const w = evs.find(e => e.ev === 'with');
  ok(w && w.game === 'solo' && w.data.with === 'adult' && w.data.n === 1 && w.data.g === 'solo' && Object.keys(w.data).length === 3, 'the answer is sent: with adult, sitting 1, asked in solo; nothing else');
  ok(!(await p.$('.dp-who')) && await st(p) === 'office', 'the card goes, the office stays');
  await p.reload(); await wait(500);
  ok(!(await p.$('.dp-who')), 'same sitting: not asked again');
  await p.goto(B + '/kje-je-kdo/'); await wait(500);
  ok(!(await p.$('#list .dp-who')), 'nor in the rooms in the same sitting');
  // the 2nd sitting: no question; the 4th: asked again, here in the rooms
  await p.evaluate(() => localStorage.setItem('dp_visits_v1', JSON.stringify({ n: 1, last: Date.now() - 31 * 60000, asked: true })));
  await p.reload(); await wait(500);
  ok(!(await p.$('#list .dp-who')) && await p.evaluate(() => JSON.parse(localStorage.getItem('dp_visits_v1')).n === 2), 'after 30 minutes a new sitting (2): not asked');
  await p.evaluate(() => localStorage.setItem('dp_visits_v1', JSON.stringify({ n: 3, last: Date.now() - 31 * 60000, asked: true })));
  await p.reload(); await wait(500);
  ok(await p.$('#list .dp-who'), 'the 4th sitting: asked again, in whichever game it starts (the rooms)');
  await p.$eval('#list .dp-who-x', e => e.click()); await wait(200);
  const x = evs.filter(e => e.ev === 'with').pop();
  ok(x && x.game === 'sobe' && x.data.with === 'skip' && x.data.n === 4 && x.data.g === 'sobe', '✕ is sent as skip, sitting 4, asked in the rooms');
  ok(!(await p.$('#list .dp-who')), 'and the card goes');
  ok(!p.errors.length, 'no page errors ' + p.errors.join('|'));
  await p.close();
}
await b.close();
