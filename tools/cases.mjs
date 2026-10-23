// Usage:
//   node tools/cases.mjs          check every case against the template rules
//   node tools/cases.mjs clips    print "clipId<TAB>text" for every line to record
import { loadData } from './lib.mjs';

const { LEVEL_RULES, CHARACTERS, CASES, clipList } = loadData();

if (process.argv[2] === 'clips') {
  for (const [id, text] of clipList()) console.log(`${id}\t${text}`);
  process.exit(0);
}

const ROLES = new Set(['neutral', 'evidence', 'partial', 'distractor']);
const words = (t) => t.replace(/[»«„“”"',.!?:;–—]/g, ' ').split(/\s+/).filter(Boolean).length;
let problems = 0;
const fail = (id, msg) => { problems++; console.log(`✘ ${id}: ${msg}`); };

for (const c of CASES) {
  const R = LEVEL_RULES[c.level];
  if (!R) { fail(c.id, `unknown level ${c.level}`); continue; }
  const ss = c.sentences;
  const ids = new Set(ss.map(s => s.id));
  if (ids.size !== ss.length) fail(c.id, 'duplicate sentence ids');
  if (ss.length < R.sentences[0] || ss.length > R.sentences[1]) {
    fail(c.id, `${ss.length} sentences (level ${c.level} allows ${R.sentences.join('–')})`);
  }
  for (const s of ss) {
    if (!ROLES.has(s.role)) fail(c.id, `${s.id} has unknown role ${s.role}`);
    const w = words(s.text);
    if (w > R.maxWords) fail(c.id, `${s.id} has ${w} words (max ${R.maxWords}): ${s.text}`);
  }
  if (c.suspects.length !== R.suspects) fail(c.id, `${c.suspects.length} suspects (level ${c.level} needs ${R.suspects})`);
  for (const id of c.suspects) if (!CHARACTERS[id]) fail(c.id, `unknown character ${id}`);
  if (!c.suspects.includes(c.culprit)) fail(c.id, `culprit ${c.culprit} is not a suspect`);

  const evidence = ss.filter(s => s.role === 'evidence');
  if (evidence.length !== 1) {
    fail(c.id, `${evidence.length} evidence sentences (need exactly 1)`);
  } else {
    const i = ss.indexOf(evidence[0]);
    if (i === 0 || i === ss.length - 1) fail(c.id, 'evidence sentence is first or last');
    for (const k of ['h2', 'h3']) {
      if (!c[k].includes(evidence[0].id)) fail(c.id, `${k} does not include the evidence sentence`);
    }
  }
  const distractors = ss.filter(s => s.role === 'distractor').length;
  if (distractors < R.distractors[0] || distractors > R.distractors[1]) {
    fail(c.id, `${distractors} distractors (level ${c.level} allows ${R.distractors.join('–')})`);
  }
  const partials = ss.filter(s => s.role === 'partial').length;
  if (partials > 1 || (partials && c.rung !== 3)) fail(c.id, 'partial sentences are only allowed in rung 3, at most 1');
  if (c.h2.length !== 3) fail(c.id, 'h2 must list 3 sentences');
  if (c.h3.length !== 2) fail(c.id, 'h3 must list 2 sentences');
  for (const k of ['h2', 'h3']) for (const id of c[k]) if (!ids.has(id)) fail(c.id, `${k} references missing ${id}`);
  if (!c.question || !c.h1 || !c.reveal || !c.reveal.length) fail(c.id, 'question, h1 and reveal are required');
}

for (const rung of [1, 2, 3]) {
  for (const level of ['A', 'B']) {
    const n = CASES.filter(c => c.rung === rung && c.level === level).length;
    if (n !== 1) fail(`rung ${rung}`, `${n} cases for level ${level} (need exactly 1)`);
  }
}

const clips = clipList();
if (new Set(clips.map(([id]) => id)).size !== clips.length) fail('clips', 'duplicate clip ids');

console.log(problems ? `\n${problems} problem(s).` : `✔ ${CASES.length} cases OK · ${clips.length} audio clips to record`);
process.exit(problems ? 1 : 0);
