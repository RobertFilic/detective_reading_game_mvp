// »Kje je kdo?« (kje-je-kdo/) on iPhone 14, iPad and a landscape phone: the start page's tile opens it,
// only puzzle 1 is open at first, puzzle 1 is played by taps (wrong taps get a gentle sentence, undo,
// crosses), puzzle 2 with the help button, which lights cells but never places anyone; the question, the
// reward with its »Zakaj?«, and the ✓ that stays on the list. Then all 12 puzzles on the phone.
// No sideways scroll, targets ≥ 48 px. Texts come from the page's own LEVELS, so wording can change.
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 350) => new Promise(r => setTimeout(r, ms));

for (const [dev, w, h] of [['iphone14', 390, 844], ['ipad', 820, 1180], ['land', 844, 390]]) {
  const p = await b.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: dev !== 'ipad', deviceScaleFactor: 2 });
  const tap = async (sel) => { await p.$eval(sel, e => e.scrollIntoView({ block: 'center' })); await p.tap(sel); await wait(); };
  const cell = (r, c) => `.cell[data-r="${r}"][data-c="${c}"]`;
  const said = () => p.$eval('#say', e => e.textContent);
  const wide = () => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  const tokens = () => p.$$eval('.cell .tok', els => els.length);

  await p.goto('http://localhost:8765/'); await wait();
  ok(await p.$eval('#kjekdo', e => e.textContent.includes('Kje je kdo?') && e.getAttribute('href') === 'kje-je-kdo/'), `${dev}: the start page has the »Kje je kdo?« tile`);
  await p.evaluate(() => localStorage.removeItem('kjekdo_solved'));
  await Promise.all([p.waitForNavigation(), p.$eval('#kjekdo', e => e.click())]); await wait();
  const LV = await p.evaluate(() => LEVELS);
  ok(p.url().endsWith('/kje-je-kdo/') && await p.$$eval('.lvl', els => els.length) === 12 && await p.$$eval('h2.group', els => els.length) === 3, `${dev}: the tile opens the list: 12 puzzles in 3 groups`);
  ok(await p.$$eval('.lvl.locked', els => els.length) === 11, `${dev}: only puzzle 1 is open at first`);
  await tap('.lvl[data-level="3"]');
  ok(!(await p.$eval('#list', e => e.hidden)), `${dev}: a locked puzzle doesn't open`);
  ok(await wide(), `${dev}: the list has no sideways scroll`);

  // puzzle 1: the story and the rules, then taps
  const L1 = LV[0];
  await tap('.lvl[data-level="1"]');
  ok(await p.$eval('#sheet', (e, story) => !e.hidden && e.textContent.includes(story) && e.textContent.includes('vrsti') && e.textContent.includes('stolpcu'), L1.story), `${dev}: puzzle 1 opens with the story and the rules`);
  if (process.env.SHOTS) await p.screenshot({ path: `shots/kjekdo-${dev}-rules1.png` });
  await tap('#go');
  ok(await p.$$eval('.cell', els => els.length === 16 && els.every(e => e.getBoundingClientRect().width >= 48)), `${dev}: 16 cells, each ≥ 48 px`);
  ok(await p.evaluate(() => { const r = document.getElementById('board').getBoundingClientRect(); return r.right <= innerWidth && r.left >= 0; }), `${dev}: the board fits the width`);
  ok(await p.$$eval('.clue', els => els.length === 4 && els.every(e => e.getBoundingClientRect().height >= 48)), `${dev}: 4 sentences, each a ≥ 48 px target`);
  ok(await tokens() === 0, `${dev}: nobody stands on the board at the start`);
  await tap('.clue[data-p="ana"]'); await tap(cell(1, 0));
  ok((await said()).includes('torta') && await tokens() === 0, `${dev}: a tap on the cake says nobody can stand there`);
  await tap(cell(0, 1));
  ok(await tokens() === 0 && await p.$eval('.clue[data-p="ana"]', e => e.classList.contains('glow')), `${dev}: a wrong cell places nobody, Ana's sentence glows`);
  await tap(cell(1, 3));
  ok(await p.$eval(cell(1, 3), e => e.textContent.includes('Ana')) && await p.$eval('.clue[data-p="ana"]', e => e.classList.contains('placed')), `${dev}: Ana goes on the sofa, her sentence gets ✓`);
  ok(await p.$eval(cell(1, 1), e => !!e.querySelector('.x')), `${dev}: Ana's row is crossed out by itself`);
  await tap('#undoBtn');
  ok(await tokens() === 0, `${dev}: undo takes Ana back`);
  await tap('.clue[data-p="ana"]'); await tap(cell(1, 3));
  await tap('.clue[data-p="bor"]'); await tap(cell(1, 1));
  ok((await said()).includes('Ana') && await tokens() === 1, `${dev}: a second person in a row is explained, not placed`);
  if (process.env.SHOTS) { await p.evaluate(() => scrollTo(0, 0)); await p.screenshot({ path: `shots/kjekdo-${dev}-play1.png`, fullPage: true }); }
  await tap('#crossBtn'); await tap(cell(3, 3));
  ok(await p.$eval(`${cell(3, 3)} .x`, e => e.classList.contains('mine')), `${dev}: the cross tool marks a cell`);
  await tap(cell(3, 3)); await tap('#crossBtn');
  for (const [id, r, c] of [['cvetka', 2, 2], ['bor', 3, 1], ['dan', 0, 0]]) { await tap(`.clue[data-p="${id}"]`); await tap(cell(r, c)); }
  ok(await tokens() === 4 && await p.$eval('#who', e => !e.hidden), `${dev}: all 4 placed by the child, the question appears`);
  await tap('#whoFaces [data-p="ana"]');
  ok(await p.$$eval('.cell.room-hl', els => els.length) === 4, `${dev}: a wrong name lights up the kitchen`);
  await tap('#whoFaces [data-p="dan"]');
  ok(await p.$eval('#sheet', (e, l) => !e.hidden && e.textContent.includes('Primer rešen!') && e.textContent.includes(l.win) && e.textContent.includes(l.heart), L1), `${dev}: Dan → »Primer rešen!« with the reason why`);
  ok(await p.evaluate(() => localStorage.getItem('kjekdo_solved')) === '[1]', `${dev}: puzzle 1 is remembered`);

  // puzzle 2: the help lights cells, the child taps
  const L2 = LV[1];
  await tap('#next'); await tap('#go');
  for (let i = 0; i < 3; i++) await tap('#hintBtn');
  ok(await tokens() === 0 && await p.$$eval('.cell.can', els => els.length) === 1, `${dev}: three helps light one cell and place nobody`);
  for (let k = 0; k < L2.people.length; k++) {
    for (let i = 0; i < 3; i++) await tap('#hintBtn');
    await tap('.cell.can');
  }
  ok(await tokens() === L2.people.length && await p.$eval('#who', e => !e.hidden), `${dev}: with help, the child places everyone in puzzle 2`);
  await tap(`#whoFaces [data-p="${L2.culprit}"]`);
  ok(await p.$eval('#sheet', (e, l) => e.textContent.includes(l.win), L2), `${dev}: puzzle 2 is solved`);
  if (process.env.SHOTS) await p.screenshot({ path: `shots/kjekdo-${dev}-win.png` });
  await tap('#toList');
  ok(await p.$$eval('.lvl .done', els => els.length) === 2 && await p.$$eval('.lvl.locked', els => els.length) === 9, `${dev}: 2 ✓ on the list, puzzle 3 is open now`);
  ok(await wide(), `${dev}: no sideways scroll`);
  if (process.env.SHOTS) await p.screenshot({ path: `shots/kjekdo-${dev}.png`, fullPage: true });
  ok(!errors.length, `${dev}: no page errors ${errors.join('|')}`);
  await p.close();
}

