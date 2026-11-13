// The checker for »Kje je kdo?« (kje-je-kdo/index.html): for every level it tries every placement
// (one person per row and column, never on a blocking object) and proves that
//   1. the sentences give exactly one placement, and it is the one written in `at`;
//   2. no sentence is spare: without any one of them there is more than one placement;
//   3. the culprit is the only person in the room with the missing thing, and `order` names everyone.
//   node tools/kjekdo.mjs        prints ✔/✘ per check, exits 1 on a failure
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const html = fs.readFileSync(path.join(ROOT, 'kje-je-kdo/index.html'), 'utf8');
const grab = (a, b) => html.slice(html.indexOf(a), html.indexOf(b, html.indexOf(a)));
const { OBJ, LEVELS } = new Function(grab('const OBJ', 'const ROOM_COLORS') + grab('const LEVELS', '// LEVELS-END') + 'return { OBJ, LEVELS };')();
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };

function perms(a) { return a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map(p => [x, ...p])); }

for (const L of LEVELS) {
  const n = L.rooms.length, tag = `uganka ${L.id}`;
  const objAt = (r, c) => L.objects[r + ',' + c];
  const near = (r, c) => [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < n && b < n);
  const fits = (rule, r, c) => rule.on ? objAt(r, c) === rule.on : rule.room ? L.rooms[r][c] === rule.room : rule.notRoom ? L.rooms[r][c] !== rule.notRoom
    : rule.beside ? near(r, c).some(([a, b]) => objAt(a, b) === rule.beside) : rule.notBeside ? !near(r, c).some(([a, b]) => objAt(a, b) === rule.notBeside) : true;
  const free = (r, c) => !(objAt(r, c) && OBJ[objAt(r, c)].block);
  const idx = [...Array(n).keys()], P = L.people;
  ok(P.length === n && L.rooms.every(row => row.length === n), `${tag}: ${n} × ${n} with ${P.length} people`);
  ok(Object.values(L.objects).every(o => OBJ[o]), `${tag}: every object is known`);
  const solve = (skip) => {
    const out = [];
    for (const rows of perms(idx)) for (const cols of perms(idx)) {
      if (P.every((p, i) => free(rows[i], cols[i]) && (p.id === skip || fits(p.rule, rows[i], cols[i])))) out.push(P.map((p, i) => [rows[i], cols[i]]));
    }
    return out;
  };
  const all = solve(null);
  ok(all.length === 1 && P.every((p, i) => all[0][i][0] === p.at[0] && all[0][i][1] === p.at[1]), `${tag}: exactly one placement, the one in »at« (${all.length} found)`);
  for (const p of P) if (Object.keys(p.rule).length) { const m = solve(p.id).length; ok(m > 1, `${tag}: »${p.clue}« is needed (${m} placements without it)`); }
  const inRoom = P.filter(p => L.rooms[p.at[0]][p.at[1]] === L.room);
  ok(inRoom.length === 1 && inRoom[0].id === L.culprit, `${tag}: only ${L.culprit} is in ${L.names[L.room]}`);
  ok(Object.values(L.objects).some(o => OBJ[o].block && Object.entries(L.objects).some(([key, v]) => v === o && L.rooms[+key[0]][+key[2]] === L.room)), `${tag}: the missing thing's spot is in ${L.names[L.room]}`);
  ok([...L.order].sort().join() === P.map(p => p.id).sort().join(), `${tag}: the hint order names everyone once`);
  ok(Object.entries(L.labels).every(([room, [r, c]]) => L.rooms[r][c] === room && !P.some(p => p.at[0] === r && p.at[1] === c)), `${tag}: every room label sits in its room, on no one's spot`);
}
