// The new step case: call → scene (torch) → cross off → proof → newspaper → card → letter next visit.
import './brief-auto.mjs';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 120) => new Promise(r => setTimeout(r, ms));
const devices = [['iphone14', 390, 844], ['ipad', 820, 1180], ['land', 852, 393]];
for (const [name, w, h] of devices) {
  const p = await b.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.evaluateOnNewDocument(() => { if (window.speechSynthesis) speechSynthesis.getVoices = () => []; });
  await p.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1');
  await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8765/solo/?play');
  // 2 cases already solved: solving this one makes her a Detektivka (3)
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('dp_save_version', '3'); localStorage.setItem('dp_tutorial_done', 'true');
    localStorage.setItem('dp_played_v1', JSON.stringify(['galeb:1', 'galeb:2']));
    localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏽‍♀️', g: 'f', sk: '🐶', name: 'Ana', id: '1234' })); });
  await p.reload(); await wait(400);
  const st = () => p.evaluate(() => S.screen);
  const shot = (s) => p.screenshot({ path: `shots/bip-${name}-${s}.png` });
  const text = () => p.evaluate(() => document.body.innerText);
  const overflow = () => p.evaluate(() => {
    const W = document.documentElement.clientWidth; const bad = [];
    document.querySelectorAll('#app *').forEach(el => { if (el.closest('.pins')) return; const r = el.getBoundingClientRect(); if (r.width && (r.right > W + 1 || r.left < -1)) bad.push(el.className || el.tagName); });
    return [...new Set(bad)].slice(0, 6);
  });
  const inView = (sel) => p.$eval(sel, el => { const r = el.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight + 1; });
  const check = async (s) => { const o = await overflow(); ok(!o.length, `${name} ${s}: no horizontal overflow ${o.length ? JSON.stringify(o) : ''}`); await shot(s); };

  ok((await text()).includes('Vajenka'), `${name}: ID card shows the rank (🔰 Vajenka)`);
  await check('files');
  ok((await p.$$('.file-card:not(.teaser)')).length === await p.evaluate(() => FILES.length) && await p.$('.file-card.season[data-file="bip"]'), `${name}: every adventure, the new season is marked`);
  await p.click('.file-card[data-file="bip"]'); await wait();
  ok(await st() === 'board' && (await p.$$('.folder')).length === 6 && (await p.$$('.folder.soon')).length === await p.evaluate(() => 6 - casesIn('bip').length), `${name}: board: written cases + the rest coming soon`);
  if (name !== 'land') ok((await p.$$('.cork .pincard.empty')).length === 6, `${name}: corkboard with 6 empty slots`);
  await check('board');

  await p.click('.folder[data-no="1"]'); await wait();
  ok(await st() === 'call' && await p.$('.phone') && (await text()).includes('Zvoni'), `${name}: the phone rings`);
  await check('call-ring');
  await p.click('[data-act="answer"]'); await wait();
  ok((await text()).includes('omarico s piškoti') && (await p.$$('.suspects .suspect')).length === 4, `${name}: Vesna explains, 4 suspects`);
  await check('call');
  await p.click('[data-act="toScene"]'); await wait();
  ok(await st() === 'scene' && await p.$eval('[data-act="toSolve"]', el => el.disabled), `${name}: scene, "Vem" locked until everything is searched`);
  for (const sid of ['s1', 's2', 's3', 's4', 's5', 's7']) { await p.click(`.obj[data-sid="${sid}"]`); await wait(60); }
  ok((await p.$$('.pocket .row')).length === 6, `${name}: 6 clues in the pocket`);
  await p.click('.obj[data-sid="s6"]'); await wait();
  ok((await text()).includes('pretemno') && (await p.$$('.pocket .row')).length === 6, `${name}: dark corner needs the torch`);
  await check('scene-dark');
  await p.click('[data-act="torch"]'); await wait();
  await p.click('.obj[data-sid="s6"]'); await wait();
  ok((await p.$$('.pocket .row')).length === 7 && !(await p.$eval('[data-act="toSolve"]', el => el.disabled)), `${name}: torch reveals the footprint, all 7 found`);
  await check('scene');
  await p.click('[data-act="toSolve"]'); await wait();
  ok(await st() === 'solve', `${name}: solve screen`);
  // a face without a clue
  await p.click('.suspect[data-id="ela"]'); await wait();
  ok((await text()).includes('Najprej tapni stavek'), `${name}: face first → "Najprej tapni stavek"`);
  // the decoy does not clear Ela
  await p.click('[data-act="pickClue"][data-sid="s2"]'); await p.click('.suspect[data-id="ela"]'); await wait();
  ok(await p.$('#hint') && !(await p.evaluate(() => S.run.crossed.length)), `${name}: decoy + Ela → "ne dokaže", not crossed`);
  await check('solve-hint');
  await p.click('[data-act="hintOk"]'); await wait();
  // alibis
  for (const [sid, id] of [['s3', 'kiki'], ['s5', 'robi'], ['s7', 'ela']]) {
    await p.click(`[data-act="pickClue"][data-sid="${sid}"]`); await p.click(`.suspect[data-id="${id}"]`); await wait(80);
  }
  ok((await p.evaluate(() => S.run.crossed)).join() === 'kiki,robi,ela' && (await p.$$('.suspect.crossed')).length === 3, `${name}: the 3 alibis cross off Kiki, Robi, Ela`);
  ok((await text()).includes('Ostal je samo eden'), `${name}: "Ostal je samo eden. Pokaži dokaz!"`);
  await check('solve');
  await p.click('[data-act="pickClue"][data-sid="s4"]'); await p.click('.suspect[data-id="tim"]'); await wait(1600);
  ok(await st() === 'reveal', `${name}: proof + Tim → solved`);
  const t = await text();
  ok(t.includes('ZVEZDNI ČASNIK') && t.includes('Detektivka Ana je ujela Tima!'), `${name}: newspaper "Detektivka Ana je ujela Tima!"`);
  ok(t.includes('Napredovala si! Zdaj si 🕵️ Detektivka.'), `${name}: rank-up "Napredovala si!"`);
  ok(t.includes('Nov namig na tabli skrivnosti'), `${name}: the footprint card is pinned`);
  ok(await inView('[data-act="next"]'), `${name}: "Naprej" visible on the solved screen`);
  await check('reveal');
  await p.click('[data-act="next"]'); await wait();
  ok(await p.$('.folder[data-no="1"].solved') && !(await p.$('.letter')), `${name}: ✔ on the board, no letter yet in the same visit`);
  if (name !== 'land') ok(await p.$('.think') && !(await p.$('.vent')), `${name}: thought after 1 card, no eyes yet`);
  if (name !== 'land') ok((await p.$$('.cork .pincard:not(.empty)')).length === 1, `${name}: 1 card on the corkboard`);
  ok(!(await p.$('.trophy')), `${name}: no "Pustolovščina rešena" while cases are still coming`);
  await check('board-after');
  // next visit: the letter
  await p.reload(); await wait(400);
  await p.click('.file-card[data-file="bip"]'); await wait();
  ok(await p.$('.letter') && (await text()).includes('piska v zračniku'), `${name}: next visit → Vesna's letter`);
  await check('letter');
  await p.click('[data-act="letterOk"]'); await wait();
  ok(!(await p.$('.letter')), `${name}: letter closed`);
  await p.reload(); await wait(400);
  await p.click('.file-card[data-file="bip"]'); await wait();
  ok(!(await p.$('.letter')), `${name}: the letter comes only once`);
  // assisted path on a replay: 4 wrong tries → the target pulses
  await p.click('.folder[data-no="1"]'); await wait();
  await p.click('[data-act="answer"]'); await p.click('[data-act="toScene"]');
  await p.click('[data-act="torch"]');
  for (const sid of ['s1', 's2', 's3', 's4', 's5', 's6', 's7']) { await p.click(`.obj[data-sid="${sid}"]`); await wait(30); }
  await p.click('[data-act="toSolve"]'); await wait();
  for (let i = 0; i < 4; i++) { await p.click('[data-act="pickClue"][data-sid="s1"]'); await p.click('.suspect[data-id="tim"]'); await wait(60); await p.click('[data-act="hintOk"]'); }
  ok(await p.$('.row.pulse') && await p.$('.suspect.pulse'), `${name}: after 4 wrong tries the next clue and face pulse`);
  ok(errors.length === 0, `${name}: no page errors ${errors.join('|')}`);
  await p.close();
}
// debrief lists the new case
const p = await b.newPage();
await p.goto('http://localhost:8765/solo/'); await wait(300);
await p.evaluate(() => go('debrief')); await wait();
ok((await p.evaluate(() => document.body.innerText)).includes('b1'), 'debrief shows the b1 attempts');
await b.close();
