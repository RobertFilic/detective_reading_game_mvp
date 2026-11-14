// Case 2: call → question the suspects → cross off → proof; self-claim hint; letter; board counts.
import './brief-auto.mjs';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 120) => new Promise(r => setTimeout(r, ms));
for (const [name, w, h] of [['iphone14', 390, 844], ['ipad', 820, 1180], ['land', 852, 393]]) {
  const p = await b.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  // the anonymous events (docs/EVENTS.md); the test server just drops them
  const evs = []; p.on('request', r => { if (r.url().endsWith('/api/e')) { try { evs.push(JSON.parse(r.postData())); } catch (e) {} } });
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
  // the events of this case: anonymous, in order, nothing from the ID card
  await wait(200);
  if (name === 'iphone14') console.log('   events:', evs.map(e => e.ev + (e.data.step ? ':' + e.data.step : '') + (e.data.kind ? ':' + e.data.kind : '') + (e.data.hint ? ':' + e.data.hint : '')).join(' '));
  const E = (ev) => evs.filter(e => e.ev === ev);
  const raw = JSON.stringify(evs);
  ok(evs.length && evs.every(e => e.game === 'solo' && /^[a-z0-9]{10}$/.test(e.sid) && e.sid === evs[0].sid) && !raw.includes('Luka') && !raw.includes('1234') && !raw.includes('🐶') && !/"(player|session|child|age|name)"/.test(raw), `${name}: events: one random sitting number, no name, card, player or session`);
  ok(E('file').length === 1 && E('file')[0].data.file === 'bip', `${name}: events: the season opened`);
  ok(E('start').length === 1 && E('start')[0].data.case === 'b2' && E('start')[0].data.first === true && E('start')[0].data.file === 'bip', `${name}: events: start of b2, first time`);
  ok(E('step').map(e => e.data.step).join() === 'call,ask,solve' && E('step').every(e => e.data.case === 'b2' && Number.isInteger(e.sec)), `${name}: events: steps call → ask → solve, with seconds`);
  ok(E('wrong').length === 1 && E('wrong')[0].data.step === 'solve' && E('hint').some(e => e.data.step === 'solve'), `${name}: events: Robi's own claim is a wrong pick on solve, and its hint`);
  ok(E('solved').length === 1 && E('solved')[0].data.first === true && E('solved')[0].data.hints >= 1 && E('verdict').length === 1, `${name}: events: solved (first time, with its hints) and the game's verdict`);
  ok(!E('left').length && !E('stuck').length, `${name}: events: no »left« or »stuck«`);
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
// »stuck« after 90 s on a step with no action (once per step), »left« when a case is left for the board
// and another one is picked, and when the page is left in the middle of a case
{
  const p = await b.newPage();
  const evs = []; p.on('request', r => { if (r.url().endsWith('/api/e')) { try { evs.push(JSON.parse(r.postData())); } catch (e) {} } });
  await p.evaluateOnNewDocument(() => { if (window.speechSynthesis) speechSynthesis.getVoices = () => []; });
  await p.setViewport({ width: 390, height: 844, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8765/solo/?play');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('dp_save_version', '3'); localStorage.setItem('dp_tutorial_done', 'true');
    localStorage.setItem('dp_played_v1', JSON.stringify(['bip:1']));
    localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏻', g: 'm', sk: '🐶', name: 'Luka', id: '1234' })); });
  await p.reload(); await wait(400);
  await p.click('.file-card[data-file="bip"]'); await wait();
  await p.click('.folder[data-no="2"]'); await wait();
  await p.click('[data-act="answer"]'); await wait();
  await p.click('[data-act="toScene"]'); await wait();
  await p.evaluate(() => { EV.idle = 80000; }); await wait(6000);
  ok(!evs.some(e => e.ev === 'stuck'), 'events: no »stuck« before 90 s');
  await p.evaluate(() => { EV.idle = 89000; }); await wait(6000);
  const st = evs.filter(e => e.ev === 'stuck');
  ok(st.length === 1 && st[0].data.step === 'ask' && st[0].data.case === 'b2', '»stuck« on the questioning step of b2 after 90 s with no action');
  await p.evaluate(() => { EV.idle = 200000; }); await wait(6000);
  ok(evs.filter(e => e.ev === 'stuck').length === 1, 'only one »stuck« for the same step');
  await p.evaluate(() => toBoard()); await wait();
  await p.click('.folder[data-no="1"]'); await wait();
  const left = evs.filter(e => e.ev === 'left'), b1 = evs.find(e => e.ev === 'start' && e.data.case === 'b1');
  ok(left.length === 1 && left[0].data.case === 'b2' && left[0].data.step === 'ask' && b1 && evs.indexOf(b1) > evs.indexOf(left[0]) && b1.data.first === false,
    '»left« for b2 (on the questioning step) when case 1 is picked instead; b1 is a replay');
  await p.click('[data-act="answer"]').catch(() => {}); await wait();
  // (puppeteer can't see a beacon sent during navigation, so the page's own »pagehide« is fired here)
  await p.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide'))); await wait(300);
  ok(evs.filter(e => e.ev === 'left').length === 2 && evs.filter(e => e.ev === 'left')[1].data.case === 'b1', '»left« for b1 when the page is left mid-case');
  await p.close();
}
await b.close();
