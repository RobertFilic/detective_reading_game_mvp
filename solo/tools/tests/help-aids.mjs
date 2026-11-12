// Help that differs by level (docs/WARMUP_AND_HELP.md §2 and §5), with the level pinned by ?help=1|2|3:
// the goal said on entering a step (2) or pinned (3), the next thing to read glowing, hints one try earlier (3),
// solve one sentence at a time (3, offered at 2), and the coin's whole ladder in a puzzle and in UGOVOR.
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 150) => new Promise(r => setTimeout(r, ms));
const kid = { av: '🕵🏽‍♀️', g: 'f', sk: '🦊', name: 'Ana', id: '1234' };
// a detective who knows every kind of step, so only the pinned level decides
const known = Object.fromEntries(['scene', 'ask', 'words', 'lock', 'order', 'cipher', 'torn', 'lie', 'herring', 'when'].map(k => [k, { n: 3, hard: false }]));
const state = (o = {}) => JSON.stringify({ v: 2, g: 1, over: null, warm: 'done', streak: 0, skills: known, hist: [], ...o });

async function open(level, w = 390, h = 844, help = state()) {
  const p = await b.newPage();
  p.errors = []; p.on('pageerror', e => p.errors.push(e.message));
  await p.evaluateOnNewDocument(() => { window.NO_READ_WAIT = true; });
  await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.goto(`http://localhost:8765/solo/?play${level ? '&help=' + level : ''}`);
  await p.evaluate((k, hs) => { localStorage.clear(); localStorage.setItem('dp_save_version', '4'); localStorage.setItem('dp_profile_v1', JSON.stringify(k));
    localStorage.setItem('dp_help_v1', hs); localStorage.setItem('dp_ugovor_v1', 'true'); }, kid, help);
  await p.reload(); await wait(400);
  p.txt = (sel) => p.$eval(sel, e => e.innerText).catch(() => '');
  p.fits = () => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth && [...document.querySelectorAll('.footer > *')].every(e => { const r = e.getBoundingClientRect(); return r.width === 0 || (r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1 && r.left >= -1); }));
  return p;
}
const closeNote = async (p) => { if (await p.$('#note')) { await p.click('[data-act="noteOk"]'); await wait(60); } };
const toScene = async (p) => { await p.evaluate(() => { S.file = 'bip'; playCase(1); }); await wait(100); await p.click('[data-act="answer"]'); await p.click('[data-act="toScene"]'); await wait(100); };
const openAll = async (p) => {
  await p.click('[data-act="torch"]');
  for (const sid of await p.$$eval('.obj:not(.got)', els => els.map(e => e.dataset.sid))) { await p.click(`.obj[data-sid="${sid}"]`); await wait(60); await closeNote(p); }
};
const toSolve = async (p) => { await toScene(p); await p.click('[data-act="briefOk"]'); await openAll(p); await p.click('[data-act="toSolve"]'); await wait(120); await p.click('[data-act="briefOk"]'); await wait(120); };
const pair = async (p, sid, who) => { if (await p.$(`.wdot[data-sid="${sid}"]`)) await p.click(`.wdot[data-sid="${sid}"]`); else await p.click(`.row[data-sid="${sid}"]`); await wait(60); await p.click(`.suspect[data-id="${who}"]`); await wait(180); };

// ---- level 1: as before. No goal on entering, nothing pinned, the list; the first wrong pair is a gentle note
{
  const p = await open(1);
  await toScene(p); await p.click('[data-act="briefOk"]'); await wait(200);
  ok(!(await p.$('.pal-say')) && (await p.txt('.qbar .ui-bubble')) === 'Preišči prostor. Tapni vsako stvar.' && !(await p.$('.nglow')), 'level 1 scene: no goal bubble, the usual instruction on top, nothing glows');
  await openAll(p); await p.click('[data-act="toSolve"]'); await wait(120); await p.click('[data-act="briefOk"]'); await wait(150);
  ok(!(await p.$('.walk')) && (await p.$$('.rows .row')).length === 7 && !(await p.$('.nglow')), 'level 1 solve: the whole list, nothing glows');
  await pair(p, 's1', 'tim');
  ok((await p.txt('#hint')).includes('Ni prav') && await p.evaluate(() => S.run.rung === 0), 'level 1: the first wrong pair is only a gentle »Ni prav«');
  await p.click('[data-act="hintOk"]'); await p.click('.row[data-sid="s2"]'); await wait(100);
  ok(await p.$('.row.nglow') && await p.evaluate(() => document.querySelector('.row.nglow').dataset.sid === 's3'), 'after a wrong pair the next sentence not read yet glows (s3: s1 and s2 were tapped)');
  ok(!p.errors.length, `no page errors ${p.errors.join('|')}`);
  await p.close();
}

