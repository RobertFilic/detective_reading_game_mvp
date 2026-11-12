// A reading copy of every text the child sees, for the producer to read before a season ships:
//   node tools/read.mjs              every season, opens shots/read.html in the browser
//   node tools/read.mjs sneg pokal   only these files (ids from FILES)
//   node tools/read.mjs --no-open    just write the page
// Reads the case data straight from index.html, so it always shows what is in the game now,
// unreleased seasons included. Lines over 8 words are marked (level A).
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { ROOT, loadData } from './lib.mjs';

const args = process.argv.slice(2);
const only = args.filter(a => !a.startsWith('--'));
const { CASES, CHARACTERS, FILES, COMING } = loadData();

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const name = id => CHARACTERS[id] ? `${CHARACTERS[id].animal} ${CHARACTERS[id].name}` : id;
// the longest sentence in a line, in words
const words = s => Math.max(...String(s).replace(/(\d)-(?=\d)/g, '$1').split(/[.!?…]+/).map(x => x.replace(/[»«„“",:;()–—-]/g, ' ').split(/\s+/).filter(w => /\p{L}|\d/u.test(w)).length));
const line = s => `<span class="t">${esc(s)}</span>${words(s) > 8 ? ` <span class="long">${words(s)} besed</span>` : ''}`;
const ROLE = { evidence: 'dokaz', partial: 'izjava krivca', distractor: 'vaba', clear: 'alibi', neutral: '' };
const STEP = { call: '📞 Klic', scene: '🔍 Prizorišče', ask: '💬 Zasliševanje', solve: '✅ Rešitev', words: '🔤 Iskanka',
  lock: '🔐 Ključavnica', order: '🗂️ Časovnica', cipher: '🔣 Šifra', torn: '📄 Strgan listek', lie: '❗ Ugovor',
  herring: '🧭 Napačna sled?', when: '⏰ Kdaj?', intro: 'Uvod', story: 'Zgodba' };

// every string inside a puzzle or step object, with the key it sits under
function strings(v, path = []) {
  if (typeof v === 'string') return v.length > 1 || path.length ? [[path.join(' › '), v]] : [];
  if (Array.isArray(v)) return v.flatMap((x, i) => strings(x, typeof x === 'string' && v.length > 1 && v.every(y => typeof y === 'string') && v.length <= 3 && v[0].length <= 3 ? path : [...path, i + 1]));
  if (v && typeof v === 'object') return Object.entries(v).flatMap(([k, x]) => strings(x, [...path, k]));
  return [];
}
const block = (title, v) => {
  const rows = strings(v).filter(([, s]) => /\p{L}/u.test(s) && !/^(s\d+|before|during|after)$/.test(s));
  return rows.length ? `<h4>${title}</h4><table class="kv">${rows.map(([k, s]) => `<tr><th>${esc(k)}</th><td>${line(s)}</td></tr>`).join('')}</table>` : '';
};
const list = (title, a) => a?.length ? `<h4>${title}</h4><ol>${a.map(s => `<li>${line(Array.isArray(s) ? s.join(' ') : s)}</li>`).join('')}</ol>` : '';

function renderCase(c) {
  const steps = c.steps || ['intro', 'story', 'solve'];
  const sent = (c.sentences || []).map(s => {
    const src = s.who ? `<b>${esc(name(s.who))}</b>${s.ask ? `<div class="ask">❓ ${esc(s.ask)}</div>` : ''}`
      : s.obj ? `${s.obj} ${esc(s.label || '')}${s.dark ? ' 🔦' : ''}${s.rub ? ' 🖍️' : ''}` : '';
    const role = [ROLE[s.role] ?? s.role, s.clears && `izloči: ${name(s.clears)}`, s.from && `iz: ${s.from}`, s.points && `kaže na: ${name(s.points)}`, s.when].filter(Boolean).join(' · ');
    return `<tr class="r-${s.role || 'neutral'}"><td class="id">${s.id}</td><td class="src">${src}</td><td>${line(s.text)}</td><td class="role">${esc(role)}</td></tr>`;
  }).join('');
  return `<article class="case" id="${c.id}">
  <header><span class="no">${c.final ? '⭐ Veliki primer' : `Primer ${c.no}`}</span><span class="meta">${esc(c.id)} · ${esc(c.type)}, stopnja ${c.rung} · raven ${esc(c.level || '')}</span></header>
  <h3>${c.sticker || ''} ${esc(c.place || '')}</h3>
  <p class="q">${line(c.question || '')}</p>
  <p class="cast">Koraki: ${steps.map(s => STEP[s] || s).join(' → ')}</p>
  <p class="cast">Osumljenci: ${(c.suspects || []).map(name).join(', ')}${c.witnesses?.length ? ` · priče: ${c.witnesses.map(name).join(', ')}` : ''} · <span class="spoiler">krivec: <b>${esc(c.culprit ? name(c.culprit) : '—')}</b></span></p>
  ${c.client ? `<h4>📞 Kliče ${esc(name(c.client))}</h4>` : ''}${c.call ? `<ol>${c.call.map(s => `<li>${line(s)}</li>`).join('')}</ol>` : ''}
  ${c.film ? list('🎥 Posnetki', c.film.map(f => `${f[0]} ${f[1]}`)) : ''}
  ${c.intro ? list('Uvod', [].concat(c.intro)) : ''}${c.story ? list('Zgodba', [].concat(c.story)) : ''}
  ${['words', 'lock', 'order', 'cipher', 'torn', 'lie', 'herring', 'when'].map(k => c[k] ? block(STEP[k], c[k]) : '').join('')}
  ${sent ? `<h4>Stavki</h4><table class="sent">${sent}</table>` : ''}
  ${c.h1 ? `<h4>💡 Namig</h4><p>${line(c.h1)}</p>` : ''}
  ${list('🎉 Razkritje', c.reveal)}
  ${c.caught || c.excuse ? `<h4>📰 Časopis</h4><p>Ujeli smo: ${esc(c.caught || '')}</p>${c.excuse ? `<p>»${line(c.excuse)}«</p>` : ''}` : ''}
  ${c.card?.think ? `<h4>📌 Kartica na tabli</h4><p>${esc(c.card.icon || '')} ${line(c.card.think)} <span class="meta">(stavek ${esc(c.card.sid || '')})</span></p>` : ''}
  ${list('✉️ Pismo', c.letter)}
</article>`;
}

function renderFile(f) {
  const cs = CASES.filter(c => c.file === f.id).sort((a, b) => a.no - b.no);
  const { id, icon, hue, title, cast, opens, season, ...rest } = f;
  return `<section class="file" id="f-${f.id}" style="--h:${hue ?? 250}">
  <h2>${f.icon || ''} ${esc(f.title)}</h2>
  <p class="meta">${esc(f.id)}${opens ? ` · odpre se ${opens}` : ''}${cast ? ` · ${cast.map(name).join(', ')}` : ''}</p>
  ${block('Sezona', rest)}
  ${cs.length ? `<nav class="toc">${cs.map(c => `<a href="#${c.id}">${c.final ? '⭐' : c.no}. ${esc(c.question)}</a>`).join('')}</nav>${cs.map(renderCase).join('')}`
    : '<p class="empty">Primerov še ni. Pisci jih napišejo v seji B.</p>'}
</section>`;
}

const files = [...FILES, ...COMING.filter(f => f.id && !FILES.some(x => x.id === f.id))]
  .filter(f => !only.length || only.includes(f.id));
const total = files.reduce((n, f) => n + CASES.filter(c => c.file === f.id).length, 0);
const html = `<!doctype html><html lang="sl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bralni detektivi · besedila</title><style>
:root{--bg:#faf7f2;--fg:#222;--mut:#777;--line:#e4ddd2;--card:#fff}
@media (prefers-color-scheme:dark){:root{--bg:#1c1b19;--fg:#eee;--mut:#999;--line:#3a3733;--card:#262421}}
body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.5 system-ui,sans-serif}
main{max-width:860px;margin:auto;padding:16px}
.top{position:sticky;top:0;background:var(--bg);border-bottom:1px solid var(--line);padding:8px 16px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;z-index:2;font-size:15px}
.top a{color:inherit} label{margin-left:auto;cursor:pointer}
.file{border-top:6px solid oklch(65% .12 var(--h));margin:24px 0;padding-top:4px}
h2{margin:8px 0 0} h3{margin:4px 0} h4{margin:14px 0 4px;font-size:15px;color:var(--mut)}
.meta,.cast{color:var(--mut);font-size:14px;margin:2px 0}
.case{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 16px;margin:16px 0}
.case header{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}
.no{font-weight:700;color:oklch(55% .14 var(--h))}
.q{font-size:20px;font-weight:600;margin:6px 0}
table{border-collapse:collapse;width:100%} td,th{padding:4px 6px;vertical-align:top;border-bottom:1px solid var(--line);text-align:left}
.kv th{font-weight:400;color:var(--mut);font-size:13px;width:28%}
.sent .id{color:var(--mut);font-size:13px;width:2.5em}.sent .src{width:24%;font-size:15px}.ask{color:var(--mut);font-size:14px}
.role{color:var(--mut);font-size:13px;width:18%}
.r-evidence td:nth-child(3){background:oklch(92% .08 145 / .5)}.r-distractor td:nth-child(3){background:oklch(92% .08 60 / .45)}
.r-clear td:nth-child(3){background:oklch(92% .06 240 / .45)}
.long{font-size:12px;background:#e0533a;color:#fff;border-radius:6px;padding:0 5px;white-space:nowrap}
.toc{display:flex;flex-direction:column;font-size:15px}.toc a{color:inherit}
.empty{color:var(--mut);font-style:italic} ol{margin:0;padding-left:1.4em}
body.hide .spoiler,body.hide .role,body.hide .r-evidence td,body.hide .r-distractor td,body.hide .r-clear td{background:none!important}
body.hide .spoiler,body.hide .role{visibility:hidden}
@media (max-width:600px){.sent .src{width:auto}.sent tr{display:grid;grid-template-columns:2.5em 1fr}.sent td{border:0}.sent tr{border-bottom:1px solid var(--line)}.kv th{width:35%}}
</style></head><body>
<div class="top"><b>📚 Besedila</b>${files.map(f => `<a href="#f-${f.id}">${f.icon || ''} ${esc(f.title)}</a>`).join('')}
<label><input type="checkbox" onchange="document.body.classList.toggle('hide',this.checked)"> brez rešitev</label></div>
<main><p class="meta">${total} primerov · iz solo/index.html, ${new Date().toLocaleString('sl-SI')}. Zelena = dokaz, rumena = vaba, modra = alibi. Rdeča oznaka = več kot 8 besed.</p>
${files.map(renderFile).join('')}</main></body></html>`;

const out = join(ROOT, 'shots');
mkdirSync(out, { recursive: true });
const path = join(out, 'read.html');
writeFileSync(path, html);
console.log(`✔ ${total} primerov → ${path}`);
if (!args.includes('--no-open')) execFile('open', [path]);
