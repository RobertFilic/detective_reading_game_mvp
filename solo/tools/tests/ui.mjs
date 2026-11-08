// The ui-* parts (?ui gallery) on iPhone 14, iPad and a landscape phone: the bundled font, no sideways scroll,
// tap targets, the season colour, and a season's board in its own colour.
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 300) => new Promise(r => setTimeout(r, ms));
const season = (p) => p.evaluate(() => getComputedStyle(document.querySelector('.ui-btn, .btn')).backgroundColor);

for (const [dev, w, h] of [['iphone14', 390, 844], ['ipad', 820, 1180], ['land', 844, 390]]) {
  const p = await b.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: dev !== 'ipad', deviceScaleFactor: 2 });
  await p.goto('http://localhost:8765/solo/?ui'); await wait(500);
  // a stamp slams in from 1.9× its size: let the one-off animations end before measuring
  await p.evaluate(() => document.getAnimations().filter(a => a.effect.getTiming().iterations !== Infinity).forEach(a => a.finish()));
  ok(await p.evaluate(() => S.screen === 'ui' && document.fonts.check('600 20px Lexend') && [...document.fonts].some(f => f.family === 'Lexend' && f.status === 'loaded')),
    `${dev}: the gallery opens and Lexend is bundled (no network)`);
  ok(await p.evaluate(() => getComputedStyle(document.body).fontFamily.startsWith('Lexend')), `${dev}: the game's text is Lexend, Verdana behind it`);
  ok(await p.evaluate(() => document.querySelector('.ui-gallery').scrollWidth <= innerWidth), `${dev}: no sideways scroll`);
  const small = await p.evaluate(() => [...document.querySelectorAll('.ui-row, .ui-btn:not(.is-chip), .ui-tool, .ui-band-btn, .ui-helper, .ui-tile, .ui-face')]
    .filter(el => { const r = el.getBoundingClientRect(); return r.height < 56 || r.width < 56; }).map(el => el.className));
  ok(!small.length, `${dev}: every tap target is at least 56 px ${small.join(', ')}`);
  const chips = await p.evaluate(() => [...document.querySelectorAll('.ui-btn.is-chip')].every(el => el.getBoundingClientRect().height >= 48));
  ok(chips, `${dev}: small chips are still 48 px tall`);
  const overflow = await p.evaluate(() => [...document.querySelectorAll('.ui-row-text, .ui-face-name, .ui-id-name, .ui-sheet-title')]
    .filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent.slice(0, 20)));
  ok(!overflow.length, `${dev}: no text spills out of its box ${overflow.join(' | ')}`);
  // picked = the deep season colour with white text, never the gold of a hint
  const picked = await p.evaluate(() => { const r = getComputedStyle(document.querySelector('.ui-row.is-picked')); return [r.color, r.backgroundColor, getComputedStyle(document.querySelector('.ui-btn')).backgroundColor]; });
  ok(picked[0] === 'rgb(255, 255, 255)' && picked[1] === picked[2], `${dev}: a picked row is white on the season colour`);
  const green = await season(p);
  await p.click('[data-act="uiHue"][data-hue="235"]'); await wait(150);
  const blue = await season(p);
  ok(green !== blue && await p.evaluate(() => getComputedStyle(document.getElementById('app')).getPropertyValue('--hue').trim() === '235'), `${dev}: a season's hue changes the colour (${green} → ${blue})`);
  if (process.env.SHOTS) await p.screenshot({ path: `shots/ui-${dev}.png` });
  ok(!errors.length, `${dev}: no page errors ${errors.join('|')}`);
  await p.close();
}

// in the game: a season's board takes its colour; the start screen stays brand green
{
  const p = await b.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.setViewport({ width: 390, height: 844, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8765/solo/?play');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('dp_save_version', '4'); localStorage.setItem('dp_tutorial_done', 'true');
    localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏽‍♀️', g: 'f', sk: '🦊', name: 'Ana', id: '1234' })); });
  await p.reload(); await wait(500);
  const hue = () => p.evaluate(() => getComputedStyle(document.getElementById('app')).getPropertyValue('--hue').trim());
  ok(await p.evaluate(() => S.screen) === 'files' && await hue() === '160', 'the start screen is brand green (160)');
  const seen = new Set();
  for (const f of await p.evaluate(() => FILES.map(f => [f.id, String(f.hue)]))) {
    await p.evaluate((id) => { S.file = id; toBoard(); }, f[0]); await wait(100);
    ok(await hue() === f[1], `${f[0]}: its board is in its own colour (${f[1]})`);
    seen.add(await p.evaluate(() => { const x = document.createElement('button'); x.className = 'btn'; document.querySelector('.screen').append(x); return getComputedStyle(x).backgroundColor; }));
  }
  ok(seen.size === await p.evaluate(() => new Set(FILES.map(f => f.hue)).size), `the older screens' buttons follow the season too: ${[...seen].join(' ')}`);
  ok(await p.evaluate(() => helperEmoji()) === '🦊', 'the helper is the one on the ID card');
  ok(!errors.length, `no page errors ${errors.join('|')}`);
  await p.close();
}
await b.close();
