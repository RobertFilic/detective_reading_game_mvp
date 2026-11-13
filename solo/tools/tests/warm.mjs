// The two warm-up cases and the companion's help (docs/WARMUP_AND_HELP.md): a new detective follows the
// companion through w1, is offered to go on alone or plays w2, and lands on the newest season. The coin in
// the footer is a free hint; a pause brings the goal. A detective from before the warm-up skips it.
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 150) => new Promise(r => setTimeout(r, ms));
const kid = { av: '🕵🏽‍♀️', g: 'f', sk: '🦊', name: 'Ana', id: '1234' };

async function open(dev, w, h, storage) {
  const p = await b.newPage();
  p.errors = []; p.on('pageerror', e => p.errors.push(e.message));
  await p.evaluateOnNewDocument(() => { if (window.speechSynthesis) speechSynthesis.getVoices = () => []; });
  await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8765/solo/?play');
  await p.evaluate((st) => { localStorage.clear(); for (const [k, v] of Object.entries(st)) localStorage.setItem(k, v); }, storage);
  await p.reload(); await wait(400);
  if (storage === newKid) { await p.click('[data-act="warmGo"]'); await wait(300); }   // the intro card (warm-intro.mjs tests it)
  p.st = () => p.evaluate(() => S.screen);
  p.say = () => p.$eval('.coach .say', e => e.textContent).catch(() => '');
  p.help = () => p.evaluate(() => JSON.parse(localStorage.getItem('dp_help_v1')));
  p.fits = () => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  return p;
}
const newKid = { dp_save_version: '4', dp_profile_v1: JSON.stringify(kid) };
// taps only what the companion rings (or its »V redu«), like a child who follows every step
async function follow(p, until) {
  for (let i = 0; i < 60; i++) {
    if (await until()) return true;
    const sel = ['[data-act="excuseOk"]', '[data-coach="ok"]', '.coach-target'];
    for (const s of sel) if (await p.$(s)) { await p.click(s); break; }
    await wait(140);
  }
  return false;
}
// opens every thing in the scene (each tap redraws the screen, so they are found again by id)
async function openAll(p) {
  for (const sid of await p.$$eval('.obj:not(.got)', els => els.map(e => e.dataset.sid))) {
    await p.click(`.obj[data-sid="${sid}"]`); await wait(70);
    if (await p.$('#note')) await p.click('[data-act="noteOk"]');
  }
}
const pair = async (p, sid, who) => { await p.click(`.row[data-sid="${sid}"]`); await wait(60); await p.click(`.suspect[data-id="${who}"]`); await wait(200); };

