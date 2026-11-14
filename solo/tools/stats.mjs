// »📊 Analitika« for the producer's reading page (tools/read.mjs): page views from Cloudflare Web Analytics
// and the anonymous »Skrivnostne sobe« events from D1 (docs/EVENTS.md). Fetched when the page is built,
// with the producer's own `cf` login on this machine, so the page holds only the numbers, never a token.
//   node tools/stats.mjs      just the numbers in the terminal (a quick check that cf can read them)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ACCOUNT = 'fe8d1acf7d99092261dcfccae431277a';
const D1 = '429c1e8e-1b81-4afa-b038-196b57b2e941';   // bralni-dogodki (EU)
const HOST = 'bralnidetektivi.si';
const DAYS = 14;
const PATHS = [['/', 'Začetna stran'], ['/solo/', 'Glavna igra'], ['/kje-je-kdo/', 'Skrivnostne sobe'], ['/home/', 'Z ikone']];

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function cf(args) {
  const out = execFileSync('cf', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 60000 });
  return JSON.parse(out.slice(out.search(/[[{]/)));
}

// the puzzles' titles and people, straight from the game
function levels() {
  const html = fs.readFileSync(path.join(ROOT, 'kje-je-kdo/index.html'), 'utf8');
  const a = html.indexOf('const SVG'), b = html.indexOf('// LEVELS-END', a);
  return new Function(html.slice(a, b) + 'return LEVELS;')();
}

function pageViews() {
  const now = new Date(), from = new Date(now - DAYS * 864e5);
  const iso = d => d.toISOString().slice(0, 19) + 'Z';
  const q = (sql) => cf(['analytics', 'sql', 'post', '--scope-account-tag', ACCOUNT, '--time-range-start', iso(from), '--time-range-end', iso(now), '--query', sql]).data;
  const where = `WHERE requestHost IN ('${HOST}', 'www.${HOST}') AND bot = 0`;
  const daily = q(`SELECT toDate(timestamp) AS day, requestPath AS p, SUM(sampleInterval) AS views FROM events.rumPageloadEvents ${where} GROUP BY day, p ORDER BY day DESC LIMIT 500`);
  // a visit = a page load that didn't come from another page of the site
  const totals = q(`SELECT requestPath AS p, SUM(sampleInterval) AS views, SUM(IF(refererHost NOT IN ('${HOST}', 'www.${HOST}'), sampleInterval, 0)) AS visits FROM events.rumPageloadEvents ${where} GROUP BY p ORDER BY views DESC LIMIT 50`);
  return { daily, totals };
}

function events() {
  const sql = [
    // 0 per puzzle
    `SELECT puzzle, SUM(ev = 'start') AS started, SUM(ev = 'solved' AND json_extract(data, '$.first')) AS solved,
       SUM(ev = 'left') AS left_, SUM(ev = 'stuck') AS stuck,
       ROUND(AVG(CASE WHEN ev = 'solved' AND json_extract(data, '$.first') THEN json_extract(data, '$.hints') END), 1) AS helps,
       ROUND(AVG(CASE WHEN ev = 'solved' AND json_extract(data, '$.first') THEN json_extract(data, '$.wrongs') END), 1) AS mistakes,
       ROUND(AVG(CASE WHEN ev = 'solved' AND json_extract(data, '$.first') THEN sec END) / 60.0, 1) AS minutes
     FROM events WHERE puzzle IS NOT NULL GROUP BY puzzle ORDER BY puzzle`,
    // 1 where: stuck / left by people placed
    `SELECT puzzle, ev, placed, COUNT(*) AS n FROM events WHERE ev IN ('stuck', 'left') GROUP BY puzzle, ev, placed ORDER BY puzzle, placed`,
    // 2 helps (first press of each help)
    `SELECT puzzle, json_extract(data, '$.who') AS who, json_extract(data, '$.kind') AS kind, COUNT(*) AS n FROM events
     WHERE ev = 'hint' AND json_extract(data, '$.step') = 1 GROUP BY puzzle, who, kind ORDER BY n DESC LIMIT 12`,
    // 3 wrong taps
    `SELECT puzzle, json_extract(data, '$.who') AS who, json_extract(data, '$.kind') AS kind, COUNT(*) AS n FROM events
     WHERE ev = 'wrong' GROUP BY puzzle, who, kind ORDER BY n DESC LIMIT 12`,
    // 4 per day
    `SELECT day, SUM(ev = 'intro' AND json_extract(data, '$.first')) AS new_, COUNT(DISTINCT sid) AS sittings,
       SUM(ev = 'start') AS starts, SUM(ev = 'solved' AND json_extract(data, '$.first')) AS solves
     FROM events GROUP BY day ORDER BY day DESC LIMIT ${DAYS}`,
    // 5 intro, the first time
    `SELECT json_extract(data, '$.how') AS how, json_extract(data, '$.card') AS card, COUNT(*) AS n FROM events
     WHERE ev = 'intro' AND json_extract(data, '$.first') GROUP BY how, card ORDER BY n DESC`,
    // 6 how far devices get
    `SELECT json_extract(data, '$.done') AS done, COUNT(*) AS n FROM events WHERE ev = 'solved' AND json_extract(data, '$.first') GROUP BY done ORDER BY done`,
  ];
  const res = cf(['d1', 'query', D1, '--sql', sql.join(';\n')]);
  return res.map(r => r.results);
}

// ---- HTML
const day = d => { const [y, m, dd] = d.split('-'); return `${+dd}. ${+m}.`; };
const bar = (n, max) => `<span class="bar" style="width:${max ? Math.round(n / max * 100) : 0}%"></span>`;
const table = (head, rows) => `<table class="st"><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.join('')}</table>`;
const none = (t) => `<p class="empty">${t}</p>`;
const KIND = { clue: 'stavek ga izloči', maybe: 'stavek dovoli, a ni to polje', row: 'vrsta že zasedena', col: 'stolpec že zaseden',
  block: 'na oviro', taken: 'na zasedeno polje', answer: 'napačen krivec', cell: 'stavek → polja', line: 'vrsta/stolpec rabi nekoga', notes: 'zapiše možnosti' };
const HOW = { next: 'prebral do konca', skip: 'preskočil', close: 'zaprl ✕' };

function viewsHtml({ daily, totals }) {
  const known = new Set(PATHS.map(p => p[0]));
  const days = [...new Set(daily.map(r => r.day))].sort().reverse();
  const cell = (d, p) => daily.filter(r => r.day === d && (p ? r.p === p : !known.has(r.p))).reduce((n, r) => n + r.views, 0);
  const max = Math.max(1, ...days.map(d => daily.filter(r => r.day === d).reduce((n, r) => n + r.views, 0)));
  const rows = days.map(d => {
    const all = daily.filter(r => r.day === d).reduce((n, r) => n + r.views, 0);
    return `<tr><td>${day(d)}</td>${PATHS.map(([p]) => `<td class="n">${cell(d, p) || '·'}</td>`).join('')}<td class="n">${cell(d) || '·'}</td><td class="n b">${all}</td><td class="w">${bar(all, max)}</td></tr>`;
  });
  const tot = (p) => totals.filter(r => p ? r.p === p : !known.has(r.p)).reduce((a, r) => [a[0] + r.views, a[1] + r.visits], [0, 0]);
  const sum = [...PATHS.map(([p]) => tot(p)), tot()];
  rows.push(`<tr class="sum"><td>Skupaj ogledi</td>${sum.map(s => `<td class="n">${s[0]}</td>`).join('')}<td class="n b">${sum.reduce((n, s) => n + s[0], 0)}</td><td></td></tr>`);
  rows.push(`<tr class="sum"><td>Obiski</td>${sum.map(s => `<td class="n">${s[1]}</td>`).join('')}<td class="n b">${sum.reduce((n, s) => n + s[1], 0)}</td><td></td></tr>`);
  return table(['Dan', ...PATHS.map(p => `${p[1]}<small>${p[0]}</small>`), 'Drugo', 'Vse', ''], rows);
}

function eventsHtml(r, LV) {
  const [per, where, helps, wrongs, daily, intro, far] = r;
  const t = (id) => { const l = LV.find(x => x.id === id); return l ? `${id}. ${l.icon} ${esc(l.title)}` : id; };
  const who = (pz, id) => { const l = LV.find(x => x.id === pz); const p = l && l.people.find(x => x.id === id); return p ? `${p.face} ${esc(p.name)}` : esc(id || ''); };
  if (!per.length && !daily.length) return none('Dogodkov še ni. Prvi pridejo, ko kdo odpre Skrivnostne sobe.');
  let h = '<h4>Po ugankah</h4>' + table(['Uganka', 'Začeli', 'Rešili', 'Obupali', 'Zataknili', 'Pomoči', 'Napak', 'Minut'],
    LV.filter(l => per.some(p => p.puzzle === l.id)).map(l => { const p = per.find(x => x.puzzle === l.id);
      return `<tr><td>${t(l.id)}</td><td class="n">${p.started}</td><td class="n b">${p.solved}</td><td class="n">${p.left_}</td><td class="n">${p.stuck}</td><td class="n">${p.helps ?? '·'}</td><td class="n">${p.mistakes ?? '·'}</td><td class="n">${p.minutes ?? '·'}</td></tr>`; }));
  h += '<p class="note">Rešili = prvič na napravi. Pomoči, napak, minut = povprečje pri teh rešitvah. Zataknili = 90 s brez novega človeka na mreži.</p>';
  h += '<h4>Kje se zataknejo</h4>' + (where.length ? table(['Uganka', 'Postavljenih', 'Zataknili', 'Obupali'],
    [...new Set(where.map(w => `${w.puzzle}|${w.placed}`))].map(k => { const [pz, pl] = k.split('|').map(Number);
      const n = (ev) => where.filter(w => w.puzzle === pz && w.placed === pl && w.ev === ev).reduce((a, w) => a + w.n, 0);
      return `<tr><td>${t(pz)}</td><td class="n">${pl} / ${LV.find(l => l.id === pz)?.people.length ?? '?'}</td><td class="n">${n('stuck') || '·'}</td><td class="n">${n('left') || '·'}</td></tr>`; })) : none('Še nihče se ni zataknil.'));
  h += '<h4>Za koga največ prosijo za pomoč</h4>' + (helps.length ? table(['Uganka', 'Oseba', 'Vrsta koraka', 'Krat'],
    helps.map(x => `<tr><td>${t(x.puzzle)}</td><td>${who(x.puzzle, x.who)}</td><td>${KIND[x.kind] || esc(x.kind)}</td><td class="n">${x.n}</td></tr>`)) : none('Pomoči še ni.'));
  h += '<h4>Napačni tapi</h4>' + (wrongs.length ? table(['Uganka', 'Oseba', 'Kaj', 'Krat'],
    wrongs.map(x => `<tr><td>${t(x.puzzle)}</td><td>${who(x.puzzle, x.who)}</td><td>${KIND[x.kind] || esc(x.kind)}</td><td class="n">${x.n}</td></tr>`)) : none('Napak še ni.'));
  h += '<h4>Po dnevih</h4>' + table(['Dan', 'Novi igralci', 'Igranja', 'Začete uganke', 'Rešene'],
    daily.map(d => `<tr><td>${day(d.day)}</td><td class="n b">${d.new_}</td><td class="n">${d.sittings}</td><td class="n">${d.starts}</td><td class="n">${d.solves}</td></tr>`));
  h += '<p class="note">Novi igralci = »Kako se igra?« se je odprl sam (enkrat na napravo). Igranje = en obisk strani.</p>';
  if (intro.length) h += '<h4>»Kako se igra?« prvič</h4>' + table(['Kako', 'Na kartici', 'Krat'], intro.map(x => `<tr><td>${HOW[x.how] || esc(x.how)}</td><td class="n">${x.card} / 6</td><td class="n">${x.n}</td></tr>`));
  if (far.length) { const max = Math.max(...far.map(f => f.n));
    h += '<h4>Kako daleč pridejo</h4>' + table(['Rešenih ugank', 'Naprav', ''], far.map(f => `<tr><td class="n">${f.done}</td><td class="n">${f.n}</td><td class="w">${bar(f.n, max)}</td></tr>`)); }
  return h;
}

export const STATS_CSS = `
.stats{border-top:6px solid oklch(65% .12 160);margin:24px 0;padding-top:4px}
.st{margin:6px 0 4px;font-size:15px}.st th{font-size:13px;color:var(--mut);font-weight:600;vertical-align:bottom}.st th small{display:block;font-weight:400}
.st .n{text-align:right;font-variant-numeric:tabular-nums}.st .b{font-weight:700}.st .w{width:22%}.st .sum td{font-weight:600;border-top:2px solid var(--line)}
.bar{display:inline-block;height:10px;border-radius:5px;background:oklch(65% .12 160);min-width:2px}
.note{color:var(--mut);font-size:13px;margin:2px 0 8px}
@media (max-width:600px){.st{font-size:13px;display:block;overflow-x:auto}.st .w{display:none}}`;

export function statsSection() {
  const part = (title, fn) => { try { return fn(); } catch (e) { return none(`${title}: ni na voljo (${esc(String(e.message).split('\n')[0].slice(0, 160))}). Je cf prijavljen? <code>cf auth login</code>`); } };
  const LV = levels();
  return `<section class="stats" id="analitika">
  <h2>📊 Analitika</h2>
  <p class="meta">Zadnjih ${DAYS} dni, prebrano ob izdelavi strani (${new Date().toLocaleString('sl-SI')}). Brez botov. Vsebuje tudi naše lastne preizkuse strani.</p>
  <h3>Ogledi strani</h3>
  ${part('Ogledi', () => viewsHtml(pageViews()))}
  <p class="note">Ogled = vsako nalaganje strani. Obisk = prihod od drugod (ne s klikom znotraj strani). Unikatnih igralcev Cloudflare ne šteje.</p>
  <h3>Skrivnostne sobe</h3>
  ${part('Dogodki', () => eventsHtml(events(), LV))}
</section>`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const v = pageViews(), e = events();
  console.log('Ogledi po straneh:', v.totals);
  console.log('Po ugankah:', e[0]);
  console.log('Po dnevih:', e[4]);
}
