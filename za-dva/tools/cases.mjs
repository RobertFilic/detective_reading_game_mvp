// Usage:
//   node tools/cases.mjs          check every case against the template rules
//   node tools/cases.mjs clips    print "clipId<TAB>text" for every line to record
import { loadData } from './lib.mjs';

const { LEVEL_RULES, CHARACTERS, CASES, clipList } = loadData();

if (process.argv[2] === 'clips') {
  for (const [id, text] of clipList()) console.log(`${id}\t${text}`);
  process.exit(0);
}

const SEATS = ['top', 'bottom'];
const ROLES = new Set(['neutral', 'evidence', 'distractor']);
const RUNGS = { 1: 'join', 2: 'infer', 3: 'elim' };
const words = (t) => t.replace(/[»«„“”"',.!?:;–—]/g, ' ').split(/\s+/).filter(Boolean).length;
let problems = 0;
const fail = (id, msg) => { problems++; console.log(`✘ ${id}: ${msg}`); };

for (const c of CASES) {
  const R = LEVEL_RULES[c.level];
  if (!R) { fail(c.id, `unknown level ${c.level}`); continue; }
  if (RUNGS[c.no] !== c.rung) fail(c.id, `case ${c.no} must be rung ${RUNGS[c.no]}, not ${c.rung}`);
  if (c.suspects.length !== R.suspects) fail(c.id, `${c.suspects.length} suspects (level ${c.level} needs ${R.suspects})`);
  for (const id of c.suspects) if (!CHARACTERS[id]) fail(c.id, `unknown character ${id}`);
  if (!c.suspects.includes(c.culprit)) fail(c.id, `culprit ${c.culprit} is not a suspect`);

  const allIds = SEATS.flatMap(seat => c.cards[seat].map(s => s.id));
  if (new Set(allIds).size !== allIds.length) fail(c.id, 'duplicate sentence ids across the two cards');

  let distractors = 0;
  for (const seat of SEATS) {
    const ss = c.cards[seat];
    const where = `${c.id}/${seat}`;
    const ids = new Set(ss.map(s => s.id));
    if (ss.length < R.sentences[0] || ss.length > R.sentences[1]) {
      fail(where, `${ss.length} sentences (level ${c.level} allows ${R.sentences.join('–')} per card)`);
    }
    for (const s of ss) {
      if (!ROLES.has(s.role)) fail(where, `${s.id} has unknown role ${s.role}`);
      const w = words(s.text);
      if (w > R.maxWords) fail(where, `${s.id} has ${w} words (max ${R.maxWords}): ${s.text}`);
    }
    const evidence = ss.filter(s => s.role === 'evidence');
    if (evidence.length !== 1) {
      fail(where, `${evidence.length} evidence sentences (need exactly 1 per card)`);
    } else {
      const i = ss.indexOf(evidence[0]);
      if (i === 0 || i === ss.length - 1) fail(where, 'evidence sentence is first or last');
      for (const k of ['h2', 'h3']) {
        if (!c[k][seat] || !c[k][seat].includes(evidence[0].id)) fail(where, `${k} does not include the evidence sentence`);
      }
    }
    const d = ss.filter(s => s.role === 'distractor').length;
    distractors += d;
    if (d < R.distractors[0] || d > R.distractors[1]) fail(where, `${d} distractors (allowed ${R.distractors.join('–')} per card)`);
    const h2 = c.h2[seat] || [], h3 = c.h3[seat] || [];
    if (h2.length < 2 || h2.length > 3) fail(where, 'h2 must list 2–3 sentences');
    if (h3.length !== 2) fail(where, 'h3 must list 2 sentences');
    for (const id of [...h2, ...h3]) if (!ids.has(id)) fail(where, `hint references ${id}, which is not on this card`);

    // The point of the game: no card is enough on its own.
    const alone = (c.alone && c.alone[seat]) || [];
    if (!alone.includes(c.culprit)) fail(where, 'alone must include the culprit');
    if (alone.length < 2) fail(where, `card alone leaves ${alone.length} suspect(s); it must leave at least 2`);
    for (const id of alone) if (!c.suspects.includes(id)) fail(where, `alone lists ${id}, who is not a suspect`);
  }
  if (distractors < 1) fail(c.id, 'each case needs at least one distractor');
  if (c.rung === 'elim' && c.alone) {
    const both = c.alone.top.filter(id => c.alone.bottom.includes(id));
    if (both.length !== 1 || both[0] !== c.culprit) fail(c.id, `elimination leaves [${both.join(', ')}], expected only ${c.culprit}`);
  }
  if (!c.question || !c.tip || !c.reveal || !c.reveal.length) fail(c.id, 'question, tip and reveal are required');
}

for (const no of [1, 2, 3]) {
  for (const level of ['A', 'B']) {
    const n = CASES.filter(c => c.no === no && c.level === level).length;
    if (n !== 1) fail(`case ${no}`, `${n} cases for level ${level} (need exactly 1)`);
  }
}

const clips = clipList();
if (new Set(clips.map(([id]) => id)).size !== clips.length) fail('clips', 'duplicate clip ids');

console.log(problems ? `\n${problems} problem(s).` : `✔ ${CASES.length} cases OK · ${clips.length} audio clips to record`);
process.exit(problems ? 1 : 0);
