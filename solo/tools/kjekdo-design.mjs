// The design tool for »Skrivnostne sobe« (kje-je-kdo/index.html): from a drawn map (rooms, objects, where the
// missing thing is, who the people are) it searches for a placement and ONE sentence per person that pass the
// checker's rules (tools/kjekdo.mjs):
//   - exactly one placement; every sentence is needed (drop any one and there are several placements);
//   - a child gets there without guessing; a »row/column claim« step (a person whose cells all lie in one row
//     or column takes it from the others) happens between `claims[0]` and `claims[1]` times;
//   - »odprta polja« (open cells, the measure of thinking) lands in `band`;
//   - the culprit is the only person in the missing thing's room, and their sentence doesn't name that thing.
// It writes the sentences in Slovenian from the rule (draft: the slovenian-editor reads them) and prints the
// finished LEVELS entry to paste above `// LEVELS-END` in kje-je-kdo/index.html. Then run tools/kjekdo.mjs.
//
//   node tools/kjekdo-design.mjs <spec.mjs> [--n 3] [--seed 1] [--ms 20000] [--band 22,35] [--claims 1,1]   (several different answers, best first)
//
// The spec is `export default { ... }`:
//   id, date, group ('lahko'|'srednje'|'tezje'), icon, title, story, ask, win, why, heart   (text of the level)
//   rooms: ['RRRVV', ...]  names: { R: 'Rastlinjak' }   objects: { '0,1': 'stol', ... }   (as in LEVELS; objects must exist in OBJ)
//   room: 'R'              the room with the missing thing (its object is in `objects`, block + gone)
//   people: [{ id, name, she?, face }]   culprit: 'id'   (the culprit's cell must be the only one in `room`)
//   where: { R: 'v rastlinjaku' }       room → "in the …" phrase, for »je bil v …« and »ni bil v …«
//   forms: { stol: 'stolu' }            object → dative/locative (»na stolu«, »ob stolu«); sani → { on: 'saneh', ob: 'sanem' }
//   verbOn: { postelja: 'ležal' }       (optional) verb for »na X« when it isn't »sedel«
//   band: [22, 35]  claims: [1, 1]      wanted »odprta polja« and number of row/column claim steps
//   kinds: ['on','notOn','room','notRoom','beside','notBeside']   (optional) the rule kinds to draw from
//   noClue: 0|1            (optional) one person without a sentence (the leftover), default 0
//   maxKind: { notBeside: 2 }          (optional) at most this many sentences of a kind
//   label: { R: [0, 0] }   (optional) fixed label cells, otherwise the first free cell of the room
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const html = fs.readFileSync(path.join(ROOT, 'kje-je-kdo/index.html'), 'utf8');
const grab = (a, b) => html.slice(html.indexOf(a), html.indexOf(b, html.indexOf(a)));
const { OBJ } = new Function(grab('const SVG', 'const ROOM_COLORS') + 'return { OBJ };')();

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? +process.argv[i + 1] : d; };
const specFile = process.argv[2];
if (!specFile) { console.log('usage: node tools/kjekdo-design.mjs <spec.mjs> [--n 3] [--seed 1] [--ms 20000]'); process.exit(1); }
const S = (await import(pathToFileURL(path.resolve(specFile)).href)).default;
let seed = arg('seed', 1);
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const n = S.rooms.length, P = S.people, idx = [...Array(n).keys()];
const list = (k) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1].split(',').map(Number) : null; };
const band = list('band') || S.band || [0, 99], limit = { lahko: 0, srednje: 1, tezje: 4 }[S.group];
const claims = list('claims') || S.claims || (S.group === 'lahko' ? [0, 0] : [1, limit]);
const kinds = S.kinds || ['on', 'notOn', 'room', 'notRoom', 'beside', 'notBeside'];
const objAt = (r, c) => S.objects[r + ',' + c];
const free = (r, c) => !(objAt(r, c) && OBJ[objAt(r, c)].block);
const near = (r, c) => [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < n && b < n);
const fits = (u, r, c) => u.on ? objAt(r, c) === u.on : u.notOn ? objAt(r, c) !== u.notOn : u.room ? S.rooms[r][c] === u.room : u.notRoom ? S.rooms[r][c] !== u.notRoom
  : u.beside ? near(r, c).some(([a, b]) => objAt(a, b) === u.beside) : u.notBeside ? !near(r, c).some(([a, b]) => objAt(a, b) === u.notBeside) : true;
