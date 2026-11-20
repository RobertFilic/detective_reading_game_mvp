// The validation's analytics (docs/marketing/ANALYTICS.md, docs/EVENTS.md): the device's own sittings (`dp_visits_v1`)
// and the `sitting` event, where a device came from (`?l=a07`, `?ref=`), the start page's events (`land`, `cta`,
// `install`), how adults come in (`adult`) and the parent's 30 seconds (`survey`). And the Worker's allowlist: every
// field any page sends must be on it, or the server drops it without a word.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 300) => new Promise(r => setTimeout(r, ms));
const B = 'http://localhost:8765';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const worker = fs.readFileSync(path.join(ROOT, 'worker/index.js'), 'utf8');
const setOf = (name) => new Set([...worker.slice(worker.indexOf(`const ${name} = new Set([`), worker.indexOf(']);', worker.indexOf(`const ${name} = new Set([`))).matchAll(/'([a-z_]+)'/g)].map(m => m[1]));
const GAMES = setOf('GAMES'), EVENTS = setOf('EVENTS'), DATA = setOf('DATA');
const all = [];   // every event any page sent in this test

async function open(url, store = {}, o = {}) {
  const p = await b.newPage();
  p.errors = []; p.on('pageerror', e => p.errors.push(e.message));
  p.evs = []; p.on('request', r => { if (r.url().endsWith('/api/e')) { try { const e = JSON.parse(r.postData()); p.evs.push(e); all.push(e); } catch (e) {} } });
  await p.setViewport({ width: 390, height: 844, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await p.goto(B + (o.first || '/zasebnost/'));   // a page without the shared script, so no sitting starts before the test's own
  await p.evaluate((s) => { localStorage.clear(); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, store);
  await p.goto(B + url); await wait(500);
  return p;
}
const visits = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('dp_visits_v1')));
const ev = (p, name) => p.evs.filter(e => e.ev === name);
const kid = { dp_save_version: '4', dp_tutorial_done: 'true', dp_profile_v1: JSON.stringify({ av: '🕵🏽‍♀️', g: 'f', sk: '🦊', name: 'Nika', id: '1234' }) };

// a leaflet scan: the start page with ?l=a07
{
  const p = await open('/?l=A07');
  const v = await visits(p), today = await p.evaluate(() => DP.today());
  ok(v.n === 1 && v.first === today && v.src === 'a07' && v.srcAt === today && ['a', 'b'].includes(v.v), 'a leaflet scan: sitting 1, the code kept (a07), a variant drawn');
  const s = ev(p, 'sitting')[0], l = ev(p, 'land')[0];
  ok(s && s.game === 'web' && s.data.n === 1 && s.data.days === 0 && s.data.wk === 0 && s.data.fw === true && s.data.src === 'a07' && s.data.g === 'web'
    && s.data.wd >= 1 && s.data.wd <= 7 && s.data.hb >= 0 && s.data.hb <= 7 && !('gap' in s.data) && !('pm' in s.data), 'the sitting event: number, age, week, weekday, part of the day, source; no gap on the first');
  ok(l && l.data.src === 'a07' && l.data.v === v.v && l.data.pwa === false, '»land«: the source, the variant, not from the Home Screen');
  ok(!JSON.stringify(p.evs).match(/20\d\d-\d\d-\d\d/), 'no dates are sent');
  await p.$eval('#igra-primeri', e => e.addEventListener('click', ev => ev.preventDefault()));
  await p.$eval('#igra-primeri', e => e.click()); await wait(100);
  await p.$eval('#play', e => e.addEventListener('click', ev => ev.preventDefault()));
  await p.$eval('#play', e => e.click()); await wait(100);
  ok(ev(p, 'cta').map(e => e.data.which).join() === 'solo,hero' && ev(p, 'cta').every(e => e.data.v === v.v), '»cta«: which button (solo, hero) and the variant');
  await p.$eval('#installBtn', e => e.click()); await wait(100);
  ok(ev(p, 'install').some(e => ['sheet', 'prompt'].includes(e.data.how)) && ev(p, 'cta').some(e => e.data.which === 'install'), '»install«: the install dialog or the steps sheet opened');
  // the same sitting: no new sitting event, the source stays even with another link
  await p.goto(B + '/?ref=fb1'); await wait(400);
  ok(ev(p, 'sitting').length === 1 && (await visits(p)).src === 'a07', 'same sitting: one sitting event; the first source wins');
  // 31 minutes later: sitting 2, with the gap and the minutes of the one before
  await p.evaluate(() => { const v = JSON.parse(localStorage.getItem('dp_visits_v1')); v.last = Date.now() - 31 * 60000; v.ms = 12 * 60000; localStorage.setItem('dp_visits_v1', JSON.stringify(v)); });
  await p.goto(B + '/'); await wait(400);
  const s2 = ev(p, 'sitting')[1];
  ok(s2 && s2.data.n === 2 && s2.data.gap === 0 && s2.data.pm === 12 && s2.data.fw === false && s2.data.src === 'a07', 'after 30 minutes: sitting 2, gap 0 days, the last one took 12 minutes, not the first in its week');
  // 9 days later, then 70 days later
  await p.evaluate(() => { const v = JSON.parse(localStorage.getItem('dp_visits_v1')); const d = (n) => { const x = new Date(); x.setDate(x.getDate() - n); return DP.today().slice(0, 0) + x.toISOString().slice(0, 10); };
    Object.assign(v, { first: d(9), day: d(2), last: Date.now() - 2 * 864e5 }); localStorage.setItem('dp_visits_v1', JSON.stringify(v)); });
  await p.goto(B + '/'); await wait(400);
  const s3 = ev(p, 'sitting')[2];
  ok(s3 && s3.data.n === 3 && s3.data.days === 9 && s3.data.wk === 1 && s3.data.fw === true && s3.data.gap === 2, '9 days on: days 9, week 1 (the first sitting in it), 2 days since the last');
  await p.evaluate(() => { const v = JSON.parse(localStorage.getItem('dp_visits_v1')); const x = new Date(); x.setDate(x.getDate() - 70); v.srcAt = x.toISOString().slice(0, 10); v.last = Date.now() - 31 * 60000; localStorage.setItem('dp_visits_v1', JSON.stringify(v)); });
  await p.goto(B + '/?ref=knjiznica'); await wait(400);
  ok((await visits(p)).src === 'knjiznica', 'after 60 days the old source is dropped and a new one counts');
  await p.goto(B + '/?l=zz9&ref=a'); await wait(300);
  ok((await visits(p)).src === 'knjiznica', 'a bad code or a too-short ref is ignored');
  ok(!p.errors.length, 'start page: no page errors ' + p.errors.join('|'));
  await p.close();
}

// a sitting that starts in a game, and how adults come in
{
  const p = await open('/solo/?play', kid);
  ok(ev(p, 'sitting').length === 1 && ev(p, 'sitting')[0].game === 'solo' && ev(p, 'sitting')[0].data.g === 'solo', 'a sitting that starts in the cases: sent from solo');
  await p.evaluate(() => ACTIONS.toDebrief()); await wait(200);
  ok(ev(p, 'adult').some(e => e.data.how === 'debrief'), '»adult«: the adult overview opened');
  await p.evaluate(() => { try { ACTIONS.exportLog(); } catch (e) {} }); await wait(100);
  ok(ev(p, 'adult').some(e => e.data.how === 'export'), '»adult«: export');
  ok(!(await p.$('.survey')), 'no parent questions yet (1 sitting, no season)');
  await p.close();
  const q = await open('/kje-je-kdo/', kid);
  ok(ev(q, 'sitting').length === 1 && ev(q, 'sitting')[0].game === 'sobe' && ev(q, 'sitting')[0].data.g === 'sobe', 'a sitting that starts in the rooms: sent from the rooms');
  await q.close();
}

// the parent's 30 seconds: after 5 sittings, again after each finished season
{
  const p = await open('/solo/?play', { ...kid, dp_visits_v1: JSON.stringify({ n: 5, last: Date.now(), first: '2026-11-01', day: '2026-11-20', v: 'a' }) });
  await p.evaluate(() => ACTIONS.toDebrief()); await wait(200);
  ok(await p.$('.survey') && (await p.$$('.survey-q')).length === 4, '5 sittings: four questions in the adult overview');
  ok(await p.$$eval('.survey-a .btn', els => els.every(e => e.getBoundingClientRect().height >= 44)), 'answers ≥ 44 px');
  await p.$eval('.survey-a [data-q="skupaj"][data-a="2"]', e => e.click()); await wait(200);
  const s = ev(p, 'survey')[0];
  ok(s && s.data.q === 'skupaj' && s.data.a === 2 && s.data.n === 5 && Object.keys(s.data).length === 3, '»survey«: question, answer, sitting number; nothing else');
  ok((await p.$$('.survey-q')).length === 3, 'the answered question goes, the others stay');
  await p.$eval('[data-act="surveyNo"]', e => e.click()); await wait(200);
  ok(!(await p.$('.survey')), '»Ne zdaj« closes it');
  await p.evaluate(() => { localStorage.setItem('dp_played_v1', JSON.stringify(casesIn('bip').map(caseKey))); render(); }); await wait(200);
  ok(await p.$('.survey'), 'a finished season: offered again');
  for (const q of ['skupaj', 'vredno', 'priporocil', 'skrb']) await p.$eval(`.survey-a [data-q="${q}"]`, e => e.click());
  await wait(200);
  ok(!(await p.$('.survey')) && ev(p, 'survey').length === 5, 'all four answered: the card goes until the next season');
  ok(!p.errors.length, 'no page errors ' + p.errors.join('|'));
  await p.close();
}

// the Worker keeps every field the pages send
{
  const bad = [];
  for (const e of all) {
    if (!GAMES.has(e.game)) bad.push(`game ${e.game}`);
    if (!EVENTS.has(e.ev)) bad.push(`event ${e.ev}`);
    for (const k of Object.keys(e.data || {})) if (!DATA.has(k)) bad.push(`${e.ev}.${k}`);
    for (const v of Object.values(e.data || {})) if (!(typeof v === 'boolean' || (Number.isInteger(v) && v >= 0 && v <= 9999) || (typeof v === 'string' && /^[a-z0-9_-]{1,24}$/i.test(v)))) bad.push(`${e.ev} value ${v}`);
  }
  ok(all.length > 20 && !bad.length, `the Worker's allowlist keeps every game, event, field and value sent here (${all.length} events) ${[...new Set(bad)].join(', ')}`);
}
await b.close();
