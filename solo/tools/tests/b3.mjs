// Case 3: call → camera film → scene (torch) → cross off → proof; corkboard card 3, vent guess; letter.
import './brief-auto.mjs';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 120) => new Promise(r => setTimeout(r, ms));
for (const [name, w, h] of [['iphone14', 390, 844], ['ipad', 820, 1180], ['land', 852, 393]]) {
  const p = await b.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.evaluateOnNewDocument(() => { if (window.speechSynthesis) speechSynthesis.getVoices = () => []; });
  await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8765/solo/?play');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('dp_save_version', '4'); localStorage.setItem('dp_tutorial_done', 'true');
    localStorage.setItem('dp_played_v1', JSON.stringify(['bip:1', 'bip:2']));
    localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏽‍♀️', g: 'f', sk: '🐶', name: 'Ana', id: '1234' })); });
  await p.reload(); await wait(400);
  const text = () => p.evaluate(() => document.body.innerText);
  const shot = (s) => p.screenshot({ path: `shots/b3-${name}-${s}.png` });
  const overflow = () => p.evaluate(() => { const W = document.documentElement.clientWidth; const bad = [];
    document.querySelectorAll('#app *').forEach(el => { if (el.closest('.pins')) return; const r = el.getBoundingClientRect(); if (r.width && (r.right > W + 1 || r.left < -1)) bad.push(el.className || el.tagName); });
    return [...new Set(bad)].slice(0, 6); });
  const reach = (sel) => p.evaluate((sel) => { const e = document.querySelector(sel); e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); return r.bottom <= innerHeight + 1 && r.top >= 0; }, sel);
  const check = async (s) => { const o = await overflow(); ok(!o.length, `${name} ${s}: no overflow ${o.length ? JSON.stringify(o) : ''}`); await shot(s); };
  await p.click('.file-card[data-file="bip"]'); await wait();
  ok(!(await p.$('.folder.soon')) && await p.$('.folder.locked[data-no="6"]') && !(await p.$('.waiting')), `${name}: board: 6 cases, the final one locked`);
  ok(await p.$('.guess') === null, `${name}: no vent guess before case 3`);
  await p.click('.folder[data-no="3"]'); await wait();
  await p.click('[data-act="answer"]'); await wait();
  ok((await text()).includes('Moj sir je izginil') && !(await p.$('[data-act="toScene"]')) && await p.$('[data-act="filmPlay"]'), `${name}: Maja calls, "Poglej posnetek", scene still closed`);
  await check('call');
  await p.click('[data-act="filmPlay"]'); await wait();
  ok((await p.$eval('.film .row', e => e.innerText)).includes('sir in bleščeča žlička'), `${name}: film frame 1`);
  await p.click('[data-act="filmNext"]'); await wait();
  ok(await p.$('.film-pic.blur'), `${name}: frame 2 is blurry (something small)`);
  await check('film2');
  await p.click('[data-act="filmNext"]'); await wait(); await p.click('[data-act="filmNext"]'); await wait();
  ok((await p.$eval('.film .row', e => e.innerText)).includes('Tudi žličke ni') && !(await p.$('[data-act="filmNext"]')), `${name}: last frame, no "Naprej"`);
  ok(await reach('[data-act="toScene"]'), `${name}: "Na kraj dogodka" reachable after the film`);
  await check('film4');
  await p.click('[data-act="toScene"]'); await wait();
  ok((await p.$$('.obj')).length === 7 && (await p.$$('.obj.dark')).length === 1, `${name}: scene: 7 objects, 1 dark`);
  await p.click('[data-act="torch"]'); await wait(60);
  for (const s of ['s1', 's2', 's3', 's4', 's5', 's6', 's7']) { await p.click(`.obj[data-sid="${s}"]`); await wait(60); }
  ok((await text()).includes('spet droben zelen odtis'), `${name}: the green footprint is back`);
  await check('scene');
  await p.click('[data-act="toSolve"]'); await wait();
  await p.click('[data-act="pickClue"][data-sid="s1"]'); await p.click('.suspect[data-id="tim"]'); await wait();
  ok(!!(await p.$('#hint')), `${name}: "Tim ima rad sir" + Tim → hint`);
  await p.click('[data-act="hintOk"]'); await wait();
  for (const [sid, id] of [['s2', 'ela'], ['s4', 'tim'], ['s7', 'robi']]) { await p.click(`[data-act="pickClue"][data-sid="${sid}"]`); await p.click(`.suspect[data-id="${id}"]`); await wait(80); }
  ok((await p.evaluate(() => S.run.crossed)).join() === 'ela,tim,robi', `${name}: alibis cross off Ela, Tim, Robi`);
  await check('solve');
  await p.click('[data-act="pickClue"][data-sid="s5"]'); await p.click('.suspect[data-id="kiki"]'); await wait(1600);
  ok((await text()).includes('Detektivka Ana je ujela Kiki!'), `${name}: "Detektivka Ana je ujela Kiki!"`);
  await check('reveal');
  await p.click('[data-act="next"]'); await wait();
  ok((await p.$$('.cork .pincard:not(.empty)')).length === 3, `${name}: 3 cards pinned`);
  ok((await p.$eval('.think', e => e.innerText)).includes('bleščeča žlička'), `${name}: thought about the spoon`);
  ok((await p.$$('.guess-opts .btn')).length === 3, `${name}: vent guess with 3 options`);
  await wait(1500); await check('board-guess');
  if (name !== 'land') {   // the corkboard is hidden on a landscape phone
    await p.click('[data-act="ventGuess"][data-id="alien"]'); await wait();
    ok((await p.$eval('.guess.done', e => e.innerText)).includes('bitje iz vesolja'), `${name}: guess kept: alien`);
    ok(JSON.parse(await p.evaluate(() => localStorage.getItem('dp_guess_v1'))).bip === 'alien', `${name}: guess stored`);
  }
  ok(await p.$('.folder[data-no="4"]:not(.soon)'), `${name}: case 4 is open next`);
  await p.reload(); await wait(400);
  await p.click('.file-card[data-file="bip"]'); await wait();
  ok((await text()).includes('srebrne žice'), `${name}: Maja's letter next visit`);
  await p.click('[data-act="letterOk"]'); await wait();
  ok((name === 'land' || await p.$('.guess.done')) && !(await p.$('.think')), `${name}: guess still shown after reload, no thought`);
  await shot('board-later');
  ok(errors.length === 0, `${name}: no page errors ${errors.join('|')}`);
  await p.close();
}
await b.close();
