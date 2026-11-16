// Bold negation words (`neg: true`, the ❄️ sneg season): every »ni«, »brez«, »nobene«… is bold in sneg sentences,
// innocent lines too, never inside another word (»nič« yes, »Nina«/»sani« no), and other seasons stay plain.
import './brief-auto.mjs';
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 150) => new Promise(r => setTimeout(r, ms));

const p = await b.newPage();
const errors = []; p.on('pageerror', e => errors.push(e.message));
await p.evaluateOnNewDocument(() => { const D = Date, t = new D('2026-11-19T09:00:00').getTime() - D.now();
  window.Date = class extends D { constructor(...a) { super(...(a.length ? a : [D.now() + t])); } static now() { return D.now() + t; } }; });
await p.setViewport({ width: 390, height: 844, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
await p.goto('http://localhost:8765/solo/?play');
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('dp_save_version', '4'); localStorage.setItem('dp_tutorial_done', 'true');
  localStorage.setItem('dp_profile_v1', JSON.stringify({ av: '🕵🏽‍♀️', g: 'f', sk: '🐶', name: 'Ana', id: '1234' })); });
await p.reload(); await wait(400);

const bold = (caseId, text) => p.evaluate((id, t) => { S.c = caseById(id); const d = document.createElement('div'); d.innerHTML = names(t);
  return [...d.querySelectorAll('.ng')].map(e => e.textContent); }, caseId, text);

ok(JSON.stringify(await bold('n1', 'Ni snega na Lukovih saneh.')) === '["Ni"]', 'sneg: »Ni« at the start is bold');
ok(JSON.stringify(await bold('n1', 'Streha je brez snega. Nihče ne ve.')) === '["brez","Nihče","ne"]', 'sneg: brez, Nihče, ne are bold');
ok(JSON.stringify(await bold('n1', 'Na saneh je sneg. Nina ima nič.')) === '["nič"]', 'sneg: no bold inside »saneh«, »Nina«, »ima«');
ok(JSON.stringify(await bold('n5', 'Bor meketa na vse, razen na Pio.')) === '["razen"]', 'sneg: »razen« is bold (n5 proof)');
ok(await p.evaluate(() => { const d = document.createElement('div'); d.innerHTML = '<b class="ng">ni</b><b class="nm">Pia</b>'; document.body.append(d);
  const [g, n] = [...d.children].map(e => getComputedStyle(e).textDecorationLine); d.remove(); return g.includes('underline') && !n.includes('underline'); }),
  'negation words are underlined, names are not (they look different)');
ok(JSON.stringify(await bold('p1', 'Pia ni bila na igrišču.')) === '[]', 'pokal: negation stays plain');

// every sneg sentence with a negation word shows it bold on screen
const missed = await p.evaluate(() => CASES.filter(c => c.file === 'sneg').flatMap(c => { S.c = c;
  return c.sentences.filter(s => /(?<!\p{L})(ni|brez|ne|nobene)(?!\p{L})/iu.test(s.text) && !names(s.text).includes('class="ng"')).map(s => c.id + ' ' + s.id); }));
ok(!missed.length, `sneg: every negation sentence has a bold word ${missed}`);
const count = await p.evaluate(() => CASES.filter(c => c.file === 'sneg').reduce((n, c) => { S.c = c; return n + c.sentences.filter(s => names(s.text).includes('class="ng"')).length; }, 0));
ok(count >= 6, `sneg: ${count} sentences carry a bold negation`);

ok(!errors.length, `no page errors ${errors}`);
await b.close();