// ---- w1 on three screens: every tap is the ringed one; then the offer, »Sama!«, the newest season
for (const [dev, w, h] of [['iphone14', 390, 844], ['se', 375, 667], ['land', 844, 390]]) {
  const p = await open(dev, w, h, newKid);
  ok(await p.st() === 'call' && await p.evaluate(() => S.c.id) === 'w1' && (await p.evaluate(() => document.body.innerText)).includes('Vaja'), `${dev}: a new detective starts with the warm-up case w1 (»Vaja«)`);
  ok((await p.say()).includes('Juhu! Telefon zvoni!') && await p.$('.coach-hand') && !(await p.$('[data-act="back"]')), `${dev}: the fox says hello and points at the phone; no way back`);
  const seen = new Set(), bad = []; let fit = true, briefs = 0;
  const done = await follow(p, async () => { seen.add(await p.say()); fit = fit && await p.fits();
    // the bubble: on the screen, never on what it points at; the ring: whole on the screen
    const g = await p.evaluate(() => { const c = document.querySelector('.coach'), s = document.querySelector('.coach-spot'), t = document.querySelector('.coach-target'); if (!c || !s || !t) return null;
      const cr = c.getBoundingClientRect(), sr = s.getBoundingClientRect(), tr = t.getBoundingClientRect();
      return { say: c.querySelector('.say').textContent, over: cr.top < tr.bottom - 1 && cr.bottom > tr.top + 1 && cr.left < tr.right - 1 && cr.right > tr.left + 1, ring: sr.left >= 12 && sr.right <= innerWidth - 12, on: cr.top >= 0 && cr.bottom <= innerHeight, gap: Math.round(Math.min(Math.abs(cr.top - tr.bottom), Math.abs(tr.top - cr.bottom))) }; });
    if (g && (g.over || !g.ring || !g.on || (h > w && g.gap > 90))) bad.push(JSON.stringify(g)); briefs += (await p.$('.brief:not(.excuse-card):not(.offer)')) ? 1 : 0; return !!(await p.$('.offer')); });
  ok(done, `${dev}: following the ring alone solves w1 and brings the offer`);
  for (const t of ['Preberiva, kaj pravi.', 'Poglej stvari in tapni vsako.', 'Preberi stavek.', 'Kdo ni bil? Prečrtajva ga.', 'Preberi stavek, ki sveti. Tapni ga.', 'O kom govori? Tapni obraz.', 'Ostal je eden. Kje je dokaz?', 'Juhu! Bravo, detektivka!'])
    ok(seen.has(t), `${dev}: the companion says »${t}«`);
  ok(fit && !briefs && !(await p.$('.pal')), `${dev}: no sideways scroll, no instruction cards, no coin in w1`);
  ok(!bad.length, `${dev}: the bubble sits next to what it points at, never on it, and the ring is whole on the screen ${bad.join(' ')}`);
  ok(await p.evaluate(() => S.run.lead.miss === 0 && S.run.wrong === 0 && !LOG.some(e => e.type === 'hint_shown')), `${dev}: nothing counted as wrong, no hints`);
  ok((await p.$eval('.offer', e => e.innerText)).includes('Poskusi sama!') && (await p.$$('.offer .ui-btn')).length === 2, `${dev}: »Že znaš? Poskusi sama!« with two buttons`);
  await p.screenshot({ path: `shots/warm-${dev}-offer.png` });
  await p.click('[data-act="warmSkip"]'); await wait(300);
  const hp = await p.help();
  ok(await p.st() === 'files' && hp.warm === 'skipped' && hp.g === 2, `${dev}: »Sama!« goes to the adventures (warm: skipped, help 2)`);
  ok(await p.evaluate(() => document.querySelector('.file-card.hero').dataset.file === FILES[FILES.length - 1].id), `${dev}: the newest season is the big card`);
  ok((await p.say()).includes('izberi pustolovščino') && await p.evaluate(() => localStorage.getItem('dp_played_v1') === null && document.querySelector('.ui-badge-rank').textContent.includes('Vajenka')), `${dev}: the last bubble; the warm-up is no solved case and no rank`);
  ok(!p.errors.length, `${dev}: no page errors ${p.errors.join('|')}`);
  await p.close();
}