// ---- level 2: the goal on entering each step, once; after two wrong pairs the offer of one sentence at a time
{
  const p = await open(2);
  await toScene(p);
  ok(!(await p.$('.pal-say')), 'level 2: no bubble while the instruction card is open');
  await p.click('[data-act="briefOk"]'); await wait(200);
  ok((await p.txt('.pal-say')).includes('Tapni vsako stvar.') && (await p.txt('.qbar .ui-bubble')).startsWith('Preišči prostor.'), 'level 2 scene: the companion says the goal on entering');
  await p.click('.pocket-count'); await wait(100);
  ok(!(await p.$('.pal-say')), 'a tap takes the bubble away; it is said once');
  await openAll(p); await p.click('[data-act="toSolve"]'); await wait(120); await p.click('[data-act="briefOk"]'); await wait(200);
  ok((await p.txt('.pal-say')).includes('Kdo ni bil? Prečrtaj ga.') && !(await p.$('.walk')), 'level 2 solve: the goal again, the whole list');
  await pair(p, 's1', 'tim'); await p.click('[data-act="hintOk"]');
  ok(!(await p.$('[data-act="walkYes"]')), 'one wrong pair: no offer yet');
  await pair(p, 's1', 'ela'); await p.click('[data-act="hintOk"]'); await wait(100);
  ok((await p.txt('[data-act="walkYes"]')) === 'Beri po en stavek' && await p.fits(), 'two wrong pairs: »Beri po en stavek« is offered in the footer');
  await p.screenshot({ path: 'shots/aids-2-offer.png' });
  await p.click('[data-act="walkYes"]'); await wait(150);
  ok(await p.$('.walk') && (await p.$$('.walk .row')).length === 1 && !(await p.$('[data-act="walkYes"]')), 'accepting it shows one sentence at a time');
  ok(!p.errors.length, `no page errors ${p.errors.join('|')}`);
  await p.close();
}

