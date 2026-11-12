// QR transfer: the debrief draws a QR code with every detective's progress; another origin receives it
// by opening the link (the camera app) or by "Skeniraj kodo" (a fake camera that films the QR code).
// localhost and 127.0.0.1 are different origins, so their localStorage is separate, like two devices.
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 200) => new Promise(r => setTimeout(r, ms));
const errors = [];
const page = async (url) => {
  const p = await b.newPage();
  p.on('pageerror', e => errors.push(e.message));
  p.dialogs = [];
  p.on('dialog', d => { p.dialogs.push(d.message()); d.accept(); });
  await p.setViewport({ width: 390, height: 844, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.goto(url);
  await p.evaluate(() => localStorage.clear());
  return p;
};

// a busy device: three detectives, many solved cases, letters and guesses
const fixture = () => {
  const played = (f, n) => Array.from({ length: n }, (_, i) => `${f}:${i + 1}`);
  const kid = (name, id, files) => ({
    dp_profile_v1: JSON.stringify({ av: '🕵🏻‍♂️', g: 'm', sk: '🐶', name, id }),
    dp_played_v1: JSON.stringify(files), dp_tutorial_done: 'true',
    dp_letters_v1: JSON.stringify(files.slice(0, 4)), dp_player_v1: JSON.stringify({ id: 'p-' + id, created: '2026-11-01T10:00:00.000Z' }),
    dp_guess_v1: JSON.stringify(Object.fromEntries(files.slice(0, 6).map(f => [f, 'b']))),
  });
  const active = kid('Klai', '9745', [...played('bip', 6), ...played('galeb', 6), ...played('muzej', 3)]);
  const store = { ...active, dp_save_version: '4', dp_child_n: '5', dp_ugovor_v1: 'true',
    dp_detectives_v1: JSON.stringify({ active: 'd1', list: [{ key: 'd1', data: null }, { key: 'd2', data: kid('Ema', '1234', played('bip', 4)) }, { key: 'd3', data: kid('Žan', '5555', played('bip', 6)) }] }) };
  for (const [k, v] of Object.entries(store)) localStorage.setItem(k, v);
};
const OLD = 'http://localhost:8765/solo/', NEW = 'http://127.0.0.1:8765/solo/';
const storageOf = (p) => p.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter(k => k !== 'dp_log_v1' && k !== 'dp_child_n').map(k => [k, localStorage.getItem(k)])));

// --- sender
const a = await page(OLD);
await a.evaluate(fixture);
await a.reload(); await wait(400);
await a.evaluate(() => go('debrief'));
const sent = await storageOf(a);   // after the review: it notes the active detective's help state (dp_help_v1)
await a.click('[data-act=qrShow]');
await a.waitForSelector('.qr-wrap svg', { timeout: 5000 });
const url = await a.$eval('.qr-wrap', el => el.dataset.url);
const svg = await a.$eval('.qr-wrap svg', el => el.outerHTML);
console.log(`  link ${url.length} characters`);
ok(url.startsWith(OLD + '#prenos=z'), 'the link points at this game and is compressed');
ok(url.length < 1500, `the link stays small enough for a phone camera (${url.length})`);
ok(await a.$eval('.xfer', el => /Klai.*Ema.*Žan/.test(el.textContent)), 'the adult sees which detectives are in the code');
for (const [w, h, name] of [[390, 844, 'iPhone 14'], [375, 667, 'iPhone SE'], [844, 390, 'a landscape phone'], [820, 1180, 'iPad']]) {
  await a.setViewport({ width: w, height: h, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }); await wait(200);
  const fit = await a.evaluate(() => { const box = document.querySelector('.xfer .modal-box').getBoundingClientRect(), x = document.querySelector('.xfer-x').getBoundingClientRect(), qr = document.querySelector('.xfer .qr').getBoundingClientRect();
    return { box: box.top >= 0 && box.bottom <= innerHeight + 1 && box.right <= innerWidth, x: x.top >= 0 && x.right <= innerWidth, qr: qr.top >= 0 && qr.bottom <= innerHeight && qr.width >= 180 ? Math.round(qr.width) : 0 }; });
  ok(fit.box && fit.x && fit.qr, `${name}: the card fits, ✕ and the whole QR code (${fit.qr}px) are on screen`);
  await a.screenshot({ path: `shots/qr-show-${w}x${h}.png` });
}
await a.setViewport({ width: 390, height: 844, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });

