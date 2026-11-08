// 🧭 Napačna sled? on fixture cases: one clue (auto-selected), wrong → ladder, the flip and the stamp,
// »Vem« only when done, NAPAČNA SLED in solve + »Ta sled vodi drugam«; two clues with a true one (»Ta sled drži«);
// a witness in ask (👁️, not in solve); points without the step → »Preveč lahko?«; the debrief column.
import './brief-auto.mjs';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 120) => new Promise(r => setTimeout(r, ms));
const FIX = () => {
  FILES.push({ id: 'ht', icon: '🦕', title: 'Test sled', cast: ['tim', 'ela', 'robi', 'kiki'], paper: 'TEST' });
  const base = { file: 'ht', type: 'elim', level: 'A', sticker: '🦴', client: 'vesna', call: ['Pomoč!'], question: 'Kdo je bil?', h1: 'Kdo NI mogel biti?',
    reveal: ['Bil je Tim.'], caught: 'Tima', excuse: 'Ups!', letter: ['Hvala!'] };
  CASES.push({ ...base, id: 'h1', no: 1, steps: ['call', 'scene', 'herring', 'solve'], suspects: ['tim', 'ela', 'robi'], culprit: 'tim',
    herring: { clues: ['s2'], points: { s2: 'ela' }, explains: { s2: [['s5']] }, h1: 'Zakaj je bila Ela tam?' },
    sentences: [
      ['s1', 'Na tleh so drobtine.', 'neutral', { obj: '🍞', label: 'tla' }],
      ['s2', 'Pod mizo leži Elina rokavica.', 'distractor', { obj: '🧤', label: 'miza' }],
      ['s3', 'Robi je bil ves večer v delavnici.', 'clear', { obj: '🔧', label: 'delavnica', clears: 'robi' }],
      ['s4', 'Ela je ves večer gledala zvezde.', 'clear', { obj: '🔭', label: 'teleskop', clears: 'ela' }],
      ['s5', 'Rokavico je Ela izgubila že zjutraj.', 'neutral', { obj: '📓', label: 'dnevnik' }],
      ['s6', 'Tim ima drobtine na majici.', 'evidence', { obj: '👕', label: 'majica' }],
    ] });
  CASES.push({ ...base, id: 'h2', no: 2, steps: ['call', 'ask', 'herring', 'solve'], suspects: ['tim', 'ela', 'robi'], culprit: 'tim', witnesses: ['maja'],
    herring: { clues: ['s1', 's6'], points: { s1: 'robi', s6: 'tim' }, explains: { s1: [['s2']] } },
    sentences: [
      ['s1', '»Robijev vijak leži pri vratih.«', 'distractor', { who: 'ela', ask: 'Kaj si videla?' }],
      ['s2', '»Vijak je Robiju padel že včeraj.«', 'neutral', { who: 'maja', ask: 'Čigav je vijak?' }],
      ['s3', '»Ves večer sem bila z Majo.«', 'neutral', { who: 'ela', ask: 'Kje si bila?' }],
      ['s4', '»Ela je bila ves večer z mano.«', 'clear', { who: 'maja', ask: 'Kje je bila Ela?', clears: 'ela' }],
      ['s5', '»Robi je ves večer pomival posodo.«', 'clear', { who: 'tim', ask: 'Kje je bil Robi?' , clears: 'robi' }],
      ['s6', '»V Timovi torbi je ključ.«', 'evidence', { who: 'robi', ask: 'Kaj je v torbi?' }],
    ] });
  CASES.push({ ...base, id: 'h3', no: 3, steps: ['call', 'scene', 'solve'], suspects: ['tim', 'ela', 'robi'], culprit: 'tim',
    sentences: [
      ['s1', 'Senco je naredila velika svetilka.', 'neutral', { obj: '🔦', label: 'stena' }],
      ['s2', 'Največjo svetilko ima Robi.', 'distractor', { obj: '🤖', label: 'polnilec', points: 'robi' }],
      ['s3', 'Ob osmih je Robi pomival posodo.', 'clear', { obj: '🧽', label: 'korito', clears: 'robi' }],
      ['s4', 'Ob osmih je Ela spala.', 'clear', { obj: '🛏️', label: 'postelja', clears: 'ela' }],
      ['s5', 'Za zaveso leži Timov rep.', 'evidence', { obj: '🎭', label: 'zavesa' }],
    ] });
  for (const c of CASES.filter(x => x.file === 'ht')) {
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
    await p.screenshot({ path: `shots/her-${name}-${s}.png` });
  };

  // ---- h1: one clue
  await p.evaluate(() => { S.file = 'ht'; playCase(1); });
  await click('[data-act="answer"]'); await click('[data-act="toScene"]');
  for (const s of ['s1', 's2', 's3', 's4', 's5', 's6']) { await p.click(`.obj[data-sid="${s}"]`); await wait(40); }
  ok((await p.$eval('[data-act="toSolve"]', e => e.innerText)).includes('Napačna sled?'), `${name} h1: the button says »Napačna sled? 🤔«`);
  await click('[data-act="toSolve"]');
  ok(await st() === 'herring' && (await p.$$('.hclue')).length === 1 && !(await p.$('.herringstep .row[data-sid="s2"]')), `${name} h1: one clue card, not among the rows`);
  ok(await p.$('.hclue .harrow') && await p.$eval('.hclue .hface', e => e.innerText.includes('👩🏿‍🚀') || e.innerHTML.length > 0), `${name} h1: the clue has an arrow and a face`);
  ok(await p.$eval('[data-act="toScene"]', e => e.disabled), `${name} h1: »Vem« waits`);
  await fits('h1-start');
  await click('.herringstep .row[data-sid="s1"]');
  ok(await R('hwrong') === 1 && (await p.$eval('#note', e => e.innerText)).includes('ne pove, zakaj'), `${name} h1: a wrong sentence (clue auto-picked) → »Ta stavek ne pove, zakaj.«`);
  await p.evaluate(() => { S.run.note = null; render(); });
  await click('.herringstep .row[data-sid="s3"]');
  ok(await p.$('#hint') && (await p.$eval('#hint', e => e.innerText)).includes('Zakaj je bila Ela tam'), `${name} h1: the 2nd wrong try → the case's h1`);
  await hintOk();
  await click('.herringstep .row[data-sid="s5"]');
  ok((await R('hdone')).includes('s2') && await p.$('.hclue.flipped .hstamp') && (await p.$eval('.hstamp', e => e.innerText)) === 'NAPAČNA SLED!', `${name} h1: the right sentence flips the card, NAPAČNA SLED! lands`);
  ok(await p.$('.harrow.bent') && (await p.$eval('.hclue', e => e.innerText)).includes('izgubila že zjutraj'), `${name} h1: the arrow bends away, the back shows the explanation`);
  ok((await p.$eval('#note', e => e.className)).includes('good') && (await p.$eval('#note', e => e.innerText)).includes('preverjene'), `${name} h1: a green card says all clues are checked`);
  await wait(700); await fits('h1-done');
  await p.evaluate(() => { S.run.note = null; render(); });
  ok(!(await p.$eval('[data-act="toScene"]', e => e.disabled)), `${name} h1: »Vem, kdo je bil!« is on`);
  await click('[data-act="toScene"]');
  ok(await st() === 'solve' && (await p.$eval('.solve .row[data-sid="s2"]', e => e.innerText)).includes('NAPAČNA SLED'), `${name} h1: in solve the clue carries »NAPAČNA SLED«`);
  await click('.solve .row[data-sid="s2"]'); await click('.suspect[data-id="ela"]');
  ok((await p.$eval('#hint', e => e.innerText)).includes('vodi drugam'), `${name} h1: the clue against Ela → »Ta sled vodi drugam«`);
  await hintOk();
  for (const [s, id] of [['s3', 'robi'], ['s4', 'ela'], ['s6', 'tim']]) { await click(`.solve .row[data-sid="${s}"]`); await click(`.suspect[data-id="${id}"]`); }
  ok(await st() === 'reveal', `${name} h1: alibis and the proof solve it`);

  // ---- h2: two clues, one true; a witness in ask
  await p.evaluate(() => { S.file = 'ht'; playCase(2); });
  await click('[data-act="answer"]'); await click('[data-act="toScene"]');
  ok(await st() === 'ask' && await p.$('.suspect.witness[data-id="maja"] .eye') && (await p.$$('.ask .suspect')).length === 4, `${name} h2: ask shows 3 suspects + the witness 👁️`);
  await fits('h2-ask');
  for (const [who, sids] of [['ela', ['s1', 's3']], ['maja', ['s2', 's4']], ['tim', ['s5']], ['robi', ['s6']]]) {
    await click(`[data-act="askWho"][data-id="${who}"]`);
    for (const s of sids) { await click(`[data-act="askQ"][data-sid="${s}"]`); await wait(1300); }
  }
  await click('[data-act="toSolve"]');
  ok(await st() === 'herring' && (await p.$$('.hclue')).length === 2, `${name} h2: two clue cards`);
  await click('.herringstep .row[data-sid="s2"]');
  ok((await p.$eval('#note', e => e.innerText)).includes('Najprej tapni sled') && await R('hwrong') === 0, `${name} h2: a sentence before a clue → »Najprej tapni sled«, not counted`);
  await p.evaluate(() => { S.run.note = null; render(); });
  await click('.hclue[data-sid="s6"]'); await click('.herringstep .row[data-sid="s2"]');
  ok((await p.$eval('#note', e => e.innerText)).includes('Ta sled drži') && await R('hwrong') === 0, `${name} h2: the true clue → »Ta sled drži. Poišči drugo.«, not counted`);
  await p.evaluate(() => { S.run.note = null; render(); });
  await click('.hclue[data-sid="s1"]'); await click('.herringstep .row[data-sid="s2"]');
  ok((await R('hdone')).join() === 's1' && !(await p.$eval('[data-act="toScene"]', e => e.disabled)), `${name} h2: the misleading clue explained → done (the true one stays)`);
  await wait(700); await fits('h2-done');
  await p.evaluate(() => { S.run.note = null; render(); });
  await click('[data-act="toScene"]');
  ok(!(await p.$('.solve .suspect[data-id="maja"]')), `${name} h2: the witness is not in solve`);
  for (const [s, id] of [['s4', 'ela'], ['s5', 'robi'], ['s6', 'tim']]) { await click(`.solve .row[data-sid="${s}"]`); await click(`.suspect[data-id="${id}"]`); }
  ok(await st() === 'reveal', `${name} h2: solved`);

  // ---- h3: no step; the obvious one blamed in solve
  await p.evaluate(() => { S.file = 'ht'; playCase(3); });
  await click('[data-act="answer"]'); await click('[data-act="toScene"]');
  for (const s of ['s1', 's2', 's3', 's4', 's5']) { await p.click(`.obj[data-sid="${s}"]`); await wait(40); }
  await click('[data-act="toSolve"]');
  await click('.solve .row[data-sid="s2"]'); await click('.suspect[data-id="robi"]');
  ok((await p.$eval('#hint', e => e.innerText)).includes('Preveč lahko'), `${name} h3: the pointing sentence against Robi → »Preveč lahko? Poglej še enkrat!«`);
  await hintOk();
  const deb = await p.evaluate(() => { const s = analyzeSession(store.read('dp_log_v1', []).filter(e => e.case)); return s; }).catch(() => null);
  const ev = await p.evaluate(() => JSON.parse(localStorage.getItem('dp_log_v1') || '[]').filter(e => e.type.startsWith('herring') || e.obvious).map(e => e.type + (e.kind ? ':' + e.kind : '') + (e.obvious ? ':obvious' : '')));
  ok(ev.includes('herring_done') && ev.includes('herring_try:true') && ev.includes('herring_try:noClue') && ev.filter(x => x.endsWith(':obvious')).length === 2, `${name}: logged ${ev.join(' ')}`);
  ok(!errors.length, `${name}: no page errors ${errors}`);
  await p.close();
}
await b.close();
