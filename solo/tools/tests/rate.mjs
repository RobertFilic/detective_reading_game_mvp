// »Ti je bil primer všeč?« on the solved screen: three faces, one tap sends one anonymous `rate` event
// (case, r, first), the faces turn into »Hvala!«, a second tap sends nothing, the warm-up never asks,
// and »Naprej« stays on screen (iPhone 14, a small phone, landscape).
import './brief-auto.mjs';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 150) => new Promise(r => setTimeout(r, ms));

for (const [dev, w, h] of [['iphone14', 390, 844], ['se', 375, 667], ['land', 844, 390]]) {
  const p = await b.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.evaluateOnNewDocument(() => {
    window.__sent = [];
    navigator.sendBeacon = (url, body) => { window.__sent.push(JSON.parse(body)); return true; };
  });
  await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8765/solo/?play');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('dp_save_version', '4'); localStorage.setItem('dp_tutorial_done', 'true');
    localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏽‍♀️', g: 'f', sk: '🐶', name: 'Ana', id: '1234' })); });
  await p.reload(); await wait(400);

  // a solved pokal case, straight to the newspaper
  await p.evaluate(() => { S.session ||= 'test'; S.c = caseById('p1'); S.file = 'pokal'; S.run = newRun(); S.screen = 'reveal'; render(); });
  await wait(300);
  const faces = await p.$$eval('.rate-btn', els => els.map(e => e.textContent.trim()));
  ok(faces.length === 3 && faces[0].startsWith('😍') && faces[2].startsWith('😕'), `${dev}: three faces ${faces.join(' | ')}`);
  ok(await p.evaluate(() => document.body.innerText.includes('Ti je bil primer všeč?')), `${dev}: the question shows`);
  const fit = await p.evaluate(() => [...document.querySelectorAll('.rate-btn')].every(e => { const r = e.getBoundingClientRect(); return r.width >= 60 && r.height >= 60 && r.right <= innerWidth; })
    && document.documentElement.scrollWidth <= innerWidth);
  ok(fit, `${dev}: big tap targets, no sideways scroll`);
  if (dev === 'iphone14') await p.screenshot({ path: 'shots/rate-iphone14.png' });

  await p.evaluate(() => { window.__sent.length = 0; });
  await p.evaluate(() => document.querySelector('.rate-btn[data-r="2"]').scrollIntoView());
  await p.click('.rate-btn[data-r="2"]'); await wait(200);
  const sent = await p.evaluate(() => window.__sent.filter(e => e.ev === 'rate'));
  ok(sent.length === 1 && sent[0].data.case === 'p1' && sent[0].data.r === 2 && sent[0].game === 'solo', `${dev}: one rate event ${JSON.stringify(sent)}`);
  ok(sent.length === 1 && Object.keys(sent[0].data).sort().join() === 'case,first,r', `${dev}: only case, r and first are sent`);
  ok(await p.evaluate(() => !document.querySelector('.rate-btn') && document.querySelector('.rate.is-done')?.textContent.includes('Hvala')), `${dev}: the faces become »Hvala!«`);
  await p.evaluate(() => ACTIONS.rate({ dataset: { r: '3' } })); await wait(100);
  ok(await p.evaluate(() => window.__sent.filter(e => e.ev === 'rate').length) === 1, `${dev}: a second tap sends nothing`);
  ok(await p.evaluate(() => { const n = document.querySelector('.reveal [data-act="next"]'); const r = n && n.getBoundingClientRect(); return !!r && r.bottom <= innerHeight + 1; }), `${dev}: »Naprej« stays on screen`);

  // the warm-up never asks
  await p.evaluate(() => { S.c = caseById('w1'); S.run = newRun(); S.screen = 'reveal'; render(); }); await wait(200);
  ok(!(await p.$('.rate')), `${dev}: no question after a warm-up case`);
  ok(!errors.length, `${dev}: no page errors ${errors}`);
  await p.close();
}
await b.close();
