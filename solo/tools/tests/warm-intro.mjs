// The intro card before the very first warm-up (a quiet skip beside »Začniva!«), "everything found" without a
// message card (the counter turns into a green chip), and digits in the detective's name.
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 150) => new Promise(r => setTimeout(r, ms));
const kid = { av: '🕵🏽‍♀️', g: 'f', sk: '🦊', name: 'Ana', id: '1234' };
const newKid = { dp_save_version: '4', dp_profile_v1: JSON.stringify(kid) };

async function open(w, h, storage, reload = true) {
  const p = await b.newPage();
  p.errors = []; p.on('pageerror', e => p.errors.push(e.message));
  await p.evaluateOnNewDocument(() => { window.NO_READ_WAIT = true; if (window.speechSynthesis) speechSynthesis.getVoices = () => []; });
  await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8765/solo/?play');
  await p.evaluate((st) => { localStorage.clear(); for (const [k, v] of Object.entries(st)) localStorage.setItem(k, v); }, storage);
  if (reload) { await p.reload(); await wait(400); }
  p.st = () => p.evaluate(() => S.screen);
  p.help = () => p.evaluate(() => JSON.parse(localStorage.getItem('dp_help_v1')));
  p.fits = () => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth && [...document.querySelectorAll('.brief .ui-btn')].every(e => { const r = e.getBoundingClientRect(); return r.bottom <= innerHeight && r.right <= innerWidth; }));
  return p;
}

// ---- the card on three screens, then »Začniva!«
for (const [dev, w, h] of [['iphone14', 390, 664], ['se', 340, 667], ['land', 852, 393]]) {
  const p = await open(w, h, newKid);
  const t = await p.evaluate(() => document.querySelector('.brief.offer') && document.querySelector('.brief.offer').innerText);
  ok(await p.st() === 'call' && t && t.includes('Juhu! Najprej vaja. Skupaj rešiva en primer, da vidiš, kako gre.'), `${dev}: a new detective sees the intro card`);
  ok(await p.$('[data-act="warmGo"]') && await p.$('[data-act="warmSkip"].is-quiet') && (await p.$eval('[data-act="warmGo"]', e => e.textContent)) === 'Začniva!' && (await p.$eval('[data-act="warmSkip"]', e => e.textContent)) === 'Že znam, preskoči', `${dev}: »Začniva!« and the quiet »Že znam, preskoči«`);
  ok(!(await p.$('.coach')) && !(await p.$('.coach-spot')) && !(await p.$('.coach-hand')), `${dev}: no coach under the card`);
  ok(await p.fits(), `${dev}: both buttons are on the screen`);
  ok((await p.help()) === null || (await p.help()).warm === 'new', `${dev}: still »new« while the card is open`);
  ok(await p.evaluate(() => LOG.some(e => e.type === 'warm_intro')), `${dev}: warm_intro logged`);
  await p.screenshot({ path: `shots/warm-intro-${dev}.png` });
  await p.click('[data-act="warmGo"]'); await wait(300);
  ok(await p.st() === 'call' && !(await p.$('.brief.offer')) && await p.$('.coach-hand') && (await p.help()).warm === 'w1', `${dev}: »Začniva!« → w1 with the coach, warm-up w1`);
  // a reload mid-w1 resumes it without the card
  await p.reload(); await wait(400);
  ok(await p.evaluate(() => S.c.id === 'w1') && !(await p.$('.brief.offer')) && await p.$('.coach'), `${dev}: a reload mid-w1: no card, the companion is back`);
  ok(!p.errors.length, `${dev}: no page errors ${p.errors.join('|')}`);
  await p.close();
}

// ---- a reload while the card is open shows it again; »Že znam, preskoči«
{
  const p = await open(390, 664, newKid);
  await p.reload(); await wait(400);
  ok(await p.$('[data-act="warmGo"]'), 'a reload with the card open: the card again');
  await p.click('[data-act="warmSkip"]'); await wait(300);
  const hp = await p.help();
  ok(await p.st() === 'files' && hp.warm === 'skipped' && hp.g === 2, '»Že znam, preskoči« → the adventures, warm skipped, help 2');
  ok(await p.evaluate(() => LOG.some(e => e.type === 'warm_skip')), 'warm_skip logged');
  // the adult replays the practice: no card (the child has chosen already)
  await p.click('[data-act="tutorial"]'); await wait(300);
  ok(await p.evaluate(() => S.c.id === 'w1' && S.warmReplay) && !(await p.$('.brief.offer')) && await p.$('.coach'), 'a replay (»Ponovi vajo«, ❓): straight to w1, no card');
  ok(!p.errors.length, `no page errors ${p.errors.join('|')}`);
  await p.close();
}

