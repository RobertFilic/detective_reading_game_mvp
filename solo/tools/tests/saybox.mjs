// The companion's goal bubble (.pal-say) lies above the footer, never over »Preveri«, »Naprej« or the coin:
// torn, cipher, order, lock and ask steps of the new seasons on three screens. Run with TEST_DATE=2026-11-27 for dated seasons.
import './brief-auto.mjs';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 150) => new Promise(r => setTimeout(r, ms));
const kid = { av: '🕵🏽‍♀️', g: 'f', sk: '🦊', name: 'Ana', id: '1234' };
const known = Object.fromEntries(['scene', 'ask', 'words', 'lock', 'order', 'cipher', 'torn', 'lie', 'herring', 'when'].map(k => [k, { n: 3, hard: false }]));
const state = JSON.stringify({ v: 2, g: 1, over: null, warm: 'done', streak: 0, skills: known, hist: [] });
const cases = [['n2', 'torn'], ['i2', 'torn'], ['i4', 'torn'], ['n3', 'cipher'], ['i3', 'cipher'], ['n4', 'order'], ['i5', 'order'], ['n6', 'lock'], ['i6', 'lock'], ['n2', 'ask'], ['i2', 'ask']];
for (const [dev, w, h] of [['iphone14', 390, 844], ['se', 375, 667], ['land', 852, 393]]) {
  const p = await b.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.evaluateOnNewDocument(() => { window.NO_READ_WAIT = true; if (window.speechSynthesis) speechSynthesis.getVoices = () => []; });
  await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8765/solo/?play&help=2');
  await p.evaluate((k, hs) => { localStorage.clear(); localStorage.setItem('dp_save_version', '4'); localStorage.setItem('dp_profile_v1', JSON.stringify(k));
    localStorage.setItem('dp_help_v1', hs); localStorage.setItem('dp_ugovor_v1', 'true'); }, kid, state);
  await p.reload(); await wait(400);
  for (const [id, step] of cases) {
    const has = await p.evaluate((id, step) => {
      const c = CASES.find(x => x.id === id);
      if (!c || !c.steps || !c.steps.includes(step)) return false;
      S.file = c.file; playCase(c.no); go(step); return true;
    }, id, step).catch(() => false);
    if (!has) { ok(false, `${dev} ${id} ${step}: case/step found`); continue; }
    await wait(200);
    if (await p.$('[data-act="briefOk"]')) { await p.click('[data-act="briefOk"]'); await wait(250); }
    if (!(await p.$('.pal-say'))) await p.evaluate(() => sayGoal());
    const r = await p.evaluate(() => {
      const s = document.querySelector('.pal-say').getBoundingClientRect();
      const hit = [...document.querySelectorAll('.footer *, .ui-foot *, .pal')].filter(e => { const q = e.getBoundingClientRect(); return q.width && q.height && s.left < q.right && s.right > q.left && s.top < q.bottom && s.bottom > q.top; });
      return { n: hit.length, top: s.top, bottom: s.bottom, vis: s.top >= 0 && s.bottom <= innerHeight, btn: !!document.querySelector('.footer .btn, .ui-foot .ui-btn, .footer button') };
    });
    ok(r.n === 0 && r.vis, `${dev} ${id} ${step}: the bubble does not touch the footer (${r.n} overlaps, ${Math.round(r.top)}–${Math.round(r.bottom)})`);
    await p.screenshot({ path: `shots/saybox-${dev}-${id}-${step}.png` });
  }
  ok(!errors.length, `${dev}: no page errors ${errors.join('|')}`);
  await p.close();
}
await b.close();