// ---- level 3 on three screens: goal pinned, next thing glows, one sentence at a time, hints one try earlier
for (const [dev, w, h] of [['iphone14', 390, 844], ['se', 375, 667], ['land', 844, 390]]) {
  const p = await open(3, w, h);
  await toScene(p); await p.click('[data-act="briefOk"]'); await wait(200);
  ok((await p.txt('.qbar .ui-bubble')) === 'Tapni vsako stvar.' && !(await p.$('.pal-say')), `${dev} level 3 scene: the line on top is the short goal (no bubble)`);
  ok(await p.$('.obj.nglow') && await p.evaluate(() => document.querySelector('.obj.nglow') === document.querySelector('.obj:not(.got)')), `${dev}: the next thing still closed glows`);
  ok(await p.fits(), `${dev} scene: the footer fits the screen`);
  await p.screenshot({ path: `shots/aids-3-${dev}-scene.png` });
  await openAll(p);
  ok((await p.txt('.qbar .ui-bubble')).startsWith('Vse je preiskano'), `${dev}: with everything open the line says so`);
  await p.click('[data-act="toSolve"]'); await wait(120); await p.click('[data-act="briefOk"]'); await wait(200);
  ok(await p.$('.solve.walking') && (await p.$$('.walk .row')).length === 1 && (await p.$$('.wdot')).length === 7 && await p.$('.wdot.on[data-sid="s1"]'), `${dev} solve: one sentence (the first), a dot per sentence`);
  ok((await p.txt('.qbar .ui-bubble')) === 'Kdo ni bil? Prečrtaj ga.' && await p.fits() && await p.evaluate(() => [...document.querySelectorAll('.wdot, .walk-all')].every(e => { const r = e.getBoundingClientRect(), f = document.querySelector('.footer').getBoundingClientRect(); return r.bottom <= f.top + 1; })), `${dev}: the short goal on top; faces, card, dots, »Vsi stavki« and »Naslednji stavek« all fit`);
  await p.screenshot({ path: `shots/aids-3-${dev}-walk.png` });
  await p.click('[data-act="walkNext"]'); await wait(120);
  ok(await p.$('.wdot.on[data-sid="s2"]') && (await p.txt('.walk-prev')).includes('Ročaj omarice') && (await p.txt('.walk .row')).includes('Ela je zjutraj'), `${dev}: »Naslednji stavek« shows s2, with s1 small above it`);
  await p.click('.suspect[data-id="ela"]'); await wait(180);   // the decoy against Ela: the first wrong pair
  ok((await p.txt('#hint')).includes('Kdo NI mogel biti?'), `${dev} level 3: the first wrong pair gives the case's hint at once`);
  await p.click('[data-act="hintOk"]'); await wait(100);
  ok(await p.$('.wdot.on[data-sid="s2"]'), `${dev}: after a wrong pair the same sentence stays in focus`);
  await pair(p, 's3', 'kiki');
  ok(await p.$('.suspect.crossed[data-id="kiki"]') && await p.$('.wdot.used[data-sid="s3"]') && await p.$('.wdot.on[data-sid="s4"]'), `${dev}: a right pair crosses Kiki off, strikes the dot, and moves on to s4`);
  await p.click('.pal'); await wait(150);   // rung 2 from the coin (rung 1 came with the wrong pair)
  ok((await p.txt('#hint')).includes('Preberi stavek, ki sveti') && await p.$('.wdot.on[data-sid="s2"]') === null && await p.$('.wdot.lit'), `${dev}: the coin's next hint brings the lit sentence into focus`);
  await p.click('[data-act="hintOk"]');
  await pair(p, 's5', 'robi'); await pair(p, 's7', 'ela'); await closeNote(p);
  ok((await p.txt('.qbar .ui-bubble')) === 'Ostal je eden. Pokaži dokaz!', `${dev}: the line changes when one is left`);
  await p.click('[data-act="walkAll"]'); await wait(150);
  ok(!(await p.$('.walk')) && (await p.$$('.rows .row')).length === 7 && await p.evaluate(() => LOG.some(e => e.type === 'help_all')), `${dev}: »Vsi stavki« gives the whole list back`);
  await pair(p, 's4', 'tim');
  ok(await p.evaluate(() => S.screen === 'reveal') && !p.errors.length, `${dev}: solved from the list ${p.errors.join('|')}`);
  await p.close();
}

// ---- »Vsi stavki« in two cases in a row: the game stops opening one sentence at a time, until a hard case
{
  const p = await open(0, 390, 844, state({ g: 3, walkOff: 2 }));
  await toSolve(p);
  ok(!(await p.$('.walk')) && await p.evaluate(() => S.run.help === 3 && S.run.walkAuto === false), 'level 3 with »Vsi stavki« chosen twice: solve opens as the list');
  await p.evaluate(() => { helpAfterCase({ id: 'x', steps: ['call', 'scene', 'solve'] }, { ...newRun(), wrong: 4, rung: 3, assisted: true }); });
  ok(await p.evaluate(() => help().walkOff === 0), 'a hard case brings one sentence at a time back');
  await p.evaluate(() => { helpAfterCase({ id: 'y', steps: ['call', 'scene', 'solve'] }, { ...newRun(), walkAuto: true, walkAll: true }); helpAfterCase({ id: 'z', steps: ['call', 'scene', 'solve'] }, { ...newRun(), walkAuto: true, walkAll: true }); });
  ok(await p.evaluate(() => help().walkOff === 2), 'two cases with »Vsi stavki« are counted');
  await p.close();
}

// ---- a new kind of step gets level 2 even at level 1 (unless an adult fixed the level)
{
  const p = await open(0, 390, 844, state({ g: 1, skills: {} }));
  await toScene(p); await p.click('[data-act="briefOk"]'); await wait(200);
  ok((await p.txt('.pal-say')).includes('Tapni vsako stvar.') && await p.evaluate(() => lvl('scene') === 2 && lvl('solve') === 1), 'a detective who never met a scene: the goal is said there (level 2), solve stays at 1');
  await p.close();
  const q = await open(0, 390, 844, state({ g: 1, over: 1, skills: {} }));
  await toScene(q); await q.click('[data-act="briefOk"]'); await wait(200);
  ok(!(await q.$('.pal-say')) && await q.evaluate(() => lvl('scene') === 1), 'with the adult\'s level 1 a new step stays at 1');
  await q.close();
}

