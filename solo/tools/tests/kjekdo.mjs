// »Skrivnostne sobe« (kje-je-kdo/) on iPhone 14, iPad and a landscape phone: the start page's tile opens it,
// a child without a detective ID card makes one first (the main game's card, so solo/ knows them too),
// only puzzle 1 is open at first, puzzle 1 is played by taps (wrong taps get a gentle sentence, undo,
// crosses), puzzle 2 with the help button, which lights cells but never places anyone; the question, the
// reward with its »Zakaj?«, and the ✓ that stays on the list. Then all puzzles on the phone. One room a day by date: see the end.
// No sideways scroll, targets ≥ 48 px. Texts come from the page's own LEVELS, so wording can change.
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 350) => new Promise(r => setTimeout(r, ms));

for (const [dev, w, h] of [['iphone14', 390, 844], ['ipad', 820, 1180], ['land', 844, 390]]) {
  const p = await b.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  // the anonymous events the page sends (docs/EVENTS.md); the test server just drops them
  const evs = []; p.on('request', r => { if (r.url().endsWith('/api/e')) { try { evs.push(JSON.parse(r.postData())); } catch (e) {} } });
  await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: dev !== 'ipad', deviceScaleFactor: 2 });
  const tap = async (sel) => { await p.$eval(sel, e => e.scrollIntoView({ block: 'center' })); await p.tap(sel); await wait(); };
  const cell = (r, c) => `.cell[data-r="${r}"][data-c="${c}"]`;
  const said = () => p.$eval('#say', e => e.textContent);
  const wide = () => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  const tokens = () => p.$$eval('.cell .tok', els => els.length);

  await p.goto('http://localhost:8765/'); await wait();
  ok(await p.$eval('#kjekdo', e => e.textContent.includes('Skrivnostne sobe') && e.getAttribute('href') === 'kje-je-kdo/'), `${dev}: the start page has the »Skrivnostne sobe« tile`);
  ok(await p.$eval('#kjekdo', e => !!e.closest('.hero') && e.textContent.includes('Novo!') && !!(e.compareDocumentPosition(document.getElementById('install')) & Node.DOCUMENT_POSITION_FOLLOWING)), `${dev}: it sits in the hero with »Novo!«, before »Namesti aplikacijo«`);
  ok(await p.$eval('#kjekdo', e => { const r = e.getBoundingClientRect(); return r.top < innerHeight * 1.25 && r.right <= innerWidth && r.height >= 48; }) && await wide(), `${dev}: it is near the top of the page, fits the width`);
  if (process.env.SHOTS) await p.screenshot({ path: `shots/kjekdo-${dev}-landing.png` });
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
  const nOut = await p.evaluate(() => LEVELS.filter(isOut).length);
  ok(p.url().endsWith('/kje-je-kdo/') && await p.$$eval('.levels .lvl', els => els.length) === nOut && await p.$$eval('h2.group', els => els.length) === 3, `${dev}: the tile opens the list: ${nOut} puzzles that are out, in 3 groups`);
  ok(await p.$$eval('.lvl.locked', els => els.length) === 0 && await p.$eval('.lvl.main', e => e.textContent.includes('Začni tukaj') && e.dataset.level === '1'), `${dev}: nothing is locked; the big card says »Začni tukaj« on puzzle 1`);
  ok(await p.$eval('.lvl.main', e => e.getBoundingClientRect().height > document.querySelector('.levels .lvl').getBoundingClientRect().height), `${dev}: the big card is bigger than the others`);
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
  const errs = () => p.$eval('#errs', e => e.textContent);
  ok(await errs() === 'Napake: 0', `${dev}: the question bar shows »Napake: 0«`);
  await tap('.clue[data-p="ana"]'); await tap(cell(1, 0));
  ok((await said()).includes('torta') && await tokens() === 0, `${dev}: a tap on the cake says nobody can stand there`);
  await tap(cell(0, 1));
  ok(await tokens() === 0 && await p.$eval('.clue[data-p="ana"]', e => e.classList.contains('glow')), `${dev}: a wrong cell places nobody, Ana's sentence glows`);
  ok(await errs() === 'Napake: 2', `${dev}: both wrong taps are counted: »Napake: 2«`);
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
  const e1 = await errs();
  ok(/^Napake: [3-9]$/.test(e1) && (await p.$eval('#sheet', e => e.textContent)).includes(e1), `${dev}: the win sheet shows the same count (${e1})`);

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
  ok(await p.$$eval('.levels .lvl .done', els => els.length) === 2 && await p.$eval('.lvl.main', e => e.dataset.level === '3'), `${dev}: 2 ✓ on the list, the big card now starts puzzle 3`);
  ok(await wide(), `${dev}: no sideways scroll`);

  if (process.env.SHOTS) await p.screenshot({ path: `shots/kjekdo-${dev}.png`, fullPage: true });

  // the events: anonymous, one random sitting number, nothing from the ID card
  await wait(300);
  const ev = (name, puzzle) => evs.filter(e => e.ev === name && (puzzle === undefined || e.puzzle === puzzle));
  ok(evs.length > 0 && evs.every(e => e.game === 'sobe' && /^[a-z0-9]{10}$/.test(e.sid) && e.sid === evs[0].sid), `${dev}: events carry one random sitting number (${evs.length} events)`);
  ok(!JSON.stringify(evs).includes('Ana') && !JSON.stringify(evs).includes('🦊') && evs.every(e => !('id' in e) && !('name' in e)), `${dev}: no name, helper or card number in any event`);
  ok(ev('intro').length === 2 && ev('intro')[0].data.first === true && ev('intro')[0].data.how === 'next' && ev('intro')[0].data.card === 6 && ev('intro')[1].data.first === false && ev('intro')[1].data.how === 'skip', `${dev}: intro: read to card 6 the first time, skipped from »?«`);
  ok(ev('start', 1).length === 1 && ev('start', 1)[0].data.first === true && ev('start', 2).length === 1, `${dev}: start of puzzles 1 and 2`);
  ok(ev('wrong', 1).some(e => e.data.kind === 'block') && ev('wrong', 1).some(e => e.data.kind === 'row' && e.data.who === 'bor') && ev('wrong', 1).some(e => e.data.kind === 'answer' && e.data.who === 'ana'), `${dev}: wrong taps say what kind (cake, row, wrong answer)`);
  const s1 = ev('solved', 1)[0], s2 = ev('solved', 2)[0];
  ok(s1 && s1.data.first === true && s1.data.done === 1 && s1.data.hints === 0 && s1.data.notes === true && s1.placed === 4 && s1.data.wrongs >= 3, `${dev}: puzzle 1 solved: first time, 1 done, no help, used notes`);
  ok(ev('start', 2)[0].placed === 0, `${dev}: a start event counts 0 people placed (not the last puzzle's)`);
  ok(s2 && s2.data.done === 2 && s2.data.hints === 3 + 3 * L2.people.length && ev('hint', 2)[0].data.step === 1 && ev('hint', 2)[0].placed === 0, `${dev}: puzzle 2 solved with ${s2 && s2.data.hints} helps, each help counted with its step`);
  ok(!ev('left').length && !ev('stuck').length, `${dev}: no »left« or »stuck« for solved puzzles`);
  // VELIKE TISKANE ČRKE: one switch in the header, remembered on this device
  ok(await p.$eval('#capsBtn', e => e.textContent === 'ABC' && e.getBoundingClientRect().height >= 48) && !(await p.evaluate(() => document.documentElement.classList.contains('caps'))), `${dev}: »ABC« in the header, small letters to start`);
  await tap('#capsBtn');
  ok(await p.evaluate(() => document.documentElement.classList.contains('caps') && getComputedStyle(document.querySelector('.lvl b')).textTransform === 'uppercase' && localStorage.getItem('dp_caps_v1') === '1') && await p.$eval('#capsBtn', e => e.textContent === 'abc'), `${dev}: »ABC« turns on capitals everywhere (the cards too), and is remembered`);
  await p.reload(); await wait(500);
  ok(await p.evaluate(() => document.documentElement.classList.contains('caps')), `${dev}: capitals stay on after a reload`);
  await tap('.lvl.main'); await tap('#sheetBody .big');
  ok(await p.$$eval('.cell .lab', els => els.every(l => { const c = l.closest('.cell').getBoundingClientRect(), r = l.getBoundingClientRect(); return l.scrollWidth <= l.clientWidth + 1 && r.left >= c.left - 1 && r.right <= c.right + 1; })) && await p.$$eval('.tool', els => els.every(e => e.scrollWidth <= e.clientWidth + 1)) && await wide(), `${dev}: in capitals, room names fit their cells, tool labels fit, no sideways scroll`);
  await tap('#capsBtn');
  ok(!(await p.evaluate(() => document.documentElement.classList.contains('caps'))) && await p.evaluate(() => localStorage.getItem('dp_caps_v1')) === '0', `${dev}: »abc« turns them off again`);
  await tap('#back');
  ok(!errors.length, `${dev}: no page errors ${errors.join('|')}`);
  await p.close();
}

