// The landing page at the repo root on iPhone 14, iPad and a landscape phone: »Igraj zdaj« opens the game,
// Slovenian only, no sideways scroll, the bundled font, the manifest and the service worker.
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 400) => new Promise(r => setTimeout(r, ms));

for (const [dev, w, h] of [['iphone14', 390, 844], ['ipad', 820, 1180], ['land', 844, 390]]) {
  const p = await b.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: dev !== 'ipad', deviceScaleFactor: 2 });
  await p.goto('http://localhost:8765/'); await wait();
  ok(await p.title() === 'Bralni detektivi' && (await p.$eval('h1', e => e.textContent)) === 'Vsak stavek je sled.', `${dev}: »Bralni detektivi«, »Vsak stavek je sled.«`);
  const text = await p.evaluate(() => document.body.innerText);
  ok(text.includes('od 6 do 10 let') && text.includes('Vsak teden nova pustolovščina'), `${dev}: ages 6–10, a new adventure every week`);
  ok(!/Play now|How it works|Detektivska pisarna/.test(text) && !(await p.$('[data-lang]')), `${dev}: Slovenian only, the new brand`);
  ok(await p.$$eval('a[href="solo/?play"]', els => els.length >= 2), `${dev}: »Igraj zdaj« links to the game (solo/?play)`);
  ok(await p.evaluate(() => { const r = document.getElementById('play').getBoundingClientRect(); return r.bottom <= innerHeight || innerHeight < 500; }), `${dev}: »Igraj zdaj« is on screen without scrolling`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${dev}: no sideways scroll`);
  ok(await p.evaluate(async () => { await document.fonts.ready; return document.fonts.check('700 20px Lexend'); }), `${dev}: Lexend from solo/fonts (no Google Fonts)`);
  ok(await p.evaluate(() => !!document.querySelector('link[rel="manifest"][href="manifest.webmanifest"]') && !!document.querySelector('meta[name="apple-mobile-web-app-capable"]')), `${dev}: PWA meta and manifest`);
  if (process.env.SHOTS) await p.screenshot({ path: `shots/landing-${dev}.png`, fullPage: true });
  ok(!errors.length, `${dev}: no page errors ${errors.join('|')}`);
  await p.close();
}

// the play button opens the game; the manifest and the service worker are there and name the brand
{
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await p.goto('http://localhost:8765/'); await wait();
  ok(await p.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); return !!r || !!(await navigator.serviceWorker.ready.then(() => true)); }), 'the service worker registers');
  const man = await p.evaluate(() => fetch('manifest.webmanifest').then(r => r.json()));
  ok(man.name === 'Bralni detektivi' && man.start_url === './home/', `manifest: ${man.name}, starts at ${man.start_url}`);
  await Promise.all([p.waitForNavigation(), p.click('#play')]); await wait(600);
  ok(p.url().endsWith('/solo/?play') && await p.evaluate(() => typeof S === 'object'), '»Igraj zdaj« opens the game');
  await p.close();
}

// »Zasebnost in pogoji«: linked from the footer and from »Za starše«, both documents on one page, nothing sent
for (const [dev, w, h] of [['iphone14', 390, 844], ['ipad', 820, 1180], ['land', 844, 390]]) {
  const p = await b.newPage();
  const errors = [], outside = []; p.on('pageerror', e => errors.push(e.message));
  p.on('request', r => { if (!r.url().startsWith('http://localhost:8765/')) outside.push(r.url()); });
  await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: dev !== 'ipad', deviceScaleFactor: 2 });
  await p.goto('http://localhost:8765/'); await wait();
  ok(await p.$$eval('a[href="zasebnost/"]', els => els.length === 2 && els.every(e => e.getBoundingClientRect().height > 0)), `${dev}: the footer and »Za starše« link to »Zasebnost in pogoji«`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${dev}: the landing page still has no sideways scroll`);
  await Promise.all([p.waitForNavigation(), p.$eval('a.legal', e => e.click())]); await wait();
  outside.length = 0; await p.reload(); await wait();   // the landing page's beacon reports on the way out
  const text = await p.evaluate(() => document.body.innerText);
  ok(p.url().endsWith('/zasebnost/') && (await p.$eval('h1', e => e.textContent)) === 'Zasebnost in pogoji', `${dev}: the link opens the page`);
  ok(text.includes('Na kratko') && await p.$('#zasebnost') && await p.$('#pogoji') && text.includes('Informacijskem pooblaščencu') && text.includes('Velja od'), `${dev}: summary, privacy, terms, the authority, the date`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${dev}: no sideways scroll`);
  ok(await p.evaluate(async () => { await document.fonts.ready; return document.fonts.check('700 20px Lexend'); }), `${dev}: Lexend from solo/fonts`);
  ok(!outside.length && !(await p.$('script')), `${dev}: no script and nothing sent ${outside.join('|')}`);
  ok(await p.$eval('a.brand', e => e.getAttribute('href')) === '../', `${dev}: the brand leads back to the start page`);
  if (process.env.SHOTS) await p.screenshot({ path: `shots/zasebnost-${dev}.png`, fullPage: true });
  ok(!errors.length, `${dev}: no page errors ${errors.join('|')}`);
  await p.close();
}
await b.close();
