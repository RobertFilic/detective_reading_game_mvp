// »Kje je kdo?« (kje-je-kdo/) on iPhone 14, iPad and a landscape phone: the start page's tile opens it,
// puzzle 1 is played by taps (wrong taps get a gentle sentence, undo, crosses), puzzle 2 by the help button
// alone; the question, the reward, and the ✓ that stays on the list. No sideways scroll, targets ≥ 48 px.
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

  await p.goto('http://localhost:8765/'); await wait();
  ok(await p.$eval('#kjekdo', e => e.textContent.includes('Kje je kdo?') && e.getAttribute('href') === 'kje-je-kdo/'), `${dev}: the start page has the »Kje je kdo?« tile`);
  await p.evaluate(() => localStorage.removeItem('kjekdo_solved'));
  await Promise.all([p.waitForNavigation(), p.$eval('#kjekdo', e => e.click())]); await wait();
  ok(p.url().endsWith('/kje-je-kdo/') && await p.$$eval('.lvl', els => els.length) === 2, `${dev}: the tile opens the list with 2 puzzles`);
  ok(await wide(), `${dev}: the list has no sideways scroll`);

  // puzzle 1: the rules, then taps
  await tap('.lvl[data-level="1"]');
  ok(await p.$eval('#sheet', e => !e.hidden && e.textContent.includes('vrsti') && e.textContent.includes('stolpcu') && e.textContent.includes('torta')), `${dev}: puzzle 1 opens with the story and the rules`);
  if (process.env.SHOTS) await p.screenshot({ path: `shots/kjekdo-${dev}-rules1.png` });
  await tap('#go');
  ok(await p.$$eval('.cell', els => els.length === 16 && els.every(e => e.getBoundingClientRect().width >= 48)), `${dev}: 16 cells, each ≥ 48 px`);
  ok(await p.evaluate(() => { const r = document.getElementById('board').getBoundingClientRect(); return r.right <= innerWidth && r.left >= 0; }), `${dev}: the board fits the width`);
  ok(await p.$$eval('.clue', els => els.length === 4 && els.every(e => e.getBoundingClientRect().height >= 48)), `${dev}: 4 sentences, each a ≥ 48 px target`);
  await tap('.clue[data-p="ana"]'); await tap(cell(1, 0));
  ok((await said()).includes('torta'), `${dev}: a tap on the cake says nobody can stand there`);
  await tap(cell(0, 1));
  ok((await said()).includes('Preberi še enkrat') && !(await p.$(`${cell(0, 1)} .tok`)), `${dev}: a wrong cell asks to read the sentence again and places nobody`);
  await tap(cell(1, 3));
  ok(await p.$eval(cell(1, 3), e => e.textContent.includes('Ana')) && await p.$eval('.clue[data-p="ana"]', e => e.classList.contains('placed')), `${dev}: Ana goes on the sofa, her sentence gets ✓`);
  ok(await p.$eval(cell(1, 1), e => !!e.querySelector('.x')), `${dev}: Ana's row is crossed out by itself`);
  await tap('#undoBtn');
  ok(!(await p.$(`${cell(1, 3)} .tok`)), `${dev}: undo takes Ana back`);
  await tap('.clue[data-p="ana"]'); await tap(cell(1, 3));
  await tap('.clue[data-p="bor"]'); await tap(cell(1, 1));
  if (process.env.SHOTS) { await p.evaluate(() => scrollTo(0, 0)); await p.screenshot({ path: `shots/kjekdo-${dev}-play1.png`, fullPage: true }); }
  ok((await said()).includes('V tej vrsti že stoji Ana'), `${dev}: a second person in a row is explained`);
  await tap('#crossBtn'); await tap(cell(3, 3));
  ok(await p.$eval(`${cell(3, 3)} .x`, e => e.classList.contains('mine')), `${dev}: the cross tool marks a cell`);
  await tap(cell(3, 3)); await tap('#crossBtn');
  for (const [id, r, c] of [['cvetka', 2, 2], ['bor', 3, 1], ['dan', 0, 0]]) { await tap(`.clue[data-p="${id}"]`); await tap(cell(r, c)); }
  ok(await p.$$eval('.cell .tok', els => els.length) === 4 && await p.$eval('#who', e => !e.hidden), `${dev}: all 4 placed, the question appears`);
  await tap('#whoFaces [data-p="ana"]');
  ok(await p.$$eval('.cell.room-hl', els => els.length) === 4 && (await said()).includes('kuhinja'), `${dev}: a wrong name lights up the kitchen`);
  await tap('#whoFaces [data-p="dan"]');
  ok(await p.$eval('#sheet', e => !e.hidden && e.textContent.includes('Primer rešen!') && e.textContent.includes('Dan je načel torto!')), `${dev}: Dan → »Primer rešen!«`);
  ok(await p.evaluate(() => localStorage.getItem('kjekdo_solved')) === '[1]', `${dev}: puzzle 1 is remembered`);

  // puzzle 2: only the help button, three taps per person
  await tap('#next');
  ok(await p.$eval('#sheet', e => !e.hidden && e.textContent.includes('Ob pomeni')), `${dev}: puzzle 2 explains »ob«`);
  if (process.env.SHOTS) await p.screenshot({ path: `shots/kjekdo-${dev}-rules2.png` });
  await tap('#go');
  ok(await p.$$eval('.cell', els => els.length === 25 && els.every(e => e.getBoundingClientRect().width >= 48)), `${dev}: 25 cells, each ≥ 48 px`);
  await tap('#hintBtn');
  ok((await said()).includes('Bor je sedel na kavču'), `${dev}: help 1 points to a sentence`);
  await tap('#hintBtn');
  ok(await p.$$eval('.cell.can', els => els.length) === 1, `${dev}: help 2 lights the cells that fit`);
  await tap('#hintBtn');
  ok(await p.$eval(cell(2, 0), e => e.textContent.includes('Bor')), `${dev}: help 3 places Bor`);
  for (let i = 0; i < 12; i++) await tap('#hintBtn');
  ok(await p.$$eval('.cell .tok', els => els.length) === 5 && await p.$eval('#who', e => !e.hidden), `${dev}: the help alone solves puzzle 2`);
  if (process.env.SHOTS) { await p.evaluate(() => scrollTo(0, 0)); await p.screenshot({ path: `shots/kjekdo-${dev}-play2.png`, fullPage: true }); }
  await tap('#whoFaces [data-p="eva"]');
  if (process.env.SHOTS) await p.screenshot({ path: `shots/kjekdo-${dev}-win.png` });
  ok(await p.$eval('#sheet', e => e.textContent.includes('Eva je vzela zlato kronico!')), `${dev}: Eva → the crown`);
  await tap('#toList');
  ok(await p.$$eval('.lvl .done', els => els.length) === 2, `${dev}: both puzzles show ✓ on the list`);
  ok(await wide(), `${dev}: no sideways scroll`);
  if (process.env.SHOTS) await p.screenshot({ path: `shots/kjekdo-${dev}.png`, fullPage: true });
  ok(!errors.length, `${dev}: no page errors ${errors.join('|')}`);
  await p.close();
}
await b.close();