// »stuck« after 90 s on the board without placing anyone, once per step; »left« when going back unsolved
{
  const p = await b.newPage();
  const evs = []; p.on('request', r => { if (r.url().endsWith('/api/e')) { try { evs.push(JSON.parse(r.postData())); } catch (e) {} } });
  await p.goto('http://localhost:8765/kje-je-kdo/');
  await p.evaluate(() => { localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏻‍♂️', g: 'm', sk: '🐶', name: '', id: '1234' })); localStorage.setItem('dp_kjekdo_intro_v1', '1'); localStorage.setItem('dp_kjekdo_v1', '[1,2,3]'); });
  await p.reload(); await wait();
  await p.evaluate(() => start(3)); await wait();
  await p.evaluate(() => { T.idle = 80000; }); await wait(6000);
  ok(!evs.some(e => e.ev === 'stuck'), 'no »stuck« while the story sheet is open');
  await p.evaluate(() => closeSheet());
  await wait(6000);
  ok(!evs.some(e => e.ev === 'stuck'), 'no »stuck« before 90 s on the board');
  await p.evaluate(() => { T.idle = 89000; }); await wait(6000);
  const st = evs.filter(e => e.ev === 'stuck');
  ok(st.length === 1 && st[0].puzzle === 3 && st[0].placed === 0 && st[0].data.hints === 0, '»stuck« after 90 s: puzzle 3, nobody placed yet');
  await p.evaluate(() => { T.idle = 200000; }); await wait(6000);
  ok(evs.filter(e => e.ev === 'stuck').length === 1, 'only one »stuck« for the same step');
  ok(evs.find(e => e.ev === 'start' && e.puzzle === 3).data.first === false, 'a replay of a solved puzzle starts with first: false');
  await p.evaluate(() => showList()); await wait();
  const left = evs.filter(e => e.ev === 'left');
  ok(left.length === 1 && left[0].puzzle === 3, '»left« when going back to the list unsolved');
  await p.evaluate(() => start(3)); await wait();
  // (puppeteer can't see a beacon sent during navigation, so the page's own »pagehide« is fired here;
  // a real navigation against the Worker was checked by hand and stored the »left«)
  await p.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide'))); await wait(300);
  ok(evs.filter(e => e.ev === 'left').length === 2, '»left« when the page is left on an unsolved puzzle');
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
  await p.goto('http://localhost:8765/kje-je-kdo/?date=2999-01-01&uganka=12'); await wait();
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
  // rooms on hold (hold: true) are not playable in the game yet; tools/kjekdo.mjs checks them on disk
  for (const L of LV.filter(l => !l.hold)) {
    await p.goto(`http://localhost:8765/kje-je-kdo/?date=2999-01-01&uganka=${L.id}`); await wait(200);
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
  for (const L of LV.filter(l => !l.hold)) {
    await p.goto(`http://localhost:8765/kje-je-kdo/?date=2999-01-01&uganka=${L.id}`); await wait();
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
// one new room a day by date: future rooms are hidden (only a teaser), rooms already out stay open
{
  const p = await b.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.setViewport({ width: 390, height: 844, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.evaluateOnNewDocument(() => { window.NO_READ_WAIT = true; try { speechSynthesis.getVoices = () => []; } catch (e) {} });
  const SH = '/private/tmp/claude-501/-Users-robertfilic-workspace-detective-reading-game-mvp/fd6e5446-2f89-42bd-904e-6017f1e32405/scratchpad/sobe-dev/';
  const open = async (date, solved, shot, vp) => {
    await p.setViewport({ ...(vp || { width: 390, height: 844 }), hasTouch: true, isMobile: !vp, deviceScaleFactor: 2 });
    await p.goto('http://localhost:8765/kje-je-kdo/' + (date ? `?date=${date}` : '')); 
    await p.evaluate((s) => {
      localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏻‍♂️', g: 'm', sk: '🐶', name: '', id: '1234' })); localStorage.setItem('dp_kjekdo_intro_v1', '1'); localStorage.setItem('dp_kjekdo_v1', JSON.stringify(s));
      // test-only dated rooms (not in LEVELS on disk): 11 out on 2030-01-10, 12 on 2030-01-11, 10 on 2030-01-13
      LEVELS.find(l => l.id === 10).date = '2030-01-13'; LEVELS.find(l => l.id === 11).date = '2030-01-10'; LEVELS.find(l => l.id === 12).date = '2030-01-11';
    }, solved);
    await p.evaluate(() => { solved = JSON.parse(localStorage.getItem('dp_kjekdo_v1')); showList(); });
    await wait(200);
    if (shot) await p.screenshot({ path: SH + shot, fullPage: true });
  };
  const txt = (sel) => p.$eval(sel, e => e.textContent).catch(() => '');
  const ids = () => p.$$eval('.levels .lvl', els => els.map(e => +e.dataset.level));
  const main = () => p.$eval('.lvl.main', e => ({ id: +e.dataset.level, t: e.textContent })).catch(() => null);

  await open('2030-01-09', [], 'list-new-390.png');
  ok(!(await ids()).some(i => [10, 11, 12].includes(i)) && (await txt('.teaser')).includes('Jutri: nova soba'), 'dates: before the 10th the dated rooms are hidden, teaser »Jutri: nova soba«');
  ok((await main()).id === 1 && (await main()).t.includes('Začni tukaj'), 'dates: a new player gets »Začni tukaj« on puzzle 1');
  await open('2030-01-08', [1, 2, 3, 4], null);
  ok((await txt('.teaser')).includes('Čez 2 dni: nova soba 🔒'), 'dates: the teaser counts calendar days to the next room');
  await open('2030-01-10', [1, 2, 3, 4, 5, 6, 7, 8, 9], 'list-today-390.png');
  ok((await ids()).includes(11) && !(await ids()).includes(12) && (await main()).id === 11 && (await main()).t.includes('Današnja soba'), 'dates: on the 10th room 11 is listed and is »Današnja soba«');
  ok((await txt('.teaser')).includes('Jutri: nova soba'), 'dates: and the next one is announced for tomorrow');
  ok(await p.$$eval('.lvl', els => els.every(e => !e.classList.contains('locked') && e.getBoundingClientRect().height >= 56)), 'dates: every room that is out is a tappable card');
  await open('2030-01-10', [1, 2, 3, 4, 5, 6, 7, 8, 9, 11], null);
  ok((await main()).id === 11 && (await main()).t.includes('✓') && !(await main()).t.includes('Jutri pride'), 'dates: today\'s room solved: ✓ (the teaser alone says what comes)');
  await open('2030-01-11', [1, 2, 3, 4, 5, 6, 7, 8, 9], null);
  ok((await main()).id === 12 && (await main()).t.includes('Današnja soba') && (await ids()).includes(11), 'dates: the 11th: the newest room is today\'s, the 10th\'s stays open');
  await open('2030-01-12', [1, 2, 3, 4, 5, 6, 7, 8, 9, 12], null);
  ok((await main()).id === 12 && (await main()).t.includes('Nova soba'), 'dates: a day after its date it is »Nova soba«');
  await open('2030-01-14', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], null);
  ok((await main()).id === 10 && (await main()).t.includes('✓') && !(await main()).t.includes('Jutri pride'), 'dates: solved and nothing due tomorrow: ✓ and no »Jutri pride«');
  await open('2030-01-20', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], null);
  ok(!(await txt('.teaser')) , 'dates: no teaser when no future room exists');

  // several rooms on one day (the producer opened 15, 16 and 17 together on 2026-11-17)
  const upTo14 = Array.from({ length: 14 }, (_, i) => i + 1);
  await open('2026-11-16', upTo14, null);
  ok((await txt('.teaser')).includes('Jutri: 3 nove sobe 🔒') && !(await ids()).some(i => [15, 16, 17].includes(i)), 'one day, three rooms: the day before, »Jutri: 3 nove sobe 🔒«, none listed yet');
  await open('2026-11-17', upTo14, 'list-three-390.png');
  ok((await ids()).includes(15) && (await ids()).includes(16) && (await ids()).includes(17) && (await main()).id === 15 && (await main()).t.includes('Današnja soba'), 'one day, three rooms: all three are out, the big card is the first, 15');
  ok((await txt('.teaser')).includes('Jutri: nova soba 🔒'), 'one day, three rooms: then one a day again');
  await open('2026-11-17', [...upTo14, 15], null);
  ok((await main()).id === 16 && (await main()).t.includes('Današnja soba'), 'one day, three rooms: 15 solved, the big card moves on to 16');
  await open('2026-11-17', [...upTo14, 15, 16, 17], null);
  ok((await main()).id === 17 && (await main()).t.includes('✓'), 'one day, three rooms: all solved, the last one with ✓');

  // next after a win: the next unsolved room that is out, skipping solved and unreleased ones
  await open('2030-01-09', [1, 2, 3, 4, 5, 6, 7, 8, 9], null);
  ok(await p.evaluate(() => { const n = nextUnsolved(8); return !n || (n.id < 9 || n.id > 12); }), 'next: after room 9 it does not pick a room that is not out yet');
  await open('2030-01-10', [1, 2, 4, 5], null);
  ok(await p.evaluate(() => nextUnsolved(0).id === 3 && nextUnsolved(2).id === 6 && nextUnsolved(LEVELS.findIndex(l => l.id === 9)).id === 11), 'next: skips solved rooms and rooms not out');
  ok(await p.evaluate(() => { solved = LEVELS.filter(isOut).map(l => l.id); return nextUnsolved(3) === null; }), 'next: nothing unsolved left: no next (the win sheet goes to the list)');
  // deep links
  // a real dated room (once the file has some) is no deep link before its day
  await p.goto('http://localhost:8765/kje-je-kdo/?date=2999-01-01'); await wait(200);
  const fut = await p.evaluate(() => { const d = LEVELS.filter(l => l.date).sort((a, b) => a.date < b.date ? -1 : 1).pop(); return d ? { id: d.id, date: d.date } : null; });
  if (fut) {
    await p.goto(`http://localhost:8765/kje-je-kdo/?date=2000-01-01&uganka=${fut.id}`); await wait(200);
    ok(!(await p.$eval('#list', e => e.hidden)) && await p.$eval('#game', e => e.hidden), 'deep link: ?uganka= of a room that is not out shows the list');
  }
  await p.goto('http://localhost:8765/kje-je-kdo/?date=2999-01-01&uganka=3'); await wait(300);
  ok(await p.$eval('#list', e => e.hidden) && !(await p.$eval('#game', e => e.hidden)), 'deep link: a room that is out starts');
  await open('2030-01-10', [1, 2, 3, 4], 'list-ipad-820.png', { width: 820, height: 1180 });
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'dates: iPad: no sideways scroll');
  await open('2030-01-10', [1, 2, 3, 4], null, { width: 340, height: 700 });
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'dates: 340 px: no sideways scroll');
  ok(!errors.length, 'dates: no page errors ' + errors.join('|'));
  await p.close();
}
await b.close();
