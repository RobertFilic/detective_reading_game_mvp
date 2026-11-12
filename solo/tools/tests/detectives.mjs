// Kdo igra?: removing a detective takes the quiet button, a 🗑️ on the card and a grown-up's sum,
// and a wrong sum or Prekliči removes nobody. Removing the one playing hands over to the next.
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 200) => new Promise(r => setTimeout(r, ms));

const klai = { av: '🕵🏻‍♂️', g: 'm', sk: '🐶', name: 'Klai', id: '9745' };
const ema = { dp_profile_v1: JSON.stringify({ av: '🕵🏼‍♀️', g: 'f', sk: '🐱', name: 'Ema', id: '1234' }), dp_played_v1: '["bip:1"]', dp_tutorial_done: 'true' };

for (const [name, w, h] of [['iPhone 14', 390, 844], ['iPad', 820, 1180], ['landscape', 844, 390]]) {
  const p = await b.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8765/solo/?play');
  await p.evaluate((klai, ema) => {
    localStorage.clear();
    localStorage.setItem('dp_save_version', '4');
    localStorage.setItem('dp_tutorial_done', 'true');
    localStorage.setItem('dp_profile_v1', JSON.stringify(klai));
    localStorage.setItem('dp_played_v1', JSON.stringify(['bip:1', 'bip:2']));
    localStorage.setItem('dp_detectives_v1', JSON.stringify({ active: 'd1', list: [{ key: 'd1', data: null }, { key: 'd2', data: ema }] }));
  }, klai, ema);
  await p.reload(); await wait(500);
  const click = async (sel, ms = 200) => { await p.click(sel); await wait(ms); };
  const titles = () => p.$$eval('.who-card:not(.add) .ui-item-title', els => els.map(e => e.textContent));
  const sum = () => p.$eval('#modal', m => m.dataset.answer);
  const answer = async (v) => { await p.$eval('#gateIn', (i, v) => { i.value = v; }, v); await click('#modal [data-m="ok"]'); };

  // two detectives: the game opens on Kdo igra?
  ok(String(await titles()) === 'Klai,Ema', `${name}: two detectives on Kdo igra?`);
  ok(!(await p.$('[data-act="askRemove"]')), `${name}: no 🗑️ until the grown-up asks for it`);

  await click('[data-act="whoEdit"]');
  ok((await p.$$('[data-act="askRemove"]')).length === 2 && !(await p.$('[data-act="addDetective"]')), `${name}: »Odstrani detektiva« shows a 🗑️ on each card, no new card`);

  await click('[data-act="askRemove"][data-key="d2"]');
  ok(await p.$eval('#modal', m => !m.hidden && m.textContent.includes('»Ema«')), `${name}: the box names the detective`);
  await click('#modal [data-m="cancel"]');
  ok(String(await titles()) === 'Klai,Ema', `${name}: Prekliči removes nobody`);

  await click('[data-act="askRemove"][data-key="d2"]');
  await answer(String(Number(await sum()) + 1));
  ok(await p.$eval('#modal', m => !m.hidden) && String(await titles()) === 'Klai,Ema', `${name}: a wrong sum removes nobody`);
  await answer(await sum());
  ok(String(await titles()) === 'Klai', `${name}: the right sum removes Ema`);

  // the one playing: nobody is left, so the next child makes a new ID card
  await click('[data-act="askRemove"][data-key="d1"]');
  await answer(await sum(), 500);
  const left = await p.evaluate(() => ({ screen: S.screen, profile: localStorage.getItem('dp_profile_v1'), played: localStorage.getItem('dp_played_v1'), d: JSON.parse(localStorage.getItem('dp_detectives_v1')) }));
  ok(left.screen === 'make' && !left.profile && !left.played && !left.d.list.length, `${name}: removing the last one clears the device and opens a new ID card`);
  ok(!errors.length, `${name}: no page errors ${errors.join(' | ')}`);
  await p.close();
}

// removing the one playing while another waits: the other takes over with their own cases
{
  const p = await b.newPage();
  await p.goto('http://localhost:8765/solo/?play');
  await p.evaluate((klai, ema) => {
    localStorage.clear();
    localStorage.setItem('dp_save_version', '4');
    localStorage.setItem('dp_tutorial_done', 'true');
    localStorage.setItem('dp_profile_v1', JSON.stringify(klai));
    localStorage.setItem('dp_detectives_v1', JSON.stringify({ active: 'd1', list: [{ key: 'd1', data: null }, { key: 'd2', data: ema }] }));
    removeDetective('d1');
  }, klai, ema);
  const s = await p.evaluate(() => ({ name: JSON.parse(localStorage.getItem('dp_profile_v1')).name, played: localStorage.getItem('dp_played_v1'), d: JSON.parse(localStorage.getItem('dp_detectives_v1')) }));
  ok(s.name === 'Ema' && s.played === '["bip:1"]' && s.d.active === 'd2' && s.d.list.length === 1, 'removing the one playing hands over to Ema with her solved case');
}
await b.close();