// ---- the coin's whole ladder in a puzzle (the lock of bip 5) and in UGOVOR (galeb 2); level 3 eases them
{
  const p = await open(1);
  const jump = (file, no, step) => p.evaluate((file, no, step) => { S.file = file; playCase(no); S.run.answered = true; S.run.briefed.push(step); go(step); }, file, no, step);
  await jump('bip', 5, 'lock'); await wait(150);
  await p.click('.pal'); await wait(120);
  const h1 = await p.evaluate(() => S.c.lock.h1), h2 = await p.evaluate(() => S.c.lock.h2);
  ok((await p.txt('#hint')).includes(h1), 'lock: the coin gives the first hint');
  await p.click('[data-act="hintOk"]'); await p.click('.pal'); await wait(120);
  ok((await p.txt('#hint')).includes(h2) && await p.evaluate(() => S.run.kwrong === 4 && tries('kwrong') === 0 && S.run.coin === 2), 'lock: a second tap gives the code; none of it counts as a wrong try');
  ok(await p.evaluate(() => helpVerdict(stepStats(S.c, S.run), S.run.coin) === 'hard'), 'a case where the coin gave the answer is a hard one');
  await p.click('[data-act="hintOk"]');
  await p.evaluate(() => { const code = S.c.lock.code; S.run.wheels = [...code].map(Number); render(); }); await p.click('[data-act="tryLock"]'); await wait(200);
  await p.click('.pal'); await wait(100);
  ok(!(await p.$('#hint')), 'lock open: the coin has nothing more to say');

  await jump('galeb', 2, 'lie'); await wait(150);
  for (const [n, key] of [[1, 'h1'], [2, 'lieLook'], [3, 'lieAssist']]) {
    await p.click('.pal'); await wait(120);
    ok(await p.evaluate((key) => S.run.hint && S.run.hint.key === key, key), `UGOVOR: coin tap ${n} gives ${key}`);
    await p.click('[data-act="hintOk"]'); await wait(60);
  }
  ok(await p.evaluate(() => S.run.lassisted && tries('lwrong') === 0 && LOG.filter(e => e.type === 'lie_hint' && e.via === 'coin').length === 3), 'UGOVOR: the answer is shown, with no wrong try counted');
  ok(!p.errors.length, `no page errors ${p.errors.join('|')}`);
  await p.close();

  const q = await open(3);
  await q.evaluate(() => { S.file = 'bip'; playCase(5); S.run.answered = true; S.run.briefed.push('lock'); go('lock'); }); await wait(150);
  await q.click('[data-act="tryLock"]'); await wait(200);   // 000 is not the code
  ok((await q.txt('#hint')).includes(await q.evaluate(() => S.c.lock.h1)) && await q.evaluate(() => tries('kwrong') === 1), 'level 3 lock: the first wrong code gives the hint at once (one try earlier)');
  ok(!q.errors.length, `no page errors ${q.errors.join('|')}`);
  await q.close();
}

// ---- pauses by level: 2 → the goal, the glow, then the coin pulses
{
  const p = await open(2);
  await p.evaluate(() => { HELP.idle[2] = [[0.3, 'goal'], [0.6, 'glow'], [0.9, 'coin']]; });
  await toSolve(p); await p.click('.row[data-sid="s1"]'); await wait(1300);
  ok(await p.$('.row.nglow') && await p.$('.pal.pulse') && await p.evaluate(() => LOG.filter(e => e.type === 'help_nudge').map(e => e.kind).slice(-3).join() === 'goal,glow,coin'), 'level 2, a long pause in solve: the goal, then the next sentence glows, then the coin pulses');
  await p.click('.pal'); await wait(100);
  ok(await p.evaluate(() => !S.run.palPulse), 'a tap on the coin stops its pulse');
  await p.close();
}
await b.close();