// ---- w1 with a wrong tap: not counted, said again, no offer; a reload in between starts the case again
{
  const p = await open('iphone14', 390, 844, newKid);
  await follow(p, async () => await p.st() === 'solve' && !(await p.$('[data-coach="ok"]')));
  await p.click('.suspect[data-id="zala"]'); await wait(150);   // a face before any sentence
  ok((await p.say()).startsWith('Skoraj!') && await p.evaluate(() => S.run.lead.miss === 1 && S.run.wrong === 0 && !S.run.note && !S.run.hint), 'w1: a wrong tap → »Skoraj!« and the same step, not counted, no card');
  await pair(p, 's1', 'zala');   // a sentence that clears nobody
  ok(await p.evaluate(() => S.run.lead.miss === 2 && S.run.crossed.length === 0 && LOG.filter(e => e.type === 'lead_miss').length === 2), 'w1: a pair that doesn\'t fit is a lead_miss too');
  await p.screenshot({ path: 'shots/warm-oops.png' });
  await p.reload(); await wait(400);
  ok(await p.st() === 'call' && await p.evaluate(() => S.c.id === 'w1' && !S.run.answered) && (await p.help()).warm === 'w1', 'a reload half-way starts w1 again');
  await follow(p, async () => await p.st() === 'solve' && !(await p.$('[data-coach="ok"]')));
  await p.click('.suspect[data-id="zala"]'); await wait(100);
  const toW2 = await follow(p, async () => await p.evaluate(() => S.c && S.c.id === 'w2'));
  ok(toW2 && !(await p.$('.offer')) && (await p.help()).warm === 'w2', 'after a wrong tap in w1 there is no offer: w2 follows');

  // ---- w2: alone. One hello, the instruction cards, the coin's line once, hints from the coin
  await p.click('[data-act="answer"]'); await wait(150);
  ok((await p.say()) === 'Zdaj ti. Jaz gledam.' && !(await p.$('.coach-spot')), 'w2: »Zdaj ti. Jaz gledam.«');
  await p.click('[data-coach="ok"]'); await p.click('[data-act="toScene"]'); await wait(200);
  ok(await p.$('.brief') && !(await p.$('.coach')), 'w2: the scene opens with its instruction card, the companion is quiet');
  await p.click('[data-act="briefOk"]'); await wait(100);
  ok(await p.$('.footer .pal') && (await p.$eval('.pal', e => e.textContent)).includes('🦊') && !(await p.$('[data-act="torch"]')), 'w2: the companion\'s coin is in the footer; no torch (nothing is dark in a warm-up)');
  await p.click('.pal'); await wait(150);
  ok((await p.$eval('#note', e => e.innerText)).includes('Tapni vsako stvar.') && await p.evaluate(() => S.run.coin === 0), 'scene: the coin says the goal (not a hint)');
  await p.click('[data-act="noteOk"]'); await wait(100);
  ok((await p.$$('.obj.pulse')).length === 5, 'scene: after the coin every thing still closed pulses');
  await openAll(p); await p.click('[data-act="toSolve"]'); await wait(200);
  await p.click('[data-act="briefOk"]'); await wait(150);
  ok((await p.say()) === 'Ne gre? Tapni me. Namig je zastonj.' && await p.$('.pal.coach-target'), 'w2 solve: »Ne gre? Tapni me. Namig je zastonj.« with the ring on the coin');
  await p.screenshot({ path: 'shots/warm-w2-coin.png' });
  await p.click('.pal'); await wait(150);
  ok((await p.$eval('#hint', e => e.innerText)).includes('Kdo NI mogel biti?') && !(await p.$eval('#hint', e => e.innerText)).includes('Ni prav') && !(await p.$('.coach')), 'the coin gives the case\'s hint, without »Ni prav«; the line is gone');
  await p.click('[data-act="hintOk"]'); await wait(100);
  ok(!(await p.$('.coach')), 'the coin\'s line comes only once');
  await p.click('.pal'); await wait(150);
  ok((await p.$eval('#hint', e => e.innerText)).includes('Preberi stavek, ki sveti') && (await p.$$('.row.dim')).length === 4 && await p.$eval('.row[data-sid="s4"]', e => getComputedStyle(e).boxShadow.includes('248, 202, 101')), 'second tap: the next sentence shines, the others are dimmed');
  await p.click('[data-act="hintOk"]'); await p.click('.pal'); await wait(150);
  ok((await p.$eval('#hint', e => e.innerText)).includes('To ni Bine.') && await p.$('.row.pulse[data-sid="s4"]') && await p.$('.suspect.pulse[data-id="bine"]'), 'third tap: the answer with its reason (»To ni Bine.«), sentence and face pulse');
  await p.screenshot({ path: 'shots/warm-w2-answer.png' });
  await p.click('[data-act="hintOk"]');
  await pair(p, 's4', 'bine'); await pair(p, 's5', 'jure');
  await p.click('[data-act="noteOk"]'); await p.click('.pal'); await wait(150);
  ok((await p.$eval('#hint', e => e.innerText)).includes('To je dokaz: Zala!'), 'the last one: »To je dokaz: Zala!«');
  await p.click('[data-act="hintOk"]'); await pair(p, 's3', 'zala');
  await p.click('[data-act="excuseOk"]'); await wait(150);
  ok(await p.st() === 'reveal' && (await p.say()) === 'Zdaj znaš! Greva na pravi primer.', 'w2 solved: »Zdaj znaš! Greva na pravi primer.«');
  await p.click('[data-act="next"]'); await wait(300);
  const hp = await p.help();
  ok(await p.st() === 'files' && hp.warm === 'done' && hp.g === 3, 'shown the answer in w2 → a lot of help (3) to start with');
  ok(await p.evaluate(() => LOG.some(e => e.type === 'help_level' && e.verdict === 'hard' && e.to === 3) && LOG.filter(e => e.type === 'hint_shown' && e.via === 'coin').length === 4), 'the log has help_level and the coin\'s hints');
  // the grown-up's review still opens with warm-up cases in the log
  await p.evaluate(() => go('debrief')); await wait(200);
  ok(await p.st() === 'debrief' && !p.errors.length, `the review opens ${p.errors.join('|')}`);
  await p.close();
}

