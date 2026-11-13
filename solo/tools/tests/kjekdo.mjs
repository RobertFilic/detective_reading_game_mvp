// »Skrivnostne sobe« (kje-je-kdo/) on iPhone 14, iPad and a landscape phone: the start page's tile opens it,
// a child without a detective ID card makes one first (the main game's card, so solo/ knows them too),
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
  ok(await p.$eval('#kjekdo', e => e.textContent.includes('Skrivnostne sobe') && e.getAttribute('href') === 'kje-je-kdo/'), `${dev}: the start page has the »Skrivnostne sobe« tile`);
  await p.evaluate(() => { localStorage.removeItem('dp_kjekdo_v1'); localStorage.removeItem('dp_profile_v1'); localStorage.removeItem('dp_kjekdo_intro_v1'); });
  await Promise.all([p.waitForNavigation(), p.$eval('#kjekdo', e => e.click())]); await wait();
  const LV = await p.evaluate(() => LEVELS);

  // no ID card yet: detective → helper → name → card, the same steps and the same card as the main game
  ok(!(await p.$eval('#make', e => e.hidden)) && await p.$eval('#list', e => e.hidden) && await p.$$eval('#make [data-av]', els => els.length === 6 && els.every(e => e.getBoundingClientRect().height >= 48)), `${dev}: a new child first picks a detective (6, each ≥ 48 px)`);
  if (process.env.SHOTS) await p.screenshot({ path: `shots/kjekdo-${dev}-card1.png` });
  await tap('#make [data-av="4"]');
  ok(await p.$$eval('#make [data-sk]', els => els.length) === 4, `${dev}: then a helper`);
  await tap('#make [data-sk="🦊"]');
  await tap('#back');
  ok(await p.$$eval('#make [data-sk]', els => els.length) === 4, `${dev}: ← goes one step back`);
  await tap('#make [data-sk="🦊"]');
  await p.type('#mkName', 'ana'); await tap('#mkNext');
  ok(await p.$eval('#make', e => e.textContent.includes('Detektivka Ana') && e.textContent.includes('Postala si detektivka')), `${dev}: the card says »Detektivka Ana«`);
  if (process.env.SHOTS) await p.screenshot({ path: `shots/kjekdo-${dev}-card4.png` });
  await tap('#mkDone');
  const card = await p.evaluate(() => JSON.parse(localStorage.getItem('dp_profile_v1')));
  ok(card && card.av === '🕵🏽‍♀️' && card.g === 'f' && card.sk === '🦊' && card.name === 'Ana' && /^\d{4}$/.test(card.id), `${dev}: the card is saved the way the main game saves it`);
  ok(await p.$eval('#list', (e) => !e.hidden && e.querySelector('.me').textContent.includes('Detektivka Ana') && e.querySelector('.me-pic').textContent.includes('🦊')), `${dev}: the list greets Detektivka Ana and her fox`);
  ok(p.url().endsWith('/kje-je-kdo/') && await p.$$eval('.lvl', els => els.length) === 12 && await p.$$eval('h2.group', els => els.length) === 3, `${dev}: the tile opens the list: 12 puzzles in 3 groups`);
  ok(await p.$$eval('.lvl.locked', els => els.length) === 11, `${dev}: only puzzle 1 is open at first`);
  await tap('.lvl[data-level="3"]');
  ok(!(await p.$eval('#list', e => e.hidden)), `${dev}: a locked puzzle doesn't open`);
  ok(await wide(), `${dev}: the list has no sideways scroll`);

  // puzzle 1: the story and the rules, then taps
  const L1 = LV[0];
  await tap('.lvl[data-level="1"]');
  // the first time: »Kako se igra?« in 6 cards, then the story alone
  const sheet = () => p.$eval('#sheet', e => e.hidden ? '' : e.textContent);
  ok((await sheet()).includes('1 / 6') && (await sheet()).includes('Dobrodošla, detektivka Ana!'), `${dev}: the first puzzle starts with »Kako se igra?«, card 1 greets Ana`);
  if (process.env.SHOTS) await p.screenshot({ path: `shots/kjekdo-${dev}-intro1.png` });
  await tap('#introNext'); await tap('#introNext');
  ok((await sheet()).includes('3 / 6') && (await sheet()).includes('stolpcu'), `${dev}: card 3 is one per row and column`);
  if (process.env.SHOTS) await p.screenshot({ path: `shots/kjekdo-${dev}-intro3.png` });
  await tap('#introBack');
  ok((await sheet()).includes('2 / 6'), `${dev}: Nazaj goes one card back`);
  for (let i = 0; i < 4; i++) await tap('#introNext');
  ok((await sheet()).includes('6 / 6') && await p.$eval('#introNext', e => e.textContent) === 'Igrajva!' && !(await p.$('#introSkip')), `${dev}: the last card says »Igrajva!«`);
  for (const n of [2, 6]) {
    if (n === 2) { await tap('#introBack'); await tap('#introBack'); await tap('#introBack'); await tap('#introBack'); }
    else for (let i = 0; i < 4; i++) await tap('#introNext');
    ok(await p.$$eval('.sheet button', els => { const box = document.getElementById('sheetBody').getBoundingClientRect(); return els.every(e => { const r = e.getBoundingClientRect(); return r.height >= 48 && r.left >= box.left && r.right <= box.right; }); }) && await wide(), `${dev}: card ${n}: buttons ≥ 48 px, inside the card, no sideways scroll`);
  }
  await tap('#introNext');
  ok((await sheet()).includes(L1.story) && !(await sheet()).includes('stolpcu') && (await sheet()).includes('Kako se igra?'), `${dev}: then the story alone, with »Kako se igra?«`);
  if (process.env.SHOTS) await p.screenshot({ path: `shots/kjekdo-${dev}-rules1.png` });
  await tap('#go');
  ok(await p.$eval('#helperPic', e => e.textContent) === '🦊', `${dev}: the helper beside the board is the one on the card`);
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

  // pencil notes: small faces where someone might be, several per cell, never a placement
  const notes = () => p.$$eval('.cell', els => els.map(e => [...e.querySelectorAll('.notes i')].map(i => i.textContent).join('')).join('|'));
  const faceOf = (id) => L1.people.find(q => q.id === id).face;
  ok(await p.$$eval('.tool', els => els.length === 4 && els.every(e => e.getBoundingClientRect().height >= 48 && e.scrollWidth <= e.clientWidth + 1)), `${dev}: 4 tools, each ≥ 48 px, labels fit`);
  await tap('#noteBtn');
  ok(await p.$eval('#noteBtn', e => e.classList.contains('on')) && (await said()).includes('Zapiski'), `${dev}: the pencil is on and says what to do`);
  await tap('.clue[data-p="ana"]'); await tap(cell(1, 3)); await tap(cell(0, 1));
  await tap('.clue[data-p="bor"]'); await tap(cell(1, 3));
  ok(await tokens() === 0 && await p.$eval(cell(1, 3), e => e.querySelectorAll('.notes i').length) === 2 && await p.$eval(cell(0, 1), e => e.querySelectorAll('.notes i').length) === 1, `${dev}: notes for Ana and Bor, two in one cell, nobody placed`);
  await tap('.clue[data-p="ana"]'); await tap(cell(0, 1));
  ok(await p.$eval(cell(0, 1), e => e.querySelectorAll('.notes i').length) === 0, `${dev}: a second tap rubs a note out`);
  await tap(cell(1, 0));
  ok((await said()).includes('torta') && await p.$eval(cell(1, 0), e => !e.querySelector('.notes')), `${dev}: no note on the cake`);
  await tap('#undoBtn');
  ok(await p.$eval(cell(0, 1), (e, f) => e.textContent.includes(f), faceOf('ana')), `${dev}: undo brings the rubbed note back`);
  if (process.env.SHOTS) { await p.evaluate(() => scrollTo(0, 0)); await p.screenshot({ path: `shots/kjekdo-${dev}-notes.png` }); }
  await tap('#noteBtn');
  await tap('.clue[data-p="ana"]'); await tap(cell(1, 3));
  ok(await tokens() === 1 && (await notes()).replace(/\|/g, '') === '', `${dev}: placing Ana clears her notes and the notes in her row and column`);
  await tap('#undoBtn');
  ok(await tokens() === 0 && await p.$eval(cell(1, 3), e => e.querySelectorAll('.notes i').length) === 2, `${dev}: undo puts Ana back in the list and her notes back on the board`);
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
  ok(await p.$eval('#sheet', (e, l) => !e.hidden && e.textContent.includes('Primer rešen!') && e.textContent.includes(l.win) && e.textContent.includes(l.heart) && e.textContent.includes('Bravo, detektivka Ana!'), L1), `${dev}: Dan → »Primer rešen!«, »Bravo, detektivka Ana!« and the reason why`);
  ok(await p.evaluate(() => localStorage.getItem('dp_kjekdo_v1')) === '[1]', `${dev}: puzzle 1 is remembered`);

  // puzzle 2: the help lights cells, the child taps
  const L2 = LV[1];
  await tap('#next');
  ok((await p.$eval('#sheet', e => e.textContent)).includes(L2.story) && !(await p.$eval('#sheet', e => e.textContent)).includes('/ 6'), `${dev}: puzzle 2 opens with its story, no intro again`);
  await tap('#go');
  await tap('#rulesBtn');
  ok((await p.$eval('#sheet', e => e.textContent)).includes('1 / 6'), `${dev}: »?« opens »Kako se igra?«`);
  await tap('#introSkip');
  ok((await p.$eval('#sheet', e => e.textContent)).includes(L2.story), `${dev}: and back to the story`);
  await tap('#go');
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