const cells = []; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (free(r, c)) cells.push([r, c]);
const objs = [...new Set(Object.values(S.objects))];
const seats = objs.filter(o => !OBJ[o].block), roomsIn = Object.keys(S.names);
const cg = P.findIndex(p => p.id === S.culprit);
const spotObjs = Object.entries(S.objects).filter(([k, v]) => OBJ[v].block && S.rooms[+k.split(',')[0]][+k.split(',')[1]] === S.room).map(([, v]) => v);
if (!spotObjs.length || cg < 0) throw new Error('the missing thing must be an object in room »' + S.room + '« and the culprit one of the people');

// every rule that could be written (the vacuous ones, true on every free cell, are dropped)
const allRules = [];
if (kinds.includes('on')) for (const o of seats) allRules.push({ on: o });
if (kinds.includes('notOn')) for (const o of seats) allRules.push({ notOn: o });
if (kinds.includes('room')) for (const r of roomsIn) allRules.push({ room: r });
if (kinds.includes('notRoom')) for (const r of roomsIn) allRules.push({ notRoom: r });
if (kinds.includes('beside')) for (const o of objs) allRules.push({ beside: o });
if (kinds.includes('notBeside')) for (const o of objs) allRules.push({ notBeside: o });
const rules = allRules.filter(u => { const k = cells.filter(([r, c]) => fits(u, r, c)).length; return k > 0 && k < cells.length; });
const kindOf = (u) => Object.keys(u)[0];

// the number of placements (stops at `cap`)
function count(cand, cap) {
  let found = 0; const order = cand.map((l, i) => i).sort((a, b) => cand[a].length - cand[b].length);
  const go = (k, ur, uc) => {
    if (found >= cap) return;
    if (k === order.length) { found++; return; }
    for (const [r, c] of cand[order[k]]) if (!ur.has(r) && !uc.has(c)) { ur.add(r); uc.add(c); go(k + 1, ur, uc); ur.delete(r); uc.delete(c); }
  };
  go(0, new Set(), new Set()); return found;
}
const memo = new Map();
const candOf = (rule) => { const k = JSON.stringify(rule); if (!memo.has(k)) memo.set(k, cells.filter(([r, c]) => fits(rule, r, c))); return memo.get(k); };

// the child's way through, as in the checker: direct steps first, then a row/column claim
function walk(rs) {
  let cand = rs.map(candOf);
  const open = cand.reduce((a, l, i) => a + (Object.keys(rs[i]).length && l.length > 1 ? l.length : 0), 0);
  const placed = P.map(() => null), steps = []; let hidden = 0;
  for (let g = 0; g < 100 && !placed.every(Boolean); g++) {
    const ur = new Set(placed.filter(Boolean).map(q => q[0])), uc = new Set(placed.filter(Boolean).map(q => q[1]));
    cand = cand.map((l, i) => placed[i] ? [placed[i]] : l.filter(([r, c]) => !ur.has(r) && !uc.has(c)));
    const i = cand.findIndex((l, i) => !placed[i] && l.length === 1);
    if (i >= 0) { placed[i] = cand[i][0]; steps.push(P[i].name); continue; }
    let moved = false;
    for (const axis of [0, 1]) for (let x = 0; x < n && !moved; x++) {
      if ((axis ? uc : ur).has(x)) continue;
      const who = cand.map((l, i) => !placed[i] && l.some(q => q[axis] === x) ? i : -1).filter(i => i >= 0);
      if (who.length === 1 && cand[who[0]].some(q => q[axis] !== x)) { cand[who[0]] = cand[who[0]].filter(q => q[axis] === x); hidden++; steps.push(`(${axis ? 'stolpec' : 'vrsta'} ${x + 1} → ${P[who[0]].name})`); moved = true; }
    }
    if (!moved) break;
  }
  return { ok: placed.every(Boolean), open, hidden, steps };
}