// ---- digits in the name
{
  const p = await open(390, 664, {}, false);
  await p.reload(); await wait(400);
  await p.click('[data-act="mkHello"]'); await wait(150);
  await p.click('[data-act="mkAvatar"][data-i="4"]'); await wait(150);
  await p.click('[data-act="mkSidekick"][data-e="🐶"]'); await wait(150);
  await p.type('#mkName', 'ana 2'); await p.click('[data-act="mkName"]'); await wait(150);
  ok(await p.$eval('.ui-id-name', e => e.textContent) === 'Ana 2', 'the name »ana 2« is kept as »Ana 2«');
  await p.click('[data-act="mkBack"]'); await wait(100);
  await p.evaluate(() => { document.getElementById('mkName').value = ''; });
  await p.type('#mkName', '1234567890123'); await p.click('[data-act="mkName"]'); await wait(150);
  ok(await p.$eval('.ui-id-name', e => e.textContent) === '123456789012', 'digits count to the 12-character limit');
  await p.screenshot({ path: 'shots/warm-intro-name.png' });
  await p.close();
}

// ---- everything found: no card, a green chip, the button glows (scene and questioning)
async function toStep(p, step) {
  await p.evaluate((s) => { S.file = 'bip'; playCase(1); S.run.briefed = [...S.c.steps]; go('call'); }, step); await wait(100);
  await p.click('[data-act="answer"]'); await p.click(step === 'scene' ? '[data-act="toScene"]' : '[data-act="toScene"]'); await wait(100);
}
for (const [dev, w, h] of [['iphone14', 390, 664], ['land', 852, 393]]) {
  const p = await open(w, h, { ...newKid, dp_help_v1: JSON.stringify({ v: 2, g: 1, over: null, warm: 'done', streak: 0, skills: {}, hist: [] }), dp_ugovor_v1: 'true' });
  await toStep(p, 'scene');
  const first = await p.evaluate(() => S.screen);
  await p.evaluate(() => { document.querySelectorAll('[data-act="briefOk"]').forEach(e => e.click()); });
  await p.click('[data-act="torch"]'); await wait(80);
  for (const sid of await p.$$eval('.obj:not(.got)', els => els.map(e => e.dataset.sid))) {
    await p.evaluate(() => { const n = document.querySelector('[data-act="noteOk"]'); if (n) n.click(); });
    await p.click(`.obj[data-sid="${sid}"]`); await wait(70);
  }
  await wait(200);
  ok(first === 'scene' && !(await p.$('#note')) && !(await p.$('[data-act="noteOk"]')), `${dev} scene: after the last clue no card`);
  ok((await p.$eval('.pocket-count', e => e.textContent)).trim() === '✓ Vse najdeno' && await p.$('.pocket-count.is-done'), `${dev} scene: the chip »✓ Vse najdeno«`);
  ok(await p.$('[data-act="toSolve"].pulse') && !(await p.$eval('[data-act="toSolve"]', e => e.disabled)), `${dev} scene: the button glows at once`);
  ok((await p.$eval('.qbar', e => e.textContent)).includes('Vse je preiskano'), `${dev} scene: the line on top says it`);
  ok(await p.evaluate(() => { const r = document.querySelector('[data-act="toSolve"]').getBoundingClientRect(); return r.bottom <= innerHeight && document.documentElement.scrollWidth <= innerWidth; }), `${dev} scene: the button is on the screen`);
  await p.screenshot({ path: `shots/done-${dev}-scene.png` });
  ok(!p.errors.length, `${dev}: no page errors ${p.errors.join('|')}`);
  await p.close();
}
{
  const p = await open(390, 664, { ...newKid, dp_help_v1: JSON.stringify({ v: 2, g: 1, over: null, warm: 'done', streak: 0, skills: {}, hist: [] }), dp_ugovor_v1: 'true' });
  await p.evaluate(() => { S.file = 'bip'; playCase(2); S.run.briefed = [...S.c.steps]; S.run.answered = true; go('ask'); }); await wait(150);
  const qs = await p.evaluate(() => own('ask').map(s => [s.who, s.id]));
  for (const [who, sid] of qs) {
    await p.evaluate(() => document.querySelectorAll('[data-act="briefOk"], [data-act="noteOk"]').forEach(e => e.click()));
    await p.click(`[data-act="askWho"][data-id="${who}"]`); await wait(80);
    await p.click(`[data-act="askQ"][data-sid="${sid}"]`); await wait(1800);
  }
  ok(!(await p.$('#note')) && (await p.$eval('.pocket-count', e => e.textContent)).trim() === '✓ Vsi so odgovorili', 'questioning: the chip »✓ Vsi so odgovorili«, no card');
  ok(await p.$('[data-act="toSolve"].pulse'), 'questioning: the button glows at once');
  ok((await p.$eval('.qbar', e => e.textContent)).includes('Vsi so odgovorili'), 'questioning: the line on top says it');
  await p.screenshot({ path: 'shots/done-iphone14-ask.png' });
  await p.close();
}
await b.close();