// a help step that comes from a column, not a sentence, says why (puzzle 6 after Zala: only Maj fits column 5)
{
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8765/kje-je-kdo/'); await wait();
  await p.evaluate(() => { localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏻‍♂️', g: 'm', sk: '🐶', name: '', id: '1234' })); localStorage.setItem('dp_kjekdo_intro_v1', '1'); });
  await p.goto('http://localhost:8765/kje-je-kdo/?uganka=6'); await wait();
  await p.$eval('#go', e => e.click());
  await p.$eval('.clue[data-p="zala"]', e => e.click()); await p.$eval('.cell[data-r="4"][data-c="2"]', e => e.click());
  const lit = () => p.$$eval('.cell.can', els => els.map(e => e.dataset.r + ',' + e.dataset.c).join(' '));
  const said = () => p.$eval('#say', e => e.textContent);
  await p.$eval('#hintBtn', e => e.click());
  ok((await said()).includes('V tem stolpcu mora stati nekdo') && await lit() === '1,4 3,4', `help 1 lights column 5 and says someone must stand in it (${await lit()})`);
  await p.$eval('#hintBtn', e => e.click());
  ok((await said()).includes('Jan, Ula in Sara tukaj ne morejo stati. Samo Maj lahko') && await p.$eval('.clue[data-p="maj"]', e => e.classList.contains('glow')), 'help 2 says only Maj fits there, his sentence glows');
  await p.$eval('#hintBtn', e => e.click());
  ok(await lit() === '3,4' && await p.$$eval('.cell .tok', els => els.length) === 1, 'help 3 lights Maj\'s cell and places nobody');
  await p.close();
}

// a row that narrows a person to several cells is told as such, never as »here« (puzzle 12 after Domen:
// only Mojca fits the top row, but on one of two cells; then Ivo: the 5th row, then the 4th column)
{
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8765/kje-je-kdo/'); await wait();
  await p.evaluate(() => { localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏻‍♂️', g: 'm', sk: '🐶', name: '', id: '1234' })); localStorage.setItem('dp_kjekdo_intro_v1', '1'); });
  await p.goto('http://localhost:8765/kje-je-kdo/?uganka=12'); await wait();
  await p.$eval('#go', e => e.click());
  await p.$eval('.clue[data-p="domen"]', e => e.click()); await p.$eval('.cell[data-r="3"][data-c="2"]', e => e.click());
  const step = async () => { await p.$eval('#hintBtn', e => e.click()); return [await p.$eval('#say', e => e.textContent), await p.$$eval('.cell.can', els => els.map(e => e.dataset.r + ',' + e.dataset.c).join(' '))]; };
  const want = [
    ['V tej vrsti mora stati nekdo', '0,0 0,4 0,5'],
    ['Lara, Jure, Ivo in Pika tukaj ne morejo stati. Samo Mojca lahko', '0,0 0,5'],
    ['V tej vrsti mora stati nekdo', '4,1 4,3 4,4 4,5'],
    ['Lara, Jure in Pika tukaj ne morejo stati. Samo Ivo lahko', '4,3 4,4 4,5'],
    ['V tem stolpcu mora stati nekdo', '1,3 2,3 4,3 5,3'],
    ['Samo Ivo lahko', '1,3 2,3 4,3 5,3'],
    ['Tukaj je bil Ivo', '4,3'],
  ];
  for (const [i, [text, cells]] of want.entries()) {
    const [said, lit] = await step();
    ok(said.includes(text) && lit === cells, `puzzle 12, help ${i + 1}: »${text}…« on ${cells} (got »${said}« on ${lit})`);
    if (i === 1) ok(await p.$$eval('.cell', els => els.filter(e => e.querySelector('.notes')).map(e => e.dataset.r + ',' + e.dataset.c).join(' ')) === '0,0 0,5', 'puzzle 12: the help writes Mojca\'s two possibilities as pencil notes');
  }
  await p.$eval('.cell.can', e => e.click());
  const heard = [];
  for (let i = 0; i < 30 && await p.$$eval('.cell .tok', els => els.length) < 6; i++) {
    await p.$eval('#hintBtn', e => e.click());
    const said = await p.$eval('#say', e => e.textContent); heard.push(said);
    if (said.includes('Tapni svetlo polje')) await p.$eval('.cell.can', e => e.click());
  }
  ok(heard.some(t => t.startsWith('Mojca ima samo še en zapisek')), 'puzzle 12: at the end Mojca has one note left, and the help says so');
    await p.close();
}

// every puzzle with the help alone: press until it lights one cell and says »Tukaj«, tap that cell, again
{
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8765/kje-je-kdo/'); await wait();
  await p.evaluate(() => { localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏻‍♂️', g: 'm', sk: '🐶', name: '', id: '1234' })); localStorage.setItem('dp_kjekdo_intro_v1', '1'); });
  const LV = await p.evaluate(() => LEVELS);
  for (const L of LV) {
    await p.goto(`http://localhost:8765/kje-je-kdo/?uganka=${L.id}`); await wait(200);
    await p.$eval('#go', e => e.click());
    let presses = 0;
    while (presses < 60 && await p.$$eval('.cell .tok', els => els.length) < L.people.length) {
      await p.$eval('#hintBtn', e => e.click()); presses++;
      if ((await p.$eval('#say', e => e.textContent)).includes('Tapni svetlo polje')) await p.$eval('.cell.can', e => e.click());
    }
    ok(await p.$$eval('.cell .tok', els => els.length) === L.people.length, `puzzle ${L.id}: the help alone leads to everyone's place (${presses} presses)`);
  }
  await p.close();
}

// every puzzle on the phone: each person by their sentence and their cell, then the culprit
{
  const p = await b.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.setViewport({ width: 390, height: 844, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8765/kje-je-kdo/'); await wait();
  await p.evaluate(() => { localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏻‍♂️', g: 'm', sk: '🐶', name: '', id: '1234' })); localStorage.setItem('dp_kjekdo_intro_v1', '1'); });
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
    const win = await p.$eval('#sheet', (e, l) => !e.hidden && e.textContent.includes(l.win) && e.textContent.includes(l.heart) && e.textContent.includes('Bravo, detektiv!'), L);
    const wide = await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    if (process.env.SHOTS) { await p.$eval('#sheet', e => e.hidden = true); await p.evaluate(() => scrollTo(0, 0)); await p.screenshot({ path: `shots/kjekdo-all-${L.id}.png`, fullPage: true }); }
    ok(placed === n && win && !small && wide, `puzzle ${L.id} »${L.title}«: ${n} placed, the culprit found, the reason shown, cells ≥ 48 px, no sideways scroll`);
  }
  ok(!errors.length, `all puzzles: no page errors ${errors.join('|')}`);
  await p.close();
}
await b.close();
