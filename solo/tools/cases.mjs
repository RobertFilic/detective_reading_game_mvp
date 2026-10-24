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

// Play order: every case number exists once per level, A and B tell the same story,
// and cases 1–3 climb the ladder (rung 1, 2, 3).
const nos = [...new Set(CASES.map(c => c.no))].sort((x, y) => x - y);
nos.forEach((no, i) => { if (no !== i + 1) fail(`case ${no}`, 'case numbers must run 1, 2, 3, … without gaps'); });
for (const no of nos) {
  const pair = ['A', 'B'].map(level => CASES.filter(c => c.no === no && c.level === level));
  pair.forEach((cs, i) => { if (cs.length !== 1) fail(`case ${no}`, `${cs.length} cases for level ${'AB'[i]} (need exactly 1)`); });
  const [a, b] = pair.map(cs => cs[0]);
  if (a && b && (a.rung !== b.rung || a.culprit !== b.culprit || a.question !== b.question)) {
    fail(`case ${no}`, 'levels A and B must share rung, culprit and question');
  }
  if (no <= 3 && a && a.rung !== no) fail(`case ${no}`, `the first three cases must be rungs 1, 2, 3 in order`);
}

// Solvability: the evidence must point at the culprit and nobody else.
// Names are matched in any case form (Bine/Bineta/Binetu, Zala/Zalo, …). At level B the
// evidence may use a pronoun; then the sentence just before it must name the culprit.
const NAME = {
  bine: /\bBine(ta|tu|tom)?\b/, zala: /\bZal(a|o|e|i)\b/, jure: /\bJure(ta|tu|tom)?\b/,
  neza: /\bNež(a|o|e|i)\b/, babica: /\bBabic(a|o|e|i)\b/,
};
const PRONOUN = /\b(mu|ji|njen\w*|njegov\w*|je imel|je imela)\b/;
const named = (text) => Object.keys(NAME).filter(id => NAME[id].test(text));
for (const c of CASES) {
  const ss = c.sentences;
  for (const id of c.suspects) {
    if (!ss.some(s => NAME[id].test(s.text))) fail(c.id, `suspect ${id} never appears in the story`);
  }
  const ev = ss.find(s => s.role === 'evidence');
  if (!ev) continue;
  const inEv = named(ev.text).filter(id => c.suspects.includes(id));
  if (inEv.length) {
    if (inEv.length !== 1 || inEv[0] !== c.culprit) fail(c.id, `evidence names [${inEv.join(', ')}], expected only ${c.culprit}`);
  } else {
    const prev = ss[ss.indexOf(ev) - 1];
    const before = named(prev.text).filter(id => c.suspects.includes(id));
    if (c.level !== 'B' || !PRONOUN.test(ev.text)) fail(c.id, 'evidence does not name the culprit (pronouns only at level B)');
    else if (before.length !== 1 || before[0] !== c.culprit) fail(c.id, `pronoun in evidence should refer to ${c.culprit}, but the sentence before names [${before.join(', ')}]`);
  }
  const partial = ss.find(s => s.role === 'partial');
  if (partial && !named(partial.text).includes(c.culprit)) fail(c.id, 'the partial sentence must be said by the culprit');
}

const clips = clipList();
if (new Set(clips.map(([id]) => id)).size !== clips.length) fail('clips', 'duplicate clip ids');

console.log(problems ? `\n${problems} problem(s).` : `✔ ${CASES.length} cases OK · ${clips.length} audio clips to record`);
process.exit(problems ? 1 : 0);
