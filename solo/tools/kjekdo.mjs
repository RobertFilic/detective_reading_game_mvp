// The checker for »Kje je kdo?« (kje-je-kdo/index.html): for every puzzle it tries every placement
// (one person per row and column, never on a blocking object) and proves that
//   1. the sentences give exactly one placement, and it is the one written in `at`;
//   2. no sentence is spare: without any one of them there is more than one placement;
//   3. a child can get there without guessing: again and again, a person whose sentence leaves one free
//      cell goes there, or a row or column that only one person can still use is theirs. »Lahko« puzzles
//      need only the first kind of step, the others at most a few of the second;
//   4. the culprit is the only person in the room with the missing thing, and their own sentence doesn't
//      name that thing;
//   5. labels sit in their room on no one's spot, 4 puzzles per group, ids 1, 2, 3 … in order.
//   node tools/kjekdo.mjs        prints ✔/✘ per check and each puzzle's steps, exits 1 on a failure
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const html = fs.readFileSync(path.join(ROOT, 'kje-je-kdo/index.html'), 'utf8');
const grab = (a, b) => html.slice(html.indexOf(a), html.indexOf(b, html.indexOf(a)));
const { OBJ, LEVELS, GROUPS } = new Function(grab('const SVG', '// LEVELS-END') + 'return { OBJ, LEVELS, GROUPS };')();
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };

function perms(a) { return a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map(p => [x, ...p])); }

ok(LEVELS.every((l, i) => l.id === i + 1), `ids run 1 to ${LEVELS.length}`);
for (const [g, label] of GROUPS) ok(LEVELS.filter(l => l.group === g).length === 4, `${label}: 4 puzzles`);

for (const L of LEVELS) {
  const n = L.rooms.length, tag = `uganka ${L.id}`;
  const objAt = (r, c) => L.objects[r + ',' + c];
  const near = (r, c) => [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < n && b < n);
  const fits = (u, r, c) => u.on ? objAt(r, c) === u.on : u.notOn ? objAt(r, c) !== u.notOn : u.room ? L.rooms[r][c] === u.room : u.notRoom ? L.rooms[r][c] !== u.notRoom
    : u.beside ? near(r, c).some(([a, b]) => objAt(a, b) === u.beside) : u.notBeside ? !near(r, c).some(([a, b]) => objAt(a, b) === u.notBeside) : true;
  const free = (r, c) => !(objAt(r, c) && OBJ[objAt(r, c)].block);
  const idx = [...Array(n).keys()], P = L.people;
  ok(P.length === n && L.rooms.every(row => row.length === n), `${tag}: ${n} × ${n} with ${P.length} people`);
  ok(Object.values(L.objects).every(o => OBJ[o]) && Object.keys(L.names).every(k => L.rooms.join('').includes(k)), `${tag}: every object and room is known`);
  ok(new Set(P.map(p => p.id)).size === n && P.some(p => p.id === L.culprit), `${tag}: people have their own ids, the culprit is one of them`);
  const all = (skip) => {
    const out = [];
    for (const rows of perms(idx)) for (const cols of perms(idx))
      if (P.every((p, i) => free(rows[i], cols[i]) && (p.id === skip || fits(p.rule, rows[i], cols[i])))) out.push(P.map((p, i) => [rows[i], cols[i]]));
    return out;
  };
  const sols = all(null);
  ok(sols.length === 1 && P.every((p, i) => sols[0][i][0] === p.at[0] && sols[0][i][1] === p.at[1]), `${tag}: exactly one placement, the one in »at« (${sols.length} found)`);
  for (const p of P) if (Object.keys(p.rule).length) { const m = all(p.id).length; ok(m > 1, `${tag}: »${p.clue}« is needed (${m} placements without it)`); }

  // a child's way through
  let cand = P.map(p => { const l = []; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (free(r, c) && fits(p.rule, r, c)) l.push([r, c]); return l; });
  const placed = P.map(() => null), steps = [];
  let hidden = 0;
  for (let guard = 0; guard < 100 && !placed.every(Boolean); guard++) {
    const usedR = new Set(placed.filter(Boolean).map(q => q[0])), usedC = new Set(placed.filter(Boolean).map(q => q[1]));
    cand = cand.map((l, i) => placed[i] ? [placed[i]] : l.filter(([r, c]) => !usedR.has(r) && !usedC.has(c)));
    const i = cand.findIndex((l, i) => !placed[i] && l.length === 1);
    if (i >= 0) { placed[i] = cand[i][0]; steps.push(P[i].name); continue; }
    let moved = false;
    for (const axis of [0, 1]) for (let x = 0; x < n && !moved; x++) {
      if ((axis ? usedC : usedR).has(x)) continue;
      const who = cand.map((l, i) => !placed[i] && l.some(q => q[axis] === x) ? i : -1).filter(i => i >= 0);
      if (who.length === 1 && cand[who[0]].some(q => q[axis] !== x)) { cand[who[0]] = cand[who[0]].filter(q => q[axis] === x); hidden++; steps.push(`(${axis ? 'stolpec' : 'vrsta'} ${x + 1} → ${P[who[0]].name})`); moved = true; }
    }
    if (!moved) break;
  }
  const limit = { lahko: 0, srednje: 1, tezje: 4 }[L.group];
  ok(placed.every(Boolean) && hidden <= limit, `${tag}: a child gets there without guessing, ${hidden} row/column step${hidden === 1 ? '' : 's'} (≤ ${limit}): ${steps.join(', ')}`);

  const inRoom = P.filter(p => L.rooms[p.at[0]][p.at[1]] === L.room);
  ok(inRoom.length === 1 && inRoom[0].id === L.culprit, `${tag}: only ${L.culprit} is in ${L.names[L.room]}`);
  const spot = Object.entries(L.objects).filter(([k, v]) => OBJ[v].block && L.rooms[+k.split(',')[0]][+k.split(',')[1]] === L.room).map(([, v]) => v);
  const cr = P.find(p => p.id === L.culprit).rule;
  ok(spot.length >= 1 && !spot.includes(cr.beside || cr.on) && cr.room !== L.room, `${tag}: the missing thing's spot is in ${L.names[L.room]}, and the culprit's sentence doesn't point at it`);
  ok(Object.entries(L.labels).every(([room, [r, c]]) => L.rooms[r][c] === room && !P.some(p => p.at[0] === r && p.at[1] === c)) && Object.keys(L.labels).length === Object.keys(L.names).length, `${tag}: every room has a label in it, on no one's spot`);
  ok(L.story && L.heart && L.win && L.why && L.ask, `${tag}: story, question, answer and the reason why`);
}
