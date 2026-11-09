// Start screen order in four save states, on iPhone 14 Plus and SE: hero, NOVO, medal shelf.
import './brief-auto.mjs';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 150) => new Promise(r => setTimeout(r, ms));
const all = (f, n) => Array.from({ length: n }, (_, i) => `${f}:${i + 1}`);
const states = {
  fresh: [],
  now: [...all('bip', 6)],
  mid: [...all('bip', 6), ...all('galeb', 2)],
  done: [...all('bip', 6), ...all('galeb', 6)],
};
for (const [dev, w, h] of [['plus14', 428, 926], ['iphone14', 390, 844]]) {
  for (const [st, played] of Object.entries(states)) {
    const p = await b.newPage();
    const errors = []; p.on('pageerror', e => errors.push(e.message));
    await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    await p.goto('http://localhost:8765/solo/?play');
    await p.evaluate((pl) => { localStorage.clear(); localStorage.setItem('dp_save_version', '4'); localStorage.setItem('dp_tutorial_done', 'true');
      localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏻‍♂️', g: 'm', sk: '🐶', name: 'Klai', id: '9745' }));
      localStorage.setItem('dp_played_v1', JSON.stringify(pl)); }, played);
    await p.reload(); await wait(500);
    const cards = await p.$$eval('.file-card:not(.teaser)', els => els.map(e => e.dataset.file + (e.classList.contains('hero') ? '*' : '')));
    const shelf = await p.$$eval('.medal', els => els.map(e => e.dataset.file));
    const heroBtn = await p.evaluate(() => { const g = document.querySelector('.hero .go'); if (!g) return null; const r = g.getBoundingClientRect(); return { t: g.textContent, vis: r.bottom <= innerHeight }; });
    console.log(dev, st, cards.join(' '), '| shelf', shelf.join(' '), '|', heroBtn && heroBtn.t);
    const expect = { fresh: ['bip*', 'galeb', 'muzej'], now: ['muzej*', 'galeb'], mid: ['galeb*', 'muzej'], done: ['muzej*'] }[st];
    ok(JSON.stringify(cards) === JSON.stringify(expect), `${dev} ${st}: card order ${cards}`);
    ok(shelf.length === { fresh: 0, now: 1, mid: 1, done: 2 }[st], `${dev} ${st}: shelf`);
    if (heroBtn) ok(heroBtn.vis, `${dev} ${st}: the hero button is on screen without scrolling`);
    const novo = await p.$$eval('.file-card:not(.teaser)', els => els.map(e => e.dataset.file + ':' + [...e.querySelectorAll('.ui-tag')].map(t => t.textContent).join(' · ')));
    if (st === 'mid') ok(novo.includes('muzej:NOVO · 🔎 skrivnost') && novo.includes('galeb:'), `${dev} mid: NOVO only on the unstarted ${novo}`);
    const W = await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    ok(W, `${dev} ${st}: no sideways scroll`);
    await p.screenshot({ path: `shots/start-${dev}-${st}.png` });
    if (st === 'now') { // finishing Galeb in this session: the medal flies onto the shelf
      await p.evaluate(() => { localStorage.setItem('dp_played_v1', JSON.stringify([...JSON.parse(localStorage.getItem('dp_played_v1')), ...[1,2,3,4,5,6].map(n => 'galeb:' + n)])); render(); });
      ok(await p.$('.medal.arrive[data-file="galeb"]') && (await p.$$('.medal.arrive')).length === 1, `${dev}: a new medal flies onto the shelf`);
      await p.click('.medal[data-file="bip"]'); await wait(300);
      ok(await p.evaluate(() => S.screen === 'board' && S.file === 'bip'), `${dev}: a medal opens its board`);
    }
    ok(!errors.length, `${dev} ${st}: no page errors ${errors}`);
    await p.close();
  }
}
await b.close();
