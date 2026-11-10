// Case 2: call → question the suspects → cross off → proof; self-claim hint; letter; board counts.
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
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('dp_save_version', '3'); localStorage.setItem('dp_tutorial_done', 'true');
    localStorage.setItem('dp_played_v1', JSON.stringify(['bip:1']));
    localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏻', g: 'm', sk: '🐶', name: 'Luka', id: '1234' })); });
  await p.reload(); await wait(400);
  const text = () => p.evaluate(() => document.body.innerText);
  const shot = (s) => p.screenshot({ path: `shots/b2-${name}-${s}.png` });
  const overflow = () => p.evaluate(() => { const W = document.documentElement.clientWidth; const bad = [];
    document.querySelectorAll('#app *').forEach(el => { if (el.closest('.pins')) return; const r = el.getBoundingClientRect(); if (r.width && (r.right > W + 1 || r.left < -1)) bad.push(el.className || el.tagName); });
    return [...new Set(bad)].slice(0, 6); });
  const check = async (s) => { const o = await overflow(); ok(!o.length, `${name} ${s}: no overflow ${o.length ? JSON.stringify(o) : ''}`); await shot(s); };
  await p.click('.file-card[data-file="bip"]'); await wait();
  ok((await p.$$('.folder.soon')).length === await p.evaluate(() => 6 - casesIn('bip').length) && !(await p.$('.waiting')), `${name}: board: written cases + the rest coming, no waiting note`);
  ok(await p.$('.folder[data-no="2"]:not(.soon)'), `${name}: case 2 is open`);
  await p.click('.folder[data-no="2"]'); await wait();
  await p.click('[data-act="answer"]'); await wait();
  ok((await text()).includes('velik vtikač') && (await p.$eval('[data-act="toScene"]', e => e.innerText)).includes('Naprej'), `${name}: Maja calls, »Naprej 👉«`);
  await check('call');
  await p.click('[data-act="toScene"]'); await wait();
  ok(await p.evaluate(() => S.screen) === 'ask' && await p.$eval('[data-act="toSolve"]', e => e.disabled), `${name}: ask screen, "Vem" locked`);
  await p.click('.suspect[data-id="robi"]'); await wait();
  ok((await p.$$('.qbtn')).length === 1, `${name}: Robi has 1 question`);
  await p.click('.qbtn[data-sid="s5"]'); await wait();
  ok(await p.$('.typing') && (await p.$$('.msg.me')).length === 1, `${name}: question sent, Robi is typing`);
  ok((await p.$$('.qbtn')).length === 0, `${name}: no question chips while typing`);
  await wait(1000);
  ok((await p.$eval('.msg.them:last-child', e => e.innerText)).includes('Vso noč sem bil na polnilcu.'), `${name}: Robi's answer bubble`);
  ok((await p.$$('.qbtn')).length === 0, `${name}: no question left for Robi`);
  await check('ask-robi');
  for (const [who, sids] of [['tim', ['s1', 's2', 's6']], ['ela', ['s3', 's4']], ['kiki', ['s7']]]) {
    await p.click(`.suspect[data-id="${who}"]`); await wait(60);
    for (const sid of sids) { await p.click(`.qbtn[data-sid="${sid}"]`); await wait(1050); }
  }
  ok(!(await p.$eval('[data-act="toSolve"]', e => e.disabled)) && (await p.$$('.ask .suspect .ok')).length === 4, `${name}: everyone asked, "Vem" open`);
  await check('ask-done');
  await p.click('[data-act="toSolve"]'); await wait();
  ok((await text()).includes('Robi:'), `${name}: solve rows show who said it`);
  await p.click('[data-act="pickClue"][data-sid="s5"]'); await p.click('.suspect[data-id="robi"]'); await wait();
  ok((await p.$eval('#hint', e => e.innerText)).includes('To trdi o sebi'), `${name}: Robi's own claim → "To trdi o sebi"`);
  await check('selfclaim');
  await p.click('[data-act="hintOk"]'); await wait();
  for (const [sid, id] of [['s1', 'ela'], ['s3', 'tim'], ['s6', 'kiki']]) { await p.click(`[data-act="pickClue"][data-sid="${sid}"]`); await p.click(`.suspect[data-id="${id}"]`); await wait(80); }
  ok((await p.evaluate(() => S.run.crossed)).join() === 'ela,tim,kiki', `${name}: alibis cross off Ela, Tim, Kiki`);
  await check('solve');
  await p.click('[data-act="pickClue"][data-sid="s4"]'); await p.click('.suspect[data-id="robi"]'); await wait(1600);
  const t = await text();
  ok(t.includes('Detektiv Luka je ujel Robija!'), `${name}: "Detektiv Luka je ujel Robija!"`);
  await check('reveal');
  await p.click('[data-act="next"]'); await wait();
  ok(await p.$('.pin-wrap'), `${name}: the new card comes alone`); await p.click('.pin-wrap [data-act="next"]'); await wait();
  ok((await p.$$('.cork .pincard:not(.empty)')).length === 2 || name === 'land', `${name}: 2 cards pinned`);
  if (name !== 'land') {
    ok(await p.$('.pincard.new') && await p.$('.string.draw') && (await p.$eval('.think', e => e.innerText)).includes('isto bitje'), `${name}: new card flies in, string draws, thought shown`);
    ok(await p.$('.vent .eyes'), `${name}: eyes in the vent`);
    await wait(1500); await shot('board-new');
    await p.click('.vent'); await wait(100);
    ok(await p.$('.vent.peek'), `${name}: tapping the vent → pip-pip`);
  }
  ok(!(await p.$('.waiting')) && await p.$('.folder[data-no="3"]:not(.soon)'), `${name}: case 3 is open next, no waiting note`);
  await p.reload(); await wait(400);
  await p.click('.file-card[data-file="bip"]'); await wait();
  ok((await text()).includes('moj sir'), `${name}: Maja's letter next visit`);
  ok(!(await p.$('.think')), `${name}: the thought shows only right after solving`);
  ok(errors.length === 0, `${name}: no page errors ${errors.join('|')}`);
  await p.close();
}
await b.close();
