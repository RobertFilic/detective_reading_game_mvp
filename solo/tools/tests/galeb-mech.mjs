// The Galeb mechanics on fixture cases (injected, not the real season):
// ❗ UGOVOR (owl + shout the first time, wrong → ladder, hmm, half of a pair, the truth into the pocket),
// ✉️ cipher (missing pair), 📜 torn note, 🔤 geslo, the proof pair in solve, the innocent liar,
// the second guess on the corkboard (also on a landscape phone) and the book cover.
import './brief-auto.mjs';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 120) => new Promise(r => setTimeout(r, ms));

const FIX = () => {
  Object.assign(CHARACTERS, {
    luka: { name: 'Luka', animal: '👦🏼', color: '#dff0ff', re: 'Luk(a|e|i|o|ov\\p{L}*)' },
    hana: { name: 'Hana', animal: '👧🏽', color: '#ffe3ea', re: 'Han(a|e|i|o|in\\p{L}*)' },
    bepi: { name: 'Bepi', animal: '⚓', color: '#e2ecf6', re: 'Bepi(ja|ju|jem|jev\\p{L}*)?' },
    rozi: { name: 'Gospa Rozi', animal: '💁‍♀️', color: '#fde8c8', re: 'Roz(i|ij\\p{L}*)' },
  });
  FILES.push({ id: 'gt', icon: '🦔', title: 'Test Galeb', cast: ['luka', 'hana', 'bepi'], paper: 'GALEB', season: true, mystery: 'Kdo piše?', pages: true,
    guess: { after: 1, again: 2, q: 'Kdo piše?', q2: 'Ali še vedno tako misliš?', options: [['hana', '👧🏽', 'Hana'], ['bepi', '⚓', 'Bepi'], ['luka', '👦🏼', 'Luka']] },
    answer: { id: 'luka', icon: '🦔', text: 'Piše Luka!' }, book: { q: 'Ali smem napisati knjigo o tebi?', title: 'in skrivnost hotela Galeb', by: '🦔 Ježek' } });
  const base = { file: 'gt', type: 'elim', level: 'A', sticker: '🏖️', client: 'rozi', call: ['Pomoč!'], question: 'Kdo je bil?', h1: 'Kdo NI mogel biti?',
    reveal: ['Bil je Luka.'], caught: 'Luko', excuse: 'Ups!', letter: ['Hvala!'] };
  const tx = { ...base, id: 'tx', no: 1, steps: ['call', 'scene', 'ask', 'cipher', 'torn', 'words', 'lie', 'solve'],
    suspects: ['luka', 'hana', 'bepi'], culprit: 'luka',
    cipher: { note: 'Listek v Ježkovi pisavi.', key: { '🐚': 'B', '🌊': 'E', '⚓': 'P', '⭐': 'I', '🦀': 'J', '🐟': 'L', '🌙': 'O', '⛵': 'V', '🐙': 'R' }, missing: '🐙', extra: ['Č'], gives: 's6',
      h1: 'Preberi zadnjo besedo.', h2: 'Manjka R. Beseda je RIBE.' },
    torn: { note: 'Veter je raztrgal listek.', parts: ['Zjutraj je', 'Gusti kričala', 'na strehi.'], gives: 's7', h1: 'Velika črka je na začetku.', h2: 'Kdo je kričal?' },
    words: { note: 'Iskanka!', grid: ['GUSTIP', 'ONOČIG', 'GALGER', 'PEROVA', 'REJEAD', 'JAJCLA'], find: [['🏰', 'GRAD'], ['🌊', 'VAL'], ['🌿', 'ALGE'], ['🪶', 'PERO']], geslo: 's8', h1: 'Samo → in ↓.' },
    lie: { claims: ['s1', 's3'], claim: 's1', breaks: [['s2', 's9']], truth: 's10', hmm: [['s3', 's5', 'Hmm … Bomo videli!']], h1: 'Kaj je mokro?' },
    sentences: [
      ['s1', '»Ves dan sem plaval v morju.«', 'distractor', { obj: '🏖️', label: 'ležalnik', who: 'luka' }],
      ['s2', 'Lukove kopalke so čisto suhe.', 'neutral', { obj: '🩱', label: 'kopalke' }],
      ['s3', '»Ob devetih že spim.«', 'neutral', { who: 'hana', ask: 'Kdaj greš spat?' }],
      ['s4', '»Pesek sem nosil v vedru.«', 'neutral', { who: 'luka', ask: 'Kaj si nosil?' }],
      ['s5', '»Ob desetih je bila Hana na plaži.«', 'neutral', { who: 'bepi', ask: 'Kje je bila Hana?' }],
      ['s6', 'Bepi je lovil ribe.', 'clear', { from: 'cipher', clears: 'bepi' }],
      ['s7', 'Zjutraj je Gusti kričala na strehi.', 'neutral', { from: 'torn' }],
      ['s8', 'Gusti ponoči greje jajca.', 'neutral', { from: 'words' }],
      ['s9', 'Luka je ves dan gradil grad.', 'neutral', { obj: '🏰', label: 'grad' }],
      ['s10', '»No ja … Bil sem na plaži.«', 'neutral', { from: 'lie', who: 'luka' }],
      ['s11', 'Hana je bila z mamo v kinu.', 'clear', { obj: '🎬', label: 'kino', clears: 'hana' }],
      ['s12', 'Na brisačah je moker pesek.', 'evidence', { obj: '🧺', label: 'brisače' }],
      ['s13', 'Luka ima vedro mokrega peska.', 'evidence', { obj: '🪣', label: 'vedro' }],
    ],
    card: { icon: '📄', sid: 's7' } };
  const ty = { ...base, id: 'ty', no: 2, steps: ['call', 'scene', 'lie', 'solve'], suspects: ['luka', 'hana', 'bepi'], culprit: 'luka',
    lie: { claims: ['s1'], claim: 's1', breaks: [['s2']], truth: 's3' },
    sentences: [
      ['s1', '»Ob zori sem še spal.«', 'distractor', { obj: '⚓', label: 'barka', who: 'bepi' }],
      ['s2', 'Bepijevi rokavčki so še mokri.', 'neutral', { obj: '🦺', label: 'rokavčki' }],
      ['s3', '»Ja … Učil sem se plavati.«', 'clear', { from: 'lie', who: 'bepi', clears: 'bepi' }],
      ['s4', 'Lukovo vedro je pod zvonom.', 'evidence', { obj: '🔔', label: 'zvon' }],
      ['s5', 'Hana je bila z mamo v kinu.', 'clear', { obj: '🎬', label: 'kino', clears: 'hana' }],
      ['s6', 'Ob zori so v zalivu delfini.', 'neutral', { obj: '🐬', label: 'zaliv' }],
    ],
    card: { icon: '📄', sid: 's6' } };
  const tz = { ...ty, id: 'tz', no: 3, final: true, card: { icon: '📄', sid: 's6' } };
  for (const c of [tx, ty, tz]) {
    c.rung = 2;
    c.sentences = c.sentences.map(([id, text, role = 'neutral', more = {}]) => ({ id, text, role, ...more }));
    CASES.push(c);
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
  const text = () => p.evaluate(() => document.body.innerText);
  const st = () => p.evaluate(() => S.screen);
  const R = (k) => p.evaluate((k) => S.run[k], k);
  const click = async (sel) => { await p.click(sel); await wait(); };
  const inView = (sel) => p.$eval(sel, el => { const r = el.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight + 1; });
  const check = async (s) => {
    const bad = await p.evaluate(() => { const W = document.documentElement.clientWidth, out = [];
      document.querySelectorAll('#app *').forEach(el => { if (el.closest('.pins')) return; const r = el.getBoundingClientRect(); if (r.width && (r.right > W + 1 || r.left < -1)) out.push(el.className || el.tagName); });
      const btn = [...document.querySelectorAll('.footer .btn.big, .screen > .btn.big')].pop();
      if (btn) { const r = btn.getBoundingClientRect(); if (r.bottom > innerHeight + 1) out.push('main button below the screen'); }
      return [...new Set(out)].slice(0, 5); });
    ok(!bad.length, `${name} ${s}: fits ${bad.length ? JSON.stringify(bad) : ''}`);
    await p.screenshot({ path: `shots/gm-${name}-${s}.png` });
  };
  const hintOk = async () => { if (await p.$('#hint')) await click('[data-act="hintOk"]'); };

  // ---- ty: the first UGOVOR ever, an innocent liar whose truth clears him
  await p.evaluate(() => { S.file = 'gt'; playCase(2); });
  await click('[data-act="answer"]');
  await click('[data-act="toScene"]');
  ok(await st() === 'scene' && (await p.$$('.obj')).length === 5, `${name} ty: the scene shows 5 objects (not the truth)`);
  for (const s of ['s1', 's2', 's4', 's5', 's6']) { await p.click(`.obj[data-sid="${s}"]`); await wait(50); }
  ok((await text()).includes('✓ Vse najdeno') && (await p.$eval('[data-act="toSolve"]', e => e.innerText)).includes('Naprej'), `${name} ty: 5 / 5, the button says »Naprej 👉«`);
  await click('[data-act="toSolve"]');
  ok(await st() === 'lie' && (await p.$$('.claim')).length === 1 && !(await p.$('.liestep .row[data-sid="s1"]')) && !(await p.$('.liestep .row[data-sid="s3"]')), `${name} ty: lie step, 1 claim, the claim and the truth are not rows`);
  ok((await p.$eval('.coach', e => e.innerText)).includes('Nekdo nekaj trdi') && await p.$('.coach-hand'), `${name} ty: the owl coaches the claim, with a finger`);
  await check('lie');
  await click('.claim');
  ok((await p.$eval('.coach', e => e.innerText)).includes('Kateri stavek') && !(await p.$('.coach-hand')), `${name} ty: then the rows, no finger`);
  await click('.liestep .row[data-sid="s4"]');
  ok(await R('lwrong') === 1 && (await text()).includes('Oba sta lahko res') && !(await p.$('#hint')), `${name} ty: a wrong sentence → gentle note`);
  await click('.liestep .row[data-sid="s6"]');
  ok((await p.$eval('#hint', e => e.innerText)).includes('To trdi. Ali je res?'), `${name} ty: 2nd wrong → the general h1`);
  await hintOk();
  await click('.liestep .row[data-sid="s2"]');
  ok(await R('lphase') === 'shout' && await p.$('.btn.ugovor') && (await text()).includes('Zakliči na glas'), `${name} ty: caught → the shout, first time`);
  await wait(800); await check('lie-shout');
  await click('.btn.ugovor');
  ok(await p.$('.lstamp.slam') && await p.$('.blush') && (await text()).includes('Zdaj pove resnico'), `${name} ty: the stamp slams, the liar blushes, "Zdaj pove resnico"`);
  ok(await p.$('[data-act="toScene"][disabled]'), `${name} ty: the button waits for the truth`);
  await wait(1900);
  ok(await R('lphase') === 'done' && (await R('found')).includes('s3') && await p.$('.ltruth') && await p.$('[data-act="toScene"]:not([disabled])'), `${name} ty: the truth arrives, into the pocket, button on`);
  ok(await p.evaluate(() => localStorage.getItem('dp_ugovor_v1')) === 'true', `${name} ty: shout remembered for this detective`);
  ok(await inView('[data-act="toScene"]'), `${name} ty: "Vem, kdo je bil!" on screen after the catch`);
  await check('lie-done');
  await click('[data-act="toScene"]');
  ok(await st() === 'solve' && await p.$('.row[data-sid="s1"] .ltag'), `${name} ty: solve, the broken claim is tagged UGOVOR!`);
  await click('[data-act="pickClue"][data-sid="s2"]'); await click('.suspect[data-id="bepi"]');
  ok((await p.$eval('#hint', e => e.innerText)).includes('ni nujno kriv'), `${name} ty: breaker + the innocent liar → "Kdor ne pove resnice, še ni kriv."`);
  await hintOk();
  await click('[data-act="pickClue"][data-sid="s1"]'); await click('.suspect[data-id="luka"]');
  await hintOk();
  await click('[data-act="pickClue"][data-sid="s3"]'); await click('.suspect[data-id="bepi"]');
  ok((await R('crossed')).includes('bepi'), `${name} ty: Bepi's truth crosses Bepi off`);
  await click('[data-act="pickClue"][data-sid="s5"]'); await click('.suspect[data-id="hana"]');
  await click('[data-act="pickClue"][data-sid="s4"]'); await click('.suspect[data-id="luka"]'); await wait(300);
  ok(await st() === 'reveal', `${name} ty: solved`);
  await click('[data-act="back"]').catch(() => {});

  // ---- tx: scene → ask → cipher → torn → words (geslo) → lie (2 claims, hmm, pair) → solve (proof pair)
  await p.evaluate(() => { S.file = 'gt'; playCase(1); });
  await click('[data-act="answer"]'); await click('[data-act="toScene"]');
  ok((await p.$$('.obj')).length === 6, `${name} tx: the scene has its own 6 objects`);
  for (const s of ['s1', 's2', 's9', 's11', 's12', 's13']) { await p.click(`.obj[data-sid="${s}"]`); await wait(40); }
  ok((await p.$eval('[data-act="toSolve"]', e => e.innerText)).includes('Naprej'), `${name} tx: scene → »Naprej 👉«`);
  await click('[data-act="toSolve"]');
  for (const who of ['luka', 'hana', 'bepi']) { await click(`.suspect[data-id="${who}"]`); await click('.qbtn'); await wait(1000); }
  ok((await text()).includes('✓ Vsi so odgovorili') && (await p.$eval('[data-act="toSolve"]', e => e.innerText)).includes('Naprej'), `${name} tx: ask 3 / 3 → »Naprej 👉«`);
  await click('[data-act="toSolve"]');
  ok(await st() === 'cipher' && (await p.$$('.ccell')).length === 15 && (await p.$$('.ctile')).length === 10, `${name} tx: cipher, 15 cells, 9 letters + 1 decoy tile`);
  ok((await p.$$eval('.cchip b', els => els.map(e => e.innerText))).includes('?'), `${name} tx: the missing pair shows ?`);
  await check('cipher');
  const ringCh = () => p.evaluate(() => cipherCells(S.c.cipher).flat()[S.run.cring].ch);
  await click('.ctile[data-l="Č"]');
  ok(await R('cwrong') === 1 && (await text()).includes('Ta črka ni prava'), `${name} tx: wrong tile → note`);
  // fill everything but R
  for (let i = 0; i < 20; i++) {
    const ch = await ringCh();
    if (ch === 'R') { const idx = await p.evaluate(() => cipherCells(S.c.cipher).flat().findIndex((x, i) => x.e && !S.run.cgot.includes(x.ch) && x.ch !== 'R')); if (idx < 0) break; await click(`.ccell[data-i="${idx}"]`); continue; }
    await click(`.ctile[data-l="${ch}"]`);
  }
  ok(await ringCh() === 'R', `${name} tx: only the missing R is left`);
  await click('.ctile[data-l="Č"]');
  ok((await p.$eval('#hint', e => e.innerText)).includes('zadnjo besedo'), `${name} tx: wrong at the missing pair → h1 (read the word)`);
  await hintOk(); await click('.ctile[data-l="Č"]');
  ok((await p.$eval('#hint', e => e.innerText)).includes('Manjka R'), `${name} tx: again → h2 gives the letter`);
  await hintOk(); await click('.ctile[data-l="R"]');
  ok((await text()).includes('Bepi je lovil ribe.') && (await R('found')).includes('s6') && await p.$('[data-act="toScene"]:not([disabled])'), `${name} tx: decoded, the sentence is in the pocket`);
  await check('cipher-done');
  await click('[data-act="toScene"]');
  ok(await st() === 'torn' && (await p.$$('.pdeck .strip')).length === 3, `${name} tx: torn note, 3 strips`);
  await check('torn');
  const deck = await p.evaluate(() => S.run.deck);
  for (const k of deck) { await p.click(`.strip[data-k="${k}"]`); await wait(40); }
  await click('[data-act="checkOrder"]');
  ok((await text()).includes('Preberi ga na glas') || (await R('ordered')), `${name} tx: a wrong order → note`);
  for (let tries = 0; tries < 4 && !(await R('ordered')); tries++) {
    await hintOk();
    for (let i = 0; i < 3; i++) if ((await R('slots'))[i] === null) await click(`.strip[data-k="${i}"]`);
    await click('[data-act="checkOrder"]');
  }
  ok(await R('ordered') && (await R('found')).includes('s7') && (name === 'land' || (await text()).includes('Listek je cel')), `${name} tx: whole → into the pocket`);
  await check('torn-done');
  await click('[data-act="toScene"]');
  ok(await st() === 'words', `${name} tx: on to the word search`);
  for (const word of ['GRAD', 'VAL', 'ALGE', 'PERO']) {
    const [a, z] = await p.evaluate((wd) => { const sp = wordSpots(S.c.words)[wd]; return [sp.cells[0], sp.cells[sp.cells.length - 1]]; }, word);
    await click(`.wcell[data-i="${a}"]`); await click(`.wcell[data-i="${z}"]`);
  }
  ok(await p.$('.geslo') && (await p.$$('.wcell.left')).length === 21 && (await R('found')).includes('s8'), `${name} tx: the geslo: 21 letters glow, the sentence is in the pocket`);
  ok((await p.$eval('.geslo', e => e.innerText.replace(/\s+/g, ' '))).includes('GUSTI PONOČI GREJE JAJCA'), `${name} tx: the strip spells GUSTI PONOČI GREJE JAJCA.`);
  await wait(2400); await check('geslo');
  await click('[data-act="toScene"]');
  ok(await st() === 'lie' && (await p.$$('.claim')).length === 2 && !(await p.$('.coach')), `${name} tx: lie with 2 claims, no owl the second time`);
  await check('lie2');
  await click('.liestep .row[data-sid="s2"]');
  ok((await text()).includes('Najprej tapni, kaj kdo trdi') && await R('lwrong') === 0, `${name} tx: a sentence first → "Najprej tapni …" (not counted)`);
  await click('.claim[data-sid="s3"]'); await click('.liestep .row[data-sid="s5"]');
  ok((await text()).includes('Hmm … Bomo videli') && await R('lwrong') === 0, `${name} tx: the near miss → hmm note (not counted)`);
  await click('.claim[data-sid="s1"]'); await click('.liestep .row[data-sid="s2"]');
  ok((await text()).includes('Eden je pravi') && (await R('lrows')).join() === 's2', `${name} tx: half of the pair → "Eden je pravi!", it stays`);
  await click('.liestep .row[data-sid="s9"]');
  ok(await R('caught') && await R('lphase') === 'stamp' && !(await p.$('.btn.ugovor')), `${name} tx: both → caught, no shout this time`);
  await wait(1900);
  ok((await R('found')).includes('s10'), `${name} tx: the truth in the pocket`);
  await click('[data-act="toScene"]');
  await click('[data-act="pickClue"][data-sid="s13"]'); await click('.suspect[data-id="luka"]');
  ok((await p.$eval('#hint', e => e.innerText)).includes('Eden je pravi') && await p.$('.row.proof[data-sid="s13"]'), `${name} tx: one proof + Luka → half of the pair, it stays green`);
  await hintOk();
  await click('[data-act="pickClue"][data-sid="s12"]'); await click('.suspect[data-id="luka"]'); await wait(300);
  ok(await st() === 'reveal', `${name} tx: the second proof solves it`);
  await click('[data-act="back"]').catch(() => {});

  // ---- the corkboard: the second guess, then the final's book
  await p.evaluate(() => { localStorage.setItem('dp_played_v1', JSON.stringify(['gt:1', 'gt:2'])); localStorage.setItem('dp_guess_v1', JSON.stringify({ gt: 'bepi' })); S.file = 'gt'; S.pinNew = null; go('board'); });
  ok((await text()).includes('Ali še vedno tako misliš?') && await p.$('[data-act="guessChange"]'), `${name}: board asks again after case 2`);
  ok(await p.$eval('.cork', e => getComputedStyle(e).display !== 'none'), `${name}: the question shows (also on a landscape phone)`);
  await check('guess-again');
  await click('[data-act="guessChange"]');
  ok((await text()).includes('(prej)'), `${name}: »Spremenim« → the options, the old one marked (prej)`);
  await click('[data-act="ventGuess"][data-id="luka"]');
  const g = await p.evaluate(() => JSON.parse(localStorage.getItem('dp_guess_v1')));
  ok(g.gt === 'luka' && g['gt:first'] === 'bepi' && g['gt:again'] === 'changed', `${name}: the new guess, the first one kept`);
  ok(!(await text()).includes('Ali še vedno'), `${name}: it asks once only`);
  await p.evaluate(() => { localStorage.setItem('dp_played_v1', JSON.stringify(['gt:1', 'gt:2', 'gt:3'])); S.c = CASES.find(c => c.id === 'tz'); S.run = newRun(); go('reveal'); });
  ok((await text()).includes('Spremenila si mnenje in imela prav'), `${name}: the final checks the changed guess`);
  await click('[data-act="next"]');
  ok(await st() === 'book' && (await text()).includes('Ali smem napisati knjigo o tebi?'), `${name}: Naprej → Vera's question`);
  await click('[data-act="bookYes"]');
  ok((await p.$eval('.bcover', e => e.innerText)).includes('Detektivka Ana') && (await text()).includes('in skrivnost hotela Galeb'), `${name}: the cover has the detective's name`);
  await check('book');
  await click('[data-act="next"]');
  ok(await st() === 'board', `${name}: then the board`);
  const evs = await p.evaluate(() => JSON.parse(localStorage.getItem('dp_log_v1')).map(e => e.type));
  for (const t of ['lie_try', 'lie_hint', 'lie_shout', 'lie_done', 'puzzle_cipher', 'puzzle_torn', 'guess_again', 'book_yes']) ok(evs.includes(t), `${name}: logged ${t}`);
  ok(!(await p.evaluate(() => localStorage.getItem('dp_log_v1'))).includes('Ana'), `${name}: the name is never logged`);
  ok(!errors.length, `${name}: no page errors ${errors.join(' | ')}`);
  await p.close();
}
await b.close();