// Slovenian, from the rule
const form = (o, k) => { const f = (S.forms || {})[o]; if (!f) throw new Error(`forms: the case form of »${o}« is missing`); return typeof f === 'string' ? f : f[k]; };
const sentence = (p, u) => {
  const f = p.she ? 'a' : '', k = kindOf(u), v = u[k];
  if (k === 'on') { const verb = ((S.verbOn || {})[v] || 'sedel'); return `${p.name} je ${verb}${f} na ${form(v, 'on')}.`; }
  if (k === 'notOn') { const verb = ((S.verbOn || {})[v] || 'sedel'); return `${p.name} ni ${verb}${f} na ${form(v, 'on')}.`; }
  if (k === 'room') return `${p.name} je bil${f} ${S.where[v]}.`;
  if (k === 'notRoom') return `${p.name} ni bil${f} ${S.where[v]}.`;
  if (k === 'beside') return `${p.name} je stal${f} ob ${form(v, 'ob')}.`;
  if (k === 'notBeside') return `${p.name} ni stal${f} ob ${form(v, 'ob')}.`;
  return '';
};

// every placement: one person per row and column, on free cells, the culprit alone in the missing room
function perms(a) { return a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map(p => [x, ...p])); }
const PLACEMENTS = [];
for (const rows of perms(idx)) for (const cols of perms(idx)) {
  const at = rows.map((r, i) => [r, cols[i]]);
  if (at.every(([r, c]) => free(r, c)) && S.rooms[at[cg][0]][at[cg][1]] === S.room && !at.some(([r, c], i) => i !== cg && S.rooms[r][c] === S.room)) PLACEMENTS.push(at);
}
console.log(`// ${PLACEMENTS.length} possible placements`);
// a legal sentence for person i standing on `cell` (the culprit's must not point at the missing thing)
const rulesAt = (i, cell) => rules.filter(u => fits(u, cell[0], cell[1]) && (i !== cg || !(spotObjs.includes(u.beside) || spotObjs.includes(u.on)) && u.room !== S.room));
// how far a design is from passing: 0 = passes. Search is a hill climb on this (a random draw hardly ever passes).
function score(at, rs) {
  const tally = {}; let bad = 0;
  for (const u of rs) { const k = kindOf(u) || '-'; tally[k] = (tally[k] || 0) + 1; }
  if (S.maxKind) for (const k in S.maxKind) bad += Math.max(0, (tally[k] || 0) - S.maxKind[k]) * 5;
  const keys = rs.map(u => JSON.stringify(u)), clues = keys.filter(k => k !== '{}');
  bad += (clues.length - new Set(clues).size) * 5 + Math.max(0, rs.filter(u => !Object.keys(u).length).length - (S.noClue ? 1 : 0)) * 5;
  const cand = rs.map(candOf), cnt = count(cand, 40);
  if (cnt !== 1) return bad + 10 + cnt;
  const pa = walk(rs);
  if (!pa.ok) return bad + 10;
  bad += Math.max(0, band[0] - pa.open, pa.open - band[1]) / 2 + Math.max(0, claims[0] - pa.hidden, pa.hidden - claims[1]) * 4;
  for (let i = 0; i < n; i++) if (Object.keys(rs[i]).length && count(cand.map((l, j) => j === i ? cells : l), 2) < 2) bad += 6;   // a spare sentence
  return bad ? bad + 0.5 : 0;
}
const labelOf = (a) => {
  const out = {};
  for (const room of roomsIn) {
    const fixed = (S.label || {})[room]; if (fixed) { out[room] = fixed; continue; }
    const spot = []; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (S.rooms[r][c] === room && !objAt(r, c) && !a.at.some(q => q[0] === r && q[1] === c)) spot.push([r, c]);
    if (!spot.length) return null;   // no free cell for this label: the design is dropped (or give `label` in the spec)
    out[room] = spot[Math.floor(spot.length / 2)];
  }
  return out;
};
const want = arg('n', 3), deadline = Date.now() + arg('ms', 20000), found = [], seen = new Set();
let tries = 0;
while (found.length < want * 30 && Date.now() < deadline) {
  const at = pick(PLACEMENTS), blank = S.noClue ? Math.floor(rnd() * n) : -1;
  let rs = at.map((q, i) => i === blank && i !== cg ? {} : pick(rulesAt(i, q))), cur = score(at, rs);
  for (let step = 0; step < 600 && cur > 0 && Date.now() < deadline; step++, tries++) {
    const i = Math.floor(rnd() * n); if (i === blank && i !== cg) continue;
    const next = rs.map((u, j) => j === i ? pick(rulesAt(i, at[i])) : u), sc = score(at, next);
    if (sc <= cur || rnd() < 0.02) { rs = next; cur = sc; }
  }
  if (cur > 0) continue;
  if (labelOf({ at }) === null) continue;
  const pa = walk(rs), key = JSON.stringify([at, rs]); if (seen.has(key)) continue; seen.add(key); found.push({ at, rs, ...pa });
}
console.log(`// ${tries} tries, ${found.length} designs (band ${band}, claims ${claims})`);
if (!found.length) { console.log('// nothing found: widen the band, allow more kinds, or redraw the map'); process.exit(1); }
const mid = (band[0] + band[1]) / 2;
// the best are different in their sentences, near the middle of the band
const kindsOf = (a) => new Set(a.rs.map(kindOf)).size;   // more kinds of sentence reads better
found.sort((a, b) => kindsOf(b) - kindsOf(a) || Math.abs(a.open - mid) - Math.abs(b.open - mid));
const ruleStr = (u) => Object.keys(u).length ? `{ ${kindOf(u)}: '${Object.values(u)[0]}' }` : '{}';
const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
found.slice(0, want).forEach((a, k) => {
  console.log(`\n// ---- design ${k + 1}: odprta polja ${a.open}, row/column steps ${a.hidden}: ${a.steps.join(', ')}`);
  const lab = labelOf(a);
  console.log('  {');
  console.log(`    id: ${S.id}, date: ${q(S.date)}, group: ${q(S.group)}, icon: ${q(S.icon)}, title: ${q(S.title)},`);
  console.log(`    story: ${q(S.story)},`);
  console.log(`    rooms: [${S.rooms.map(q).join(', ')}],`);
  console.log(`    names: { ${Object.entries(S.names).map(([k2, v]) => `${k2}: ${q(v)}`).join(', ')} },`);
  console.log(`    labels: { ${Object.entries(lab).map(([k2, v]) => `${k2}: [${v.join(', ')}]`).join(', ')} },`);
  console.log(`    objects: { ${Object.entries(S.objects).map(([k2, v]) => `'${k2}': ${q(v)}`).join(', ')} },`);
  console.log('    people: [');
  P.forEach((p, i) => console.log(`      { id: ${q(p.id)}, name: ${q(p.name)}, ${p.she ? 'she: true, ' : ''}face: ${q(p.face)}, clue: ${q(Object.keys(a.rs[i]).length ? sentence(p, a.rs[i]) : (S.noClueText || {})[p.id] || '???')}, rule: ${ruleStr(a.rs[i])}, at: [${a.at[i].join(', ')}] },`));
  console.log('    ],');
  console.log(`    room: ${q(S.room)}, ask: ${q(S.ask)}, culprit: ${q(S.culprit)},`);
  console.log(`    win: ${q(S.win)}, why: ${q(S.why)},`);
  console.log(`    heart: ${q(S.heart)},`);
  console.log('  },');
});