// ---- w2 alone and clean → little help; a wrong pair gives the hint at once → some help
for (const [name, slip, g] of [['clean', false, 1], ['one wrong pair', true, 2]]) {
  const p = await open('iphone14', 390, 844, { ...newKid, dp_help_v1: JSON.stringify({ v: 1, g: 1, over: null, warm: 'w2', streak: 0, skills: {}, hist: [] }) });
  ok(await p.evaluate(() => S.c.id === 'w2'), `${name}: a detective half-way (warm: w2) starts with w2`);
  await p.click('[data-act="answer"]'); await p.click('[data-coach="ok"]'); await p.click('[data-act="toScene"]'); await wait(150);
  await p.click('[data-act="briefOk"]');
  await openAll(p); await p.click('[data-act="toSolve"]'); await wait(150);
  await p.click('[data-act="briefOk"]'); await wait(100);
  if (slip) {
    await pair(p, 's2', 'zala');   // the decoy against the culprit
    ok((await p.$eval('#hint', e => e.innerText)).includes('Kdo NI mogel biti?') && !(await p.$('.coach')), `${name}: in w2 the first wrong pair gives the hint at once, and the coin's line goes`);
    await p.click('[data-act="hintOk"]');
  }
  await pair(p, 's4', 'bine');
  ok(!(await p.$('.coach')), `${name}: after the first cross-off the coin's line is gone`);
  await pair(p, 's5', 'jure'); await p.click('[data-act="noteOk"]'); await pair(p, 's3', 'zala');
  await p.click('[data-act="excuseOk"]'); await p.click('[data-act="next"]'); await wait(300);
  ok((await p.help()).g === g && (await p.help()).warm === 'done', `${name}: help ${g}`);
  await p.close();
}

// ---- a detective from before the warm-up: no warm-up, level 1; the coin and a pause nudge in a real case
{
  const p = await open('iphone14', 390, 844, { ...newKid, dp_tutorial_done: 'true' });
  const hp = await p.help();
  ok(await p.st() === 'files' && hp.warm === 'legacy' && hp.g === 1, 'a detective who played before: straight to the adventures (legacy, help 1)');
  await p.click('[data-act="tutorial"]'); await wait(200);
  ok(await p.evaluate(() => S.c.id === 'w1' && S.warmReplay) && await p.$('[data-act="back"]'), '❓ plays w1 again, with a way back');
  await p.click('[data-act="back"]'); await wait(200);
  ok(await p.st() === 'files' && (await p.help()).warm === 'legacy' && !(await p.$('.coach')), 'back from the replay: the adventures, nothing changed');
  await p.evaluate(() => { HELP.idle[1][0][0] = 0.4; S.file = 'bip'; playCase(1); }); await wait(100);
  await p.click('[data-act="answer"]'); await p.click('[data-act="toScene"]'); await wait(100);
  await p.click('[data-act="briefOk"]');
  await openAll(p); await p.click('[data-act="torch"]'); await openAll(p);
  await p.click('[data-act="toSolve"]'); await wait(150); await p.click('[data-act="briefOk"]'); await wait(700);
  ok((await p.$eval('.pal-say', e => e.innerText).catch(() => '')).includes('Kdo ni bil? Prečrtaj ga.'), 'a real case: after a pause the companion says the goal');
  await p.screenshot({ path: 'shots/warm-nudge.png' });
  await p.click('.row[data-sid="s3"]'); await wait(100);
  ok(!(await p.$('.pal-say')) && await p.$('.row.selected[data-sid="s3"]'), 'the bubble blocks nothing: a tap selects the sentence and takes it away');
  await wait(700);
  ok(!(await p.$('.pal-say')), 'the goal comes once per screen');
  await p.click('.pal'); await wait(100); await p.click('[data-act="hintOk"]'); await p.click('.pal'); await wait(100); await p.click('[data-act="hintOk"]'); await p.click('.pal'); await wait(150);
  ok((await p.$eval('#hint', e => e.innerText)).includes('To ni ') && await p.evaluate(() => S.run.assisted && S.run.wrong === 0 && S.run.coin === 3), 'three taps on the coin, no wrong pair: hint, lit sentence, the answer');
  ok(await p.fits() && await p.evaluate(() => { const m = document.querySelector('.footer'); return m.getBoundingClientRect().bottom <= innerHeight; }), 'the footer with the coin fits the screen');
  ok(!p.errors.length, `no page errors ${p.errors.join('|')}`);
  await p.close();
}

// ---- »Nov otrok« (adult) also clears the help state, so the next child gets the warm-up
{
  const a = await b.newPage(); a.on('dialog', d => d.accept());
  await a.goto('http://localhost:8765/solo/');
  await a.evaluate((k) => { localStorage.clear(); localStorage.setItem('dp_profile_v1', JSON.stringify(k)); localStorage.setItem('dp_help_v1', JSON.stringify({ v: 1, g: 3, warm: 'done' })); }, kid);
  await a.reload(); await wait(400);
  await a.click('[data-act="resetBoard"]'); await wait(100);
  ok(await a.evaluate(() => localStorage.getItem('dp_help_v1') === 'null'), 'adult »Nov otrok« clears the help state');
}
await b.close();
