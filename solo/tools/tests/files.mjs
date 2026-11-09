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
await p.click('[data-act="mkHello"]'); await wait(150);
ok((await text()).includes('Izberi svojega detektiva'), 'hello → pick a detective');
await p.click('[data-act="mkAvatar"][data-i="4"]'); await wait(150);
ok((await text()).includes('Izberi pomočnika'), 'avatar → sidekick');
await p.click('[data-act="mkSidekick"][data-e="🐶"]'); await wait(150);
await p.type('#mkName', '<b>ana!!</b>');
await p.screenshot({ path: 'shots/f2-name.png' });
await p.click('[data-act="mkName"]'); await wait(150);
ok(await p.$eval('.ui-id-name', el => el.textContent) === 'Banab' && !(await p.$('.ui-id-name b')), 'name is cleaned (letters only) and shown safely');
ok((await text()).includes('To si ti!') && (await text()).includes('🔰 Vajenka'), 'card: »To si ti!« stamp and the first rank');
await p.click('[data-act="mkBack"]'); await wait(100);
await p.evaluate(() => { document.getElementById('mkName').value = ''; });
await p.type('#mkName', 'ana');
await p.keyboard.press('Enter'); await wait(150);
ok(await p.$eval('.ui-id-name', el => el.textContent) === 'Ana' && await p.$eval('.ui-id-photo .ui-coin', el => el.textContent) === '🐶', 'card: "Ana", sidekick, Enter works');
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
ok(await st() === 'files' && (await p.$$('.file-card:not(.teaser)')).length === await p.evaluate(() => FILES.length), 'file picker with every adventure out today');
ok((await p.$eval('.coach .say', el => el.textContent)).includes('izberi pustolovščino'), 'coach: "Zdaj izberi pustolovščino…"');
await p.screenshot({ path: 'shots/f4-files.png' });
await p.click('[data-coach="ok"]');

// ---- a season: cases open in order, a finished one stamps the ID card
await p.click('.file-card[data-file="bip"]'); await wait(200);
ok(await st() === 'board' && (await p.$$('.folder')).length === 6, 'bip: board with 6 cases');
ok(await p.$('.folder.locked[data-no="6"]'), 'bip: final case 6 starts locked 🔒');
await p.click('.folder[data-no="6"]'); await wait(150);
ok(await st() === 'board' && (await text()).includes('se odpre, ko rešiš primer 5'), "bip: tapping it explains, doesn't open");
await p.screenshot({ path: 'shots/f5-board-locked.png' });
await p.evaluate(() => { localStorage.setItem('dp_played_v1', JSON.stringify([1, 2, 3, 4, 5, 6].map(n => 'bip:' + n))); toBoard(); }); await wait(150);
ok((await text()).includes('Pustolovščina rešena') && (await p.$$('.folder.solved')).length === 6, 'bip: all 6 solved → "Pustolovščina rešena!"');
await p.screenshot({ path: 'shots/f7-file-done.png' });
await p.click('[data-act="toFiles"]'); await wait(150);
ok(await p.$('.medal[data-file="bip"]'), 'the 👾 medal is on the shelf');
ok((await p.$eval('.ui-badge-rank', el => el.textContent)).includes('Višja detektivka'), 'the badge shows the rank for 6 cases: ⭐ Višja detektivka');
ok(!(await p.$('.file-card[data-file="gozd"], .file-card[data-file="vesolje"], .file-card[data-file="kmetija"]')), 'the old forest, space and farm stories are gone');
await p.screenshot({ path: 'shots/f8-files-after.png' });

// ---- edit the card: skip the name → "Detektivka" only
await p.click('[data-act="editCard"]'); await wait(150);
await p.click('[data-act="mkAvatar"][data-i="1"]'); await p.click('[data-act="mkSidekick"][data-e="🦉"]'); await p.click('[data-act="mkSkip"]'); await wait(150);
await p.click('[data-act="mkDone"]'); await wait(150);
ok(await st() === 'files' && (await p.$eval('.ui-band-name', el => el.textContent)) === 'Detektiv', 'edited card: boy avatar, no name → "Detektiv"');
ok((await p.$$('.medal')).length === 1, 'progress kept after editing the card');

ok(!errors.length, 'no page errors ' + errors.join('|'));

// ---- adult: new child clears card, ticks and practice
const a = await b.newPage(); a.on('dialog', d => d.accept());
await a.goto('http://localhost:8765/solo/'); await wait(500);
await a.click('[data-act="age"][data-age="6-7"]'); await wait(100);
await a.click('[data-act="resetBoard"]'); await wait(100);
const left = await a.evaluate(() => [localStorage.getItem('dp_profile_v1'), localStorage.getItem('dp_played_v1'), localStorage.getItem('dp_tutorial_done')]);
ok(left[0] === 'null' && left[1] === '[]' && left[2] === 'false', 'adult "Nov otrok" clears the ID card, ticks and practice');
await b.close();
