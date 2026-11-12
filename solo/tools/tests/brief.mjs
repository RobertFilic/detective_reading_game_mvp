// »Najprej navodilo« in Galeb 1 and 2: the instruction card blocks the step until »Razumem«, the bar on top
// opens it again, a message card waits for »V redu«, the truth after UGOVOR comes on its own card; logged.
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 150) => new Promise(r => setTimeout(r, ms));
for (const [name, w, h] of [['iphone14', 390, 844], ['plus14', 428, 926], ['land', 852, 393]]) {
  const p = await b.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.evaluateOnNewDocument(() => { if (window.speechSynthesis) speechSynthesis.getVoices = () => []; window.NO_READ_WAIT = true; });   // a late voice list re-renders mid-tap
  await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8765/solo/?play');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('dp_save_version', '4'); localStorage.setItem('dp_tutorial_done', 'true');
    localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏻‍♂️', g: 'm', sk: '🐶', name: 'Klai', id: '9745' })); });
  await p.reload(); await wait(400);
  const click = async (sel, ms) => { await p.click(sel); await wait(ms); };
  const card = () => p.evaluate(() => { const c = document.querySelector('.brief'); if (!c) return null;
    const btn = c.querySelector('.ui-btn, .btn.big').getBoundingClientRect(); return { text: c.innerText, fits: btn.bottom <= innerHeight && btn.top >= 0 }; });
  // a tap in the middle of the screen while a card is open
  const tapBehind = async (sel) => { const r = await p.$eval(sel, e => { const x = e.getBoundingClientRect(); return [x.left + x.width / 2, x.top + x.height / 2]; }); await p.mouse.click(r[0], r[1]); await wait(); };
  await click('.file-card[data-file="galeb"]'); await click('.folder[data-no="1"]'); await click('[data-act="answer"]');
  ok(!(await card()), `${name}: the call has no card`);
  await click('[data-act="toScene"]');
  let c = await card();
  ok(c && c.text.includes('Na kraju dogodka') && c.text.includes('Tapni vsako stvar'), `${name}: the scene opens with its instruction card`);
  ok(c && c.fits, `${name}: »Razumem« is on screen`);
  await p.screenshot({ path: `shots/brief-${name}-scene.png` });
  await tapBehind('.obj');
  ok(await p.evaluate(() => S.run.found.length === 0), `${name}: a tap behind the card does nothing`);
  await click('[data-act="briefOk"]');
  ok(!(await card()), `${name}: »Razumem« closes it`);
  await click('.qbar .bq');
  ok((await card() || {}).text?.includes('Na kraju dogodka'), `${name}: the instruction on top opens it again`);
  await click('[data-act="briefOk"]');
  for (const sid of await p.$$eval('.obj', els => els.map(e => e.dataset.sid))) await click(`.obj[data-sid="${sid}"]`, 60);
  const done = await p.evaluate(() => { const n = document.querySelector('#note.good'); return n && n.innerText; });
  ok(done && done.includes('Vse je preiskano'), `${name}: »Vse je preiskano« comes as a card`);
  await click('[data-act="noteOk"]');
  await click('[data-act="toSolve"]');
  c = await card();
  ok(c && c.text.includes('Je vse res?') && c.text.includes('Je to res?'), `${name}: UGOVOR opens with its card`);
  await p.screenshot({ path: `shots/brief-${name}-lie.png` });
  await click('[data-act="briefOk"]');
  // a wrong try: the message comes on a card at the bottom and waits
  const L = await p.evaluate(() => S.c.lie);
  const wrong = await p.evaluate(() => { const L = S.c.lie, bad = new Set([...L.breaks.flat(), ...(L.hmm || []).map(m => m[1]), ...L.claims, L.truth]);
    return S.c.sentences.find(s => !bad.has(s.id)).id; });
  await click(`.claim[data-sid="${L.claim}"]`); await click(`.liestep .row[data-sid="${wrong}"]`, 500);
  const note = await p.evaluate(() => { const n = document.querySelector('#note'); return n && n.innerText; });
  ok(note && note.includes('Oba sta lahko res'), `${name}: the wrong try's message is a card ${note}`);
  await p.screenshot({ path: `shots/brief-${name}-note.png` });
  await p.mouse.click(10, h / 2); await wait();
  ok(await p.$('#note.nudge'), `${name}: a tap beside the message wiggles it, it stays`);
  await click('[data-act="noteOk"]');
  ok(!(await p.$('#note')), `${name}: »V redu« closes the message`);
  await click(`.claim[data-sid="${L.claim}"]`);
  for (const sid of L.breaks[0]) await click(`.liestep .row[data-sid="${sid}"]`);
  if (await p.$('.btn.ugovor')) await click('.btn.ugovor');
  await wait(1900);
  c = await card();
  ok(c && c.text.includes('Luka pove resnico') && c.text.includes('Ves čas sem gradil grad'), `${name}: the truth comes on its own card`);
  ok(c && c.fits, `${name}: the truth's »Razumem« is on screen`);
  await p.screenshot({ path: `shots/brief-${name}-truth.png` });
  ok(await p.evaluate(() => document.querySelector('[data-act="toScene"]').disabled), `${name}: »Vem, kdo je bil!« waits for the truth`);
  await click('[data-act="truthOk"]');
  ok(await p.evaluate(() => !document.querySelector('[data-act="toScene"]').disabled), `${name}: then it opens`);
  await click('[data-act="toScene"]');
  c = await card();
  ok(c && c.text.includes('Kdo je bil?') && c.text.includes('Prečrtaj'), `${name}: solve opens with its card`);
  await click('[data-act="briefOk"]');
  // the alibis: each used sentence is struck through; the last one left comes as a card
  const plan = await p.evaluate(() => { const c = S.c; return c.suspects.filter(x => x !== c.culprit).map(x => [c.sentences.find(s => s.clears === x).id, x]); });
  for (const [sid, who] of plan) {
    await p.evaluate(() => { const n = document.querySelector('[data-act="noteOk"]'); if (n) n.click(); });
    await click(`[data-act="pickClue"][data-sid="${sid}"]`, 60); await click(`.suspect[data-id="${who}"]`, 200);
  }
  ok(await p.$$eval('.row.used', els => els.length) === plan.length, `${name}: the ${plan.length} alibis used are struck through`);
  const last = await p.evaluate(() => { const n = document.querySelector('#note.good'); return n && n.innerText; });
  ok(last && last.includes('Ostal je samo eden'), `${name}: »Ostal je samo eden« comes as a card`);

  await p.screenshot({ path: `shots/brief-${name}-lastone.png` });
  await click('[data-act="noteOk"]');
  const proof = await p.evaluate(() => S.c.sentences.find(s => s.role === 'evidence').id);
  await click(`[data-act="pickClue"][data-sid="${proof}"]`, 60); await click('.suspect[data-id="luka"]', 400);
  ok(await p.evaluate(() => S.screen === 'reveal'), `${name}: solved`);
  await wait(2200);
  c = await card();
  ok(c && c.text.includes('Luka pravi') && c.text.includes('najdaljša'), `${name}: the excuse comes on its own card after the stamp`);
  ok(c && c.fits, `${name}: the excuse's »Razumem« is on screen`);
  await p.screenshot({ path: `shots/brief-${name}-excuse.png` });
  await click('[data-act="excuseOk"]');
  ok(!(await card()) && await p.$('[data-act="next"]'), `${name}: then the solved screen`);
  // a puzzle's card has the case's note first (g2: the coded note)
  await p.evaluate(() => { const r = S.run; S.c = caseFor('galeb', 2); S.run = newRun(); S.run.answered = true; go('cipher'); });
  await wait(300);
  c = await card();
  ok(c && c.text.includes('Skrivni listek') && c.text.includes(await p.evaluate(() => S.c.cipher.note)) && c.text.includes('Poglej ključ'), `${name}: the cipher card: the note, then how`);
  ok(c && c.fits, `${name}: the cipher card fits`);
  await p.screenshot({ path: `shots/brief-${name}-cipher.png` });
  const ev = await p.evaluate(() => JSON.parse(localStorage.getItem('dp_log_v1') || '[]').filter(e => /^brief_/.test(e.type)).map(e => e.type + ':' + e.step + (e.ms != null ? '' : '')));
  ok(ev.filter(e => e.startsWith('brief_ok')).length >= 5 && ev.includes('brief_ok:excuse') && ev.includes('brief_reopen:scene'), `${name}: logged ${ev.join(' ')}`);
  ok(!errors.length, `${name}: no page errors ${errors}`);
  await p.close();
}
await b.close();
