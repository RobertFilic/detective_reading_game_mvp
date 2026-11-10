// The real 🦕 Muzej season, played through like a child on the board: every step of m1–m6 by taps
// (witnesses, torn, the 4-wheel lock, geslo, timeline, UGOVOR, 🧭 with one wrong try each), the guess
// after 3, the second guess after 5, the final unlocked, the answer; layout checks on every screen.
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
    localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏽‍♀️', g: 'f', sk: '🐶', name: 'Ana', id: '1234' })); });
  await p.reload(); await wait(400);
  const text = () => p.evaluate(() => document.body.innerText);
  const st = () => p.evaluate(() => S.screen);
  const click = async (sel, ms) => { await p.click(sel); await wait(ms); };
  const hintOk = async () => { if (await p.$('#hint')) await click('[data-act="hintOk"]'); };
  const fits = async (label) => {
    const bad = await p.evaluate(() => { const W = document.documentElement.clientWidth, out = [];
      document.querySelectorAll('#app *').forEach(el => { if (el.closest('.pins')) return; const r = el.getBoundingClientRect(); if (r.width && (r.right > W + 1 || r.left < -1)) out.push(el.className || el.tagName); });
      const btn = [...document.querySelectorAll('.footer .btn.big, .screen > .btn.big')].pop();
      if (btn) { const r = btn.getBoundingClientRect(); if (r.bottom > innerHeight + 1) out.push('main button below the screen'); }
      return [...new Set(out)].slice(0, 5); });
    if (bad.length) ok(false, `${name} ${label}: ${JSON.stringify(bad)}`);
    await p.screenshot({ path: `shots/m-${name}-${label}.png` });
  };
  const next = '[data-act="toScene"], [data-act="toSolve"]';

  ok(await p.$('.file-card[data-file="muzej"].season') && !(await p.$('.file-card.teaser[aria-label^="Duh v muzeju"]')), `${name}: the museum is an adventure, not a teaser`);
  await click('.file-card[data-file="muzej"]');
  ok(await p.$('.folder.locked[data-no="6"]') && (await p.$$('.folder')).length === 6, `${name}: Muzej board, 6 cases, the final locked`);
  for (let no = 1; no <= 6; no++) {
    const id = 'm' + no;
    await click(`.folder[data-no="${no}"]`);
    await click('[data-act="answer"]');
    await fits(`${id}-call`);
    await click(next);
    const steps = await p.evaluate(() => S.c.steps);
    for (const step of steps.slice(1, -1)) {
      ok(await st() === step, `${name} ${id}: step ${step}`);
      await fits(`${id}-${step}`);
      if (step === 'scene') {
        if (await p.$('.obj.dark')) await click('[data-act="torch"]', 50);
        for (const sid of await p.$$eval('.obj', els => els.map(e => e.dataset.sid))) await click(`.obj[data-sid="${sid}"]`, 60);
      } else if (step === 'ask') {
        const ids = await p.evaluate(() => [...S.c.suspects, ...(S.c.witnesses || [])]);
        for (const s of ids) { await click(`.suspect[data-id="${s}"]`); while (await p.$('.qbtn')) { await click('.qbtn', 1000); } }
      } else if (step === 'cipher') {
        for (let i = 0; i < 25 && !(await p.evaluate(() => cipherCells(S.c.cipher).flat().every(x => !x.e || S.run.cgot.includes(x.ch)))); i++) {
          const ch = await p.evaluate(() => cipherCells(S.c.cipher).flat()[S.run.cring].ch);
          await click(`.ctile[data-l="${ch}"]`, 60);
        }
        ok(await p.evaluate(() => S.run.found.includes(S.c.cipher.gives)), `${name} ${id}: the coded note decoded into the pocket`);
      } else if (step === 'torn') {
        const n = await p.evaluate(() => S.c.torn.parts.length);
        for (let i = 0; i < n; i++) await click(`.strip[data-k="${i}"]`, 50);
        await click('[data-act="checkOrder"]');
        ok(await p.evaluate(() => S.run.ordered && S.run.found.includes(S.c.torn.gives)), `${name} ${id}: the torn note whole, into the pocket`);
      } else if (step === 'words') {
        for (const word of await p.evaluate(() => S.c.words.find.map(f => f[1]))) {
          const [a, z] = await p.evaluate((wd) => { const sp = wordSpots(S.c.words)[wd]; return [sp.cells[0], sp.cells[sp.cells.length - 1]]; }, word);
          await click(`.wcell[data-i="${a}"]`, 50); await click(`.wcell[data-i="${z}"]`, 50);
        }
        await wait(2500);
        ok(await p.$('.geslo') && await p.evaluate(() => !S.c.words.geslo || S.run.found.includes(S.c.words.geslo)), `${name} ${id}: geslo spelled, into the pocket`);
        await fits(`${id}-geslo`);
      } else if (step === 'lock') {
        const code = await p.evaluate(() => S.c.lock.code);
        for (let i = 0; i < code.length; i++) for (let n = 0; n < Number(code[i]); n++) await click(`.wbtn[data-i="${i}"][data-d="1"]`, 20);
        await fits(`${id}-lock-set`);
        await click('[data-act="tryLock"]', 300);
        ok(await p.evaluate(() => S.run.open), `${name} ${id}: the lock opens with ${code}`);
      } else if (step === 'order') {
        const n = await p.evaluate(() => S.c.order.cards.length);
        for (let k = 0; k < n; k++) await click(`.tcard[data-k="${k}"]`, 50);
        await fits(`${id}-order-full`);
        await click('[data-act="checkOrder"]', 400);
        ok(await p.evaluate(() => S.run.ordered), `${name} ${id}: the timeline in order`);
      } else if (step === 'herring') {
        const H = await p.evaluate(() => S.c.herring);
        const wrongClues = Object.keys(H.explains);
        const bad = await p.evaluate(() => { const H = S.c.herring, no = new Set([...H.clues, ...Object.values(H.explains).flat(2), ...(H.hmm || []).map(m => m[1])]);
          return S.c.sentences.find(s => !no.has(s.id)).id; });
        await click(`.hclue[data-sid="${wrongClues[0]}"]`);
        await click(`.herringstep .row[data-sid="${bad}"]`);
        ok(await p.evaluate(() => S.run.hwrong === 1), `${name} ${id}: a wrong 🧭 try is counted`);
        await p.evaluate(() => { S.run.note = null; render(); });
        for (const cl of wrongClues) {
          await click(`.hclue[data-sid="${cl}"]`);
          for (const sid of H.explains[cl][0]) await click(`.herringstep .row[data-sid="${sid}"]`, 80);
        }
        const trueClue = H.clues.find(x => !wrongClues.includes(x));
        if (trueClue) ok(await p.$(`.hclue[data-sid="${trueClue}"]:not(.flipped)`), `${name} ${id}: the true clue stays`);
        await wait(1300);
        ok(await p.evaluate(() => Object.keys(S.c.herring.explains).every(x => S.run.hdone.includes(x))) && await p.$('.hstamp'), `${name} ${id}: every misleading clue flipped, NAPAČNA SLED!`);
        await fits(`${id}-herring-done`);
        await p.evaluate(() => { S.run.note = null; render(); });
      } else if (step === 'lie') {
        const L = await p.evaluate(() => S.c.lie);
        // a wrong try first: the right claim with a sentence that doesn't break it (not a hmm, not half a pair)
        const wrong = await p.evaluate(() => { const L = S.c.lie, bad = new Set([...L.breaks.flat(), ...(L.hmm || []).map(m => m[1]), ...L.claims, L.truth]);
          return S.c.sentences.find(s => !bad.has(s.id)).id; });
        await click(`.claim[data-sid="${L.claim}"]`);
        await click(`.liestep .row[data-sid="${wrong}"]`);
        ok(await p.evaluate(() => S.run.lwrong === 1), `${name} ${id}: a wrong UGOVOR try is counted`);
        await click(`.claim[data-sid="${L.claim}"]`);
        for (const sid of L.breaks[0]) await click(`.liestep .row[data-sid="${sid}"]`);
        if (await p.$('.btn.ugovor')) { ok(no === 3, `${name} ${id}: the shout comes the first time (case 3)`); await fits(`${id}-shout`); await click('.btn.ugovor'); }
        await wait(1900);
        ok(await p.evaluate(() => S.run.lphase === 'done' && S.run.found.includes(S.c.lie.truth)), `${name} ${id}: caught, the truth in the pocket`);
        await fits(`${id}-lie-done`);
      }
      await click(next);
    }
    ok(await st() === 'solve', `${name} ${id}: solve`);
    await fits(`${id}-solve`);
    const plan = await p.evaluate(() => { const c = S.c;
      return [...c.suspects.filter(x => x !== c.culprit).map(x => [c.sentences.find(s => s.clears === x).id, x]),
        ...c.sentences.filter(s => s.role === 'evidence').map(s => [s.id, c.culprit])]; });
    for (const [sid, who] of plan) { await click(`[data-act="pickClue"][data-sid="${sid}"]`, 60); await click(`.suspect[data-id="${who}"]`, 150); await hintOk(); }
    await wait(400);
    ok(await st() === 'reveal', `${name} ${id}: solved`);
    await wait(1800);
    await fits(`${id}-reveal`);
    await click('[data-act="next"]', 300);
    if (await p.$('.pin-wrap')) await click('.pin-wrap [data-act="next"]', 300);   // the new corkboard card, alone
    if (await p.$('.letter-wrap')) await click('.letter [data-act="letterOk"]');
    if (no === 3) {
      ok((await text()).includes('Kaj misliš, kdo ponoči premika Rexa?'), `${name}: the guess after case 3`);
      await fits('guess');
      await click('[data-act="ventGuess"][data-id="rado"]');
    }
    if (no === 5) {
      ok((await text()).includes('Ali še vedno tako misliš?'), `${name}: asks again after case 5`);
      await fits('guess-again');
      await click('[data-act="guessChange"]'); await click('[data-act="ventGuess"][data-id="mila"]');
    }
    ok(await st() === 'board', `${name} ${id}: back on the board`);
  }
  ok((name === 'land' || (await text()).includes('Spremenila si mnenje in imela prav')) && (await text()).includes('Pustolovščina rešena'), `${name}: the season is solved, the changed guess was right`);
  await fits('board-done');
  ok(!errors.length, `${name}: no page errors ${errors.join(' | ')}`);
  await p.close();
}
await b.close();
