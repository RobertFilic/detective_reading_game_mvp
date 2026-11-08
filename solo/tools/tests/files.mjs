import './brief-auto.mjs';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 300) => new Promise(r => setTimeout(r, ms));
const p = await b.newPage();
const errors = []; p.on('pageerror', e => errors.push(e.message));
await p.evaluateOnNewDocument(() => { if (window.speechSynthesis) speechSynthesis.getVoices = () => []; });
await p.setViewport({ width: 393, height: 852, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
await p.goto('http://localhost:8765/solo/?play'); await p.evaluate(() => localStorage.clear()); await p.reload(); await wait();
const st = () => p.evaluate(() => S.screen);
const text = () => p.evaluate(() => document.body.innerText);

// ---- ID card
ok(await st() === 'make' && (await text()).includes('Postani detektiv'), 'first launch: make your detective');
await p.screenshot({ path: 'shots/f1-make.png' });
await p.click('[data-act="mkAvatar"][data-i="4"]'); await wait(150);
ok((await text()).includes('Izberi pomočnika'), 'avatar → sidekick');
await p.click('[data-act="mkSidekick"][data-e="🐶"]'); await wait(150);
await p.type('#mkName', '<b>ana!!</b>');
await p.screenshot({ path: 'shots/f2-name.png' });
await p.click('[data-act="mkName"]'); await wait(150);
ok((await text()).includes('Detektivka Banab') && !(await p.$('.idcard b b')), 'name is cleaned (letters only) and shown safely');
await p.click('[data-act="mkBack"]'); await wait(100);
await p.evaluate(() => { document.getElementById('mkName').value = ''; });
await p.type('#mkName', 'ana');
await p.keyboard.press('Enter'); await wait(150);
ok((await text()).includes('Detektivka Ana') && (await text()).includes('Pomočnik: 🐶'), 'card: "Detektivka Ana", sidekick, Enter works');
await p.screenshot({ path: 'shots/f3-card.png' });
await p.click('[data-act="mkDone"]'); await wait();
ok(await st() === 'intro' && (await text()).includes('Vaja'), 'then the practice case');
ok(!(await p.evaluate(() => JSON.stringify(LOG))).includes('Ana'), 'the name is never written to the log');

// ---- practice (quick), gendered praise
await p.click('[data-act="toStory"]'); await p.click('[data-coach="ok"]'); await p.click('[data-act="know"]'); await wait(150);
await p.click('[data-act="pick"][data-id="bine"]'); await wait(150);
await p.click('[data-sid="s3"]'); await p.click('[data-act="confirm"]'); await wait(200);
ok((await p.$eval('.coach .say', el => el.textContent)).includes('Bravo, detektivka!'), 'practice praise uses "detektivka"');
ok((await text()).includes('Bravo, Detektivka Ana!'), 'reveal shows "Bravo, Detektivka Ana!"');
await p.click('[data-act="next"]'); await wait();
ok(await st() === 'files' && (await p.$$('.file-card:not(.teaser)')).length === 5, 'file picker with 5 adventures');
ok((await p.$eval('.coach .say', el => el.textContent)).includes('izberi pustolovščino'), 'coach: "Zdaj izberi pustolovščino…"');
await p.screenshot({ path: 'shots/f4-files.png' });
await p.click('[data-coach="ok"]');

// ---- solve a whole themed file
async function solveFile(file, n) {
  await p.click(`.file-card[data-file="${file}"]`); await wait(200);
  ok(await st() === 'board' && (await p.$$('.folder')).length === n, `${file}: board with ${n} cases`);
  const finalNo = await p.evaluate(() => (casesIn(S.file).find(c => c.final) || {}).no);
  if (finalNo) {
    ok(await p.$(`.folder.locked[data-no="${finalNo}"]`), `${file}: final case ${finalNo} starts locked 🔒`);
    await p.click(`.folder[data-no="${finalNo}"]`); await wait(150);
    ok(await st() === 'board' && (await text()).includes('Veliki primer se odpre'), `${file}: tapping it explains, doesn't open`);
    if (file === 'vesolje') await p.screenshot({ path: 'shots/f5-board-locked.png' });
  }
  for (let no = 1; no <= n; no++) {
    await p.click(`.folder[data-no="${no}"]`); await wait(150);
    const c = await p.evaluate(() => ({ id: S.c.id, culprit: S.c.culprit, evs: S.c.sentences.filter(x => x.role === 'evidence').map(x => x.id) }));
    await p.click('[data-act="toStory"]'); await p.click('[data-act="know"]');
    await p.click(`[data-act="pick"][data-id="${c.culprit}"]`); for (const ev of c.evs) await p.click(`[data-sid="${ev}"]`); await p.click('[data-act="confirm"]'); await wait(150);
    if (await st() !== 'reveal') { ok(false, `${c.id} not solvable`); return; }
    if (file === 'vesolje' && no === 2) await p.screenshot({ path: 'shots/f6-reveal-space.png' });
    await p.click('[data-act="next"]'); await wait(150);
    if (finalNo && no === finalNo - 1) ok(!(await p.$(`.folder.locked[data-no="${finalNo}"]`)), `${file}: final case unlocks after the others`);
  }
  ok((await text()).includes('Pustolovščina rešena') && (await p.$$('.folder.solved')).length === n, `${file}: all ${n} solved → "Pustolovščina rešena!"`);
  if (file === 'vesolje') await p.screenshot({ path: 'shots/f7-file-done.png' });
  await p.click('[data-act="toFiles"]'); await wait(150);
}
await solveFile('vesolje', 6);
ok(await p.$('.stamp-slot.got'), 'ID card gets the 🚀 stamp');
await solveFile('kmetija', 6);
ok((await text()).includes('12 rešenih primerov'), 'card counts "12 rešenih primerov"');
ok(!(await p.$('.file-card[data-file="gozd"]')), 'the old forest stories are gone');
await p.screenshot({ path: 'shots/f8-files-after.png' });

// ---- edit the card: skip the name → "Detektivka" only
await p.click('[data-act="editCard"]'); await wait(150);
await p.click('[data-act="mkAvatar"][data-i="1"]'); await p.click('[data-act="mkSidekick"][data-e="🦉"]'); await p.click('[data-act="mkSkip"]'); await wait(150);
await p.click('[data-act="mkDone"]'); await wait(150);
ok(await st() === 'files' && (await text()).includes('Detektiv\n') || (await p.$eval('.idcard b', el => el.textContent)) === 'Detektiv', 'edited card: boy avatar, no name → "Detektiv"');
ok((await p.$$('.stamp-slot.got')).length === 2, 'progress kept after editing the card');

ok(!errors.length, 'no page errors ' + errors.join('|'));

// ---- adult: new child clears card, ticks and practice
const a = await b.newPage(); a.on('dialog', d => d.accept());
await a.goto('http://localhost:8765/solo/'); await wait(500);
await a.click('[data-act="age"][data-age="6-7"]'); await wait(100);
await a.click('[data-act="resetBoard"]'); await wait(100);
const left = await a.evaluate(() => [localStorage.getItem('dp_profile_v1'), localStorage.getItem('dp_played_v1'), localStorage.getItem('dp_tutorial_done')]);
ok(left[0] === 'null' && left[1] === '[]' && left[2] === 'false', 'adult "Nov otrok" clears the ID card, ticks and practice');
await b.close();