// every puzzle on the phone: each person by their sentence and their cell, then the culprit
{
  const p = await b.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.setViewport({ width: 390, height: 844, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8765/kje-je-kdo/'); await wait();
  const LV = await p.evaluate(() => LEVELS);
  for (const L of LV) {
    await p.goto(`http://localhost:8765/kje-je-kdo/?uganka=${L.id}`); await wait();
    await p.$eval('#go', e => e.click()); await wait(200);
    const n = L.rooms.length;
    const small = await p.$$eval('.cell', els => els.filter(e => e.getBoundingClientRect().width < 48).length);
    for (const q of L.people) {
      await p.$eval(`.clue[data-p="${q.id}"]`, e => e.click()); await wait(60);
      await p.$eval(`.cell[data-r="${q.at[0]}"][data-c="${q.at[1]}"]`, e => e.click()); await wait(60);
    }
    const placed = await p.$$eval('.cell .tok', els => els.length);
    await p.$eval(`#whoFaces [data-p="${L.culprit}"]`, e => e.click()); await wait(300);
    const win = await p.$eval('#sheet', (e, l) => !e.hidden && e.textContent.includes(l.win) && e.textContent.includes(l.heart), L);
    const wide = await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    if (process.env.SHOTS) { await p.$eval('#sheet', e => e.hidden = true); await p.evaluate(() => scrollTo(0, 0)); await p.screenshot({ path: `shots/kjekdo-all-${L.id}.png`, fullPage: true }); }
    ok(placed === n && win && !small && wide, `puzzle ${L.id} »${L.title}«: ${n} placed, the culprit found, the reason shown, cells ≥ 48 px, no sideways scroll`);
  }
  ok(!errors.length, `all puzzles: no page errors ${errors.join('|')}`);
  await p.close();
}
await b.close();
