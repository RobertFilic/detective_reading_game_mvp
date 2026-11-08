// ⏰ Kdaj? on fixture cases: wrong band → ladder (note, h1, time words, pulse), the yellow card, »Vem« only when
// done, 🟨 in solve + »Napačen čas!« (not counted); when: on a sentence without the step; the 🖍️ pencil
// (blank page, rub sweep, white-on-grey row); the 🏆 cup with the child's name last; the debrief column.
import './brief-auto.mjs';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 120) => new Promise(r => setTimeout(r, ms));
const FIX = () => {
  FILES.push({ id: 'wt', icon: '⚽', title: 'Test čas', cast: ['tim', 'ela', 'robi'], paper: 'TEST',
    cup: { q: 'Bo že, bo! Poglej pokal!', cloth: 'Pokal je pod prtom.', btn: 'Odkrij pokal! 🏆', names: ['DINOZAVRI', 'KOZICE'] } });
  const base = { file: 'wt', type: 'elim', level: 'A', sticker: '⚽', client: 'vesna', call: ['Pomoč!'], question: 'Kdo je ob osmih vzel žogo?', h1: 'Kdo NI mogel biti?',
    reveal: ['Bil je Tim.'], caught: 'Tima', excuse: 'Ups!', letter: ['Hvala!'] };
  CASES.push({ ...base, id: 'w1', no: 1, steps: ['call', 'scene', 'when', 'solve'], suspects: ['tim', 'ela', 'robi'], culprit: 'tim',
    when: { deed: 'ob osmih: žoga izgine', cards: { s2: 'before', s3: 'during', s5: 'after' }, h1: 'Kdaj je bila Ela pri žogi?' },
    sentences: [
      ['s1', 'Ob osmih je žoga izginila.', 'neutral', { obj: '⚽', label: 'igrišče' }],
      ['s2', 'Ob sedmih je Ela nosila žogo.', 'distractor', { obj: '📓', label: 'zvezek', rub: true }],
      ['s3', 'Ob osmih je Robi pomival posodo.', 'clear', { obj: '🧽', label: 'korito', clears: 'robi' }],
      ['s4', 'Ob osmih je Ela spala.', 'clear', { obj: '🛏️', label: 'postelja', clears: 'ela' }],
      ['s5', 'Ob devetih je Robi iskal žogo.', 'neutral', { obj: '🔍', label: 'vrata' }],
      ['s6', 'Tim ima blato na čevljih.', 'evidence', { obj: '👟', label: 'čevlji' }],
    ] });
  CASES.push({ ...base, id: 'w2', no: 2, steps: ['call', 'scene', 'solve'], suspects: ['tim', 'ela', 'robi'], culprit: 'tim',
    sentences: [
      ['s1', 'Po tekmi je Robi pobral žogo.', 'neutral', { obj: '⚽', label: 'gol', when: 'after' }],
      ['s2', 'Ob osmih je Robi pomival posodo.', 'clear', { obj: '🧽', label: 'korito', clears: 'robi' }],
      ['s3', 'Ob osmih je Ela spala.', 'clear', { obj: '🛏️', label: 'postelja', clears: 'ela' }],
      ['s4', 'Tim ima blato na čevljih.', 'evidence', { obj: '👟', label: 'čevlji' }],
    ] });
  for (const c of CASES.filter(x => x.file === 'wt')) {
    c.rung = 2;
    c.sentences = c.sentences.map(([id, text, role = 'neutral', more = {}]) => ({ id, text, role, ...more }));
  }
};
for (const [name, w, h] of [['iphone14', 390, 844], ['ipad', 820, 1180], ['land', 852, 393]]) {
  const p = await b.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.evaluateOnNewDocument(() => { if (window.speechSynthesis) speechSynthesis.getVoices = () => []; });
  await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8765/solo/?play');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('dp_save_version', '4'); localStorage.setItem('dp_tutorial_done', 'true');
    localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏽‍♀️', g: 'f', sk: '🐶', name: 'Ana', id: '1234' })); });
  await p.reload(); await wait(400);
  await p.evaluate(FIX);
  const st = () => p.evaluate(() => S.screen);
  const R = (k) => p.evaluate((k) => S.run[k], k);
  const click = async (sel) => { await p.click(sel); await wait(); };
  const hintOk = async () => { if (await p.$('#hint')) await click('[data-act="hintOk"]'); };
  const fits = async (s) => {
    const bad = await p.evaluate(() => { const W = document.documentElement.clientWidth, out = [];
      document.querySelectorAll('#app *').forEach(el => { const r = el.getBoundingClientRect(); if (r.width && (r.right > W + 1 || r.left < -1)) out.push(el.className || el.tagName); });
      const btn = [...document.querySelectorAll('.footer .btn.big')].pop();
      if (btn) { const r = btn.getBoundingClientRect(); if (r.bottom > innerHeight + 1) out.push('main button below the screen'); }
      return [...new Set(out)].slice(0, 5); });
    ok(!bad.length, `${name} ${s}: fits ${bad.length ? JSON.stringify(bad) : ''}`);
    await p.screenshot({ path: `shots/when-${name}-${s}.png` });
  };

  // ---- w1: the pencil
  await p.evaluate(() => { S.file = 'wt'; playCase(1); });
  await click('[data-act="answer"]'); await click('[data-act="toScene"]');
  ok(!!(await p.$('[data-act="pencil"]')), `${name} w1: the scene has a 🖍️ pencil`);
  ok(!!(await p.$('.obj.rub[data-sid="s2"]')), `${name} w1: the page starts blank (rub)`);
  await fits('scene');
  await click('.obj[data-sid="s2"]');
  ok((await R('note')) === 'Na listu ni nič. Vzemi svinčnik!' && !(await R('found')).includes('s2'), `${name} w1: without the pencil »Vzemi svinčnik!«`);
  await click('[data-act="pencil"]');
  ok(await R('pencil') && !(await R('torch')), `${name} w1: pencil on, torch off`);
  await click('.obj[data-sid="s2"]');
  ok(!!(await p.$('.obj.rubbing[data-sid="s2"]')) && !(await R('found')).includes('s2'), `${name} w1: the rub sweep first`);
  await wait(1100);
  ok((await R('found')).includes('s2') && !!(await p.$('.pocket .row.rubbed[data-sid="s2"]')), `${name} w1: then the sentence, white on grey`);
  await click('[data-act="torch"]');
  ok(await R('torch') && !(await R('pencil')), `${name} w1: torch on, pencil off`);
  for (const s of ['s1', 's3', 's4', 's5', 's6']) { await p.click(`.obj[data-sid="${s}"]`); await wait(40); }
  ok((await p.$eval('[data-act="toSolve"]', e => e.innerText)).includes('Naprej'), `${name} w1: the button says »Naprej 👉«`);
  await click('[data-act="toSolve"]');

  // ---- w1: the ⏰ step
  ok(await st() === 'when' && (await p.$$('.wdeck .wcard')).length === 3 && (await p.$$('.wband')).length === 3, `${name} w1: 3 bands, 3 cards`);
  ok((await p.$eval('.wband.during', e => e.innerText)).includes('ob osmih: žoga izgine'), `${name} w1: the deed sits in TAKRAT`);
  ok(await p.$eval('[data-act="toScene"]', e => e.disabled), `${name} w1: »Vem« waits`);
  await fits('when-start');
  await click('.wband.before');
  ok((await R('note')) === 'Najprej tapni stavek. 👇', `${name} w1: band first → »Najprej tapni stavek«`);
  await click('.wdeck .wcard[data-sid="s2"]');
  ok(!!(await p.$('.wcard.selected[data-sid="s2"]')) && !!(await p.$('.wband.armed')), `${name} w1: a card selected, the bands wait`);
  await click('.wband.during');
  ok((await R('note')) === 'Poglej, kdaj je to bilo.' && (await R('wmiss')) === 1, `${name} w1: wrong 1 → note`);
  await click('.wband.after');
  ok((await R('hint') || {}).text === 'Kdaj je bila Ela pri žogi?', `${name} w1: wrong 2 → the case's h1`);
  await hintOk();
  await click('.wband.during');
  ok((await R('hint') || {}).key === 'whenLook' && !!(await p.$('.wdeck mark.tw')), `${name} w1: wrong 3 → time words marked`);
  ok((await p.$eval('.wdeck .wcard[data-sid="s2"] mark.tw', e => e.innerText)) === 'Ob sedmih', `${name} w1: »Ob sedmih« is marked`);
  await hintOk();
  await click('.wband.after');
  ok((await R('hint') || {}).key === 'whenAssist' && await R('wassisted'), `${name} w1: wrong 4 → assisted`);
  await hintOk();
  ok(!!(await p.$('.wband.before.pulse')), `${name} w1: the right band pulses`);
  await fits('when-assist');
  await click('.wband.before');
  ok((await R('wplaced')).s2 === 'before' && !!(await p.$('.wband.before .wcard[data-sid="s2"] .ycard')) && !!(await p.$('.wstamp')), `${name} w1: in PREJ with the yellow card and »NAPAČEN ČAS!«`);
  await fits('when-yellow');
  await click('.wdeck .wcard[data-sid="s3"]'); await click('.wband.during');
  ok((await p.$eval('.wband.during .wcard[data-sid="s3"] .wok', e => e.textContent)) === 'To šteje!', `${name} w1: TAKRAT → »To šteje!« (one line in landscape)`);
  ok(await p.$eval('[data-act="toScene"]', e => e.disabled), `${name} w1: »Vem« still waits`);
  await click('.wdeck .wcard[data-sid="s5"]');
  await click('.wband.during .wcard[data-sid="s3"]');   // a tap on a placed card counts as its band
  ok((await R('wmiss')) === 5 && !(await R('wplaced')).s5, `${name} w1: a placed card counts as its band (wrong here)`);
  await hintOk();
  await p.evaluate(() => { S.run.note = null; S.run.wcard = null; render(); });
  await click('.wband.after');   // one card left: auto-selected
  ok((await R('wplaced')).s5 === 'after' && (await R('note')) === 'Zdaj veš, kaj šteje. Kdo je bil?', `${name} w1: the last card goes by itself; done note`);
  ok(!(await p.$eval('[data-act="toScene"]', e => e.disabled)), `${name} w1: »Vem« opens`);
  await fits('when-done');
  await click('.wcard[data-sid="s2"]');
  ok(!(await p.$('.wcard.selected')), `${name} w1: a placed card is only read out`);
  await click('[data-act="toScene"]');
  ok(await st() === 'solve' && !!(await p.$('.solve .row[data-sid="s2"] .ytag')) && !(await p.$('.solve .row[data-sid="s3"] .ytag')), `${name} w1: 🟨 on the wrong-time rows in solve`);
  await click('.solve .row[data-sid="s2"]'); await click('.suspect[data-id="ela"]');
  ok((await R('hint') || {}).key === 'wrongTime' && (await R('wrong')) === 0 && !(await R('crossed')).includes('ela'), `${name} w1: wrong-time sentence → »Napačen čas!«, not counted`);
  await hintOk();
  await fits('solve-wrongtime');
  await click('.solve .row[data-sid="s4"]'); await click('.suspect[data-id="ela"]');
  await click('.solve .row[data-sid="s3"]'); await click('.suspect[data-id="robi"]');
  await click('.solve .row[data-sid="s6"]'); await click('.suspect[data-id="tim"]');
  ok(await st() === 'reveal', `${name} w1: solved`);

  // ---- w2: when: on a sentence, no step
  await p.evaluate(() => { S.file = 'wt'; playCase(2); });
  await click('[data-act="answer"]'); await click('[data-act="toScene"]');
  ok(!(await p.$('[data-act="pencil"]')), `${name} w2: no pencil without a page to rub`);
  for (const s of ['s1', 's2', 's3', 's4']) { await p.click(`.obj[data-sid="${s}"]`); await wait(40); }
  await click('[data-act="toSolve"]');
  ok(!(await p.$('.solve .ytag')), `${name} w2: no 🟨 tag without the step (the scaffold is off)`);
  await click('.solve .row[data-sid="s1"]'); await click('.suspect[data-id="robi"]');
  ok((await R('hint') || {}).key === 'wrongTime' && (await R('wrong')) === 0, `${name} w2: when: 'after' → »Napačen čas!«`);
  await hintOk();

  // ---- the cup
  await p.evaluate(() => { S.c = CASES.find(c => c.id === 'w1'); S.run = newRun(); go('book'); });
  await wait(200);
  ok((await p.$eval('.bookstep', e => e.innerText)).includes('Pokal je pod prtom.'), `${name} cup: under the cloth first`);
  await click('[data-act="bookYes"]'); await wait(2400);
  const names = await p.$$eval('.cup .cname', els => els.map(e => e.innerText));
  ok(names.length === 3 && names[2].includes('ANA') && names[0] === 'DINOZAVRI', `${name} cup: team names, the child's last: ${names.join(' | ')}`);
  await fits('cup');

  // ---- debrief
  const cell = await p.evaluate(() => { const s = analyzeSession ? null : null; return document.title; });
  const deb = await p.evaluate(() => { try { const ss = analyzeSessions ? 1 : 0; } catch (e) {} return S.log ? S.log.filter(e => /^when_/.test(e.type) || e.hint === 'wrongTime').length : -1; });
  ok(deb !== 0, `${name} log: when events logged (${deb})`);
  ok(!errors.length, `${name}: no page errors ${errors.join(' | ')}`);
  await p.close();
}
await b.close();