// the QR picture really holds the link
const read = await a.evaluate(async (svg) => {
  await loadVendor('jsQR');
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  await img.decode();
  const c = document.createElement('canvas'); c.width = c.height = 600;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0, 600, 600);
  const hit = jsQR(x.getImageData(0, 0, 600, 600).data, 600, 600);
  return hit && hit.data;
}, svg);
ok(read === url, 'the QR code decodes to the link');
await a.click('.xfer-x');
ok(!await a.$('.xfer'), '✕ closes the QR card');

// --- receiver 1: the camera app opens the link in the browser
const b1 = await page(NEW);
await b1.goto('about:blank');
await b1.goto(url.replace(OLD, NEW));
await b1.waitForFunction(() => location.search === '?play', { timeout: 8000 }).catch(() => null);
await wait(500);
ok(b1.dialogs.some(m => m.includes('Klai, Ema, Žan')), `asks before taking the detectives (${b1.dialogs[0]})`);
ok(JSON.stringify(await storageOf(b1)) === JSON.stringify(sent), 'the link brings every detective over unchanged');
ok(!b1.url().includes('prenos'), 'the code is removed from the address afterwards');

// --- receiver 2: "Skeniraj kodo" inside the game (Home Screen app), with a camera filming the QR code
const b2 = await page(NEW);
await b2.reload(); await wait(400);
await b2.evaluate((svg) => {
  navigator.mediaDevices.getUserMedia = async () => {
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    await img.decode();
    const c = document.createElement('canvas'); c.width = 1280; c.height = 720;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    const draw = () => { x.fillStyle = '#888'; x.fillRect(0, 0, 1280, 720); x.drawImage(img, 340, 60, 600, 600); };
    draw(); setInterval(draw, 100);
    return c.captureStream(10);
  };
  go('debrief');
}, svg);
await Promise.all([b2.waitForNavigation({ timeout: 10000 }).catch(() => null), b2.click('[data-act=qrScan]')]);
await b2.waitForFunction(() => location.search === '?play', { timeout: 8000 }).catch(() => null);
await wait(500);
ok(b2.dialogs.some(m => m.startsWith('Prenesem detektive')), 'scanning asks before taking the detectives');
ok(JSON.stringify(await storageOf(b2)) === JSON.stringify(sent), 'scanning brings every detective over unchanged');

// --- edge cases
const c = await page(NEW);
await c.evaluate(() => { localStorage.setItem('dp_profile_v1', JSON.stringify({ name: 'Ostane' })); });
await c.goto('about:blank');
await c.goto(NEW + '#prenos=zNotARealCode'); await wait(1200);
ok(c.dialogs.some(m => m.startsWith('Kode ni mogoče prebrati')), 'a broken link is refused');
ok(await c.evaluate(() => JSON.parse(localStorage.getItem('dp_profile_v1')).name) === 'Ostane', 'a broken link changes nothing');

await c.evaluate(() => { navigator.mediaDevices.getUserMedia = async () => { throw new Error('denied'); }; go('debrief'); });
await c.click('[data-act=qrScan]'); await wait(500);
ok(await c.$eval('#scanMsg', el => el.textContent.startsWith('Kamera ni na voljo')), 'no camera: the adult is told what to use instead');
await c.click('[data-x=close]');

await c.evaluate(() => {   // far too much data for one QR code
  let s = ''; for (let i = 0; i < 6000; i++) s += String.fromCharCode(33 + Math.floor(Math.random() * 90));
  localStorage.setItem('dp_letters_v1', JSON.stringify(s));
  go('debrief');
});
await c.click('[data-act=qrShow]'); await wait(1500);
ok(await c.$eval('.xfer', el => el.textContent.includes('preveč')), 'too much data: says to use Izvozi JSON');

ok(!errors.length, `no page errors ${errors}`);
await b.close();
