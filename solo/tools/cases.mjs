// Usage:
//   node tools/cases.mjs          check every case against the template rules
//   node tools/cases.mjs clips    print "clipId<TAB>text" for every line to record
import { loadData } from './lib.mjs';

const { LEVEL_RULES, CHARACTERS, CASES, FILES, RUNG, clipList } = loadData();

if (process.argv[2] === 'clips') {
  for (const [id, text] of clipList()) console.log(`${id}\t${text}`);
  process.exit(0);
}

const ROLES = new Set(['neutral', 'evidence', 'partial', 'distractor', 'clear']);
const words = (t) => t.replace(/[»«„“”"',.!?:;–—]/g, ' ').split(/\s+/).filter(Boolean).length;
let problems = 0;
const fail = (id, msg) => { problems++; console.log(`✘ ${id}: ${msg}`); };

const inRange = (n, [lo, hi]) => n >= lo && n <= hi;

// A step case (call → scene or ask → solve): in a scene every sentence hides behind an object; every suspect
// but the culprit has exactly one alibi sentence (role clear) that names them; the proof names
// only the culprit; at most one object is dark; the card (corkboard) names no suspect.
const NAME = Object.fromEntries(Object.entries(CHARACTERS).map(([id, ch]) => [id, new RegExp(`(^|[^\\p{L}])(${ch.re})(?![\\p{L}])`, 'u')]));
for (const [id, ch] of Object.entries(CHARACTERS)) if (!ch.re) fail(id, 'character needs a name pattern (re)');
const PRONOUN = /\b(mu|ji|njen\w*|njegov\w*|je imel|je imela)\b/;
const named = (text) => Object.keys(NAME).filter(id => NAME[id].test(text));
const STEPS = new Set(['call', 'scene', 'ask', 'solve']);
function checkSteps(c) {
  const ss = c.sentences;
  if (c.type !== 'elim') fail(c.id, 'step cases are type elim');
  for (const st of c.steps) if (!STEPS.has(st)) fail(c.id, `unknown step ${st}`);
  if (c.steps.includes('call') && (!CHARACTERS[c.client] || !c.call || !c.call.length)) fail(c.id, 'a call needs client and call lines');
  if (c.client && c.suspects.includes(c.client)) fail(c.id, 'the client is not a suspect');
  if (c.steps.includes('scene')) for (const s of ss) if (!s.obj || !s.label) fail(c.id, `${s.id} needs obj and label (where it is found)`);
  // questioning: every answer has who said it and the question; everyone gets asked
  if (c.steps.includes('ask')) {
    for (const s of ss) {
      if (!c.suspects.includes(s.who) || !s.ask) fail(c.id, `${s.id} needs who (a suspect) and ask (the question)`);
      else if (words(s.ask) > LEVEL_RULES[c.level].maxWords) fail(c.id, `${s.id}: the question is too long`);
    }
    for (const id of c.suspects) if (!ss.some(s => s.who === id)) fail(c.id, `nobody asks ${id} anything`);
  }
  if (ss.filter(s => s.dark).length > 1) fail(c.id, 'at most one dark object');
  for (const id of c.suspects) {
    const al = ss.filter(s => s.clears === id);
    if (id === c.culprit && al.length) fail(c.id, 'the culprit has no true alibi');
    if (id !== c.culprit && al.length !== 1) fail(c.id, `suspect ${id} needs exactly one alibi sentence (clears: '${id}')`);
  }
  for (const s of ss) {
    if ((s.role === 'clear') !== !!s.clears) fail(c.id, `${s.id}: role clear goes with clears`);
    if (s.clears && !named(s.text).includes(s.clears)) fail(c.id, `${s.id}: the alibi must name ${s.clears}`);
  }
  if (c.card) {
    const s = ss.find(x => x.id === c.card.sid);
    if (!s) fail(c.id, `card points at missing ${c.card.sid}`);
    else if (named(s.text).some(id => c.suspects.includes(id))) fail(c.id, 'the corkboard card names no suspect');
  }
  if (c.caught === undefined && c.excuse) fail(c.id, 'excuse without caught');
}
for (const c of CASES) {
  const R = LEVEL_RULES[c.level];
  if (!R) { fail(c.id, `unknown level ${c.level}`); continue; }
  if (!RUNG[c.type]) fail(c.id, `unknown type ${c.type} (${Object.keys(RUNG).join(', ')})`);
  const ss = c.sentences;
  const ids = new Set(ss.map(s => s.id));
  if (ids.size !== ss.length) fail(c.id, 'duplicate sentence ids');
  if (!inRange(ss.length, R.sentences)) fail(c.id, `${ss.length} sentences (level ${c.level} allows ${R.sentences.join('–')})`);
  for (const s of ss) {
    if (!ROLES.has(s.role)) fail(c.id, `${s.id} has unknown role ${s.role}`);
    const w = words(s.text);
    if (w > R.maxWords) fail(c.id, `${s.id} has ${w} words (max ${R.maxWords}): ${s.text}`);
  }
  if (!inRange(c.suspects.length, R.suspects)) fail(c.id, `${c.suspects.length} suspects (level ${c.level} allows ${R.suspects.join('–')})`);
  for (const id of c.suspects) if (!CHARACTERS[id]) fail(c.id, `unknown character ${id}`);
  if (!c.suspects.includes(c.culprit)) fail(c.id, `culprit ${c.culprit} is not a suspect`);

  const pair = c.type === 'pair';
  const evidence = ss.filter(s => s.role === 'evidence');
  if (evidence.length !== (pair ? 2 : 1)) fail(c.id, `${evidence.length} evidence sentences (${c.type} needs ${pair ? 2 : 1})`);
  const lines = [c.h1, ...(c.call || []), ...(c.letter || []), ...(c.excuse ? [c.excuse] : []), ...(c.card && c.card.think ? [c.card.think] : [])];
  for (const t of lines.flatMap(l => l.split(/(?<=[.!?…])\s+(?=\p{Lu})/u))) if (words(t) > R.maxWords) fail(c.id, `${words(t)} words (max ${R.maxWords}): ${t}`);
  if (c.steps) { checkSteps(c); continue; }
  for (const k of ['h2', 'h3']) for (const e of evidence) if (!c[k].includes(e.id)) fail(c.id, `${k} does not include evidence ${e.id}`);
  const distractors = ss.filter(s => s.role === 'distractor').length;
  if (!inRange(distractors, R.distractors)) fail(c.id, `${distractors} distractors (level ${c.level} allows ${R.distractors.join('–')})`);
  const partials = ss.filter(s => s.role === 'partial').length;
  const wantPartial = c.type === 'slip' || c.type === 'alibi' ? 1 : 0;
  if (partials !== wantPartial) fail(c.id, `${partials} partial sentences (${c.type} needs ${wantPartial}: the culprit's own claim)`);
  if (c.h2.length !== (pair ? 4 : 3)) fail(c.id, `h2 must list ${pair ? 4 : 3} sentences`);
  if (c.h3.length !== (pair ? 3 : 2)) fail(c.id, `h3 must list ${pair ? 3 : 2} sentences`);
  for (const k of ['h2', 'h3']) for (const id of c[k]) if (!ids.has(id)) fail(c.id, `${k} references missing ${id}`);
  if (!c.question || !c.h1 || !c.reveal || !c.reveal.length) fail(c.id, 'question, h1 and reveal are required');
}

// Play order and the ladder, per file: case numbers run 1, 2, 3, … without gaps; the rungs
// climb (never go down), from a fact case to a final two-proof case. A twist (an animal
// of the place did it) appears at most once per file; otherwise the culprit is one of the cast.
const fileIds = FILES.map(f => f.id);
for (const c of CASES) if (!fileIds.includes(c.file)) fail(c.id, `unknown file ${c.file}`);
for (const f of FILES) {
  const inFile = CASES.filter(c => c.file === f.id);
  if (f.season) {
    // a season is built case by case: numbers run 1, 2, 3, … and every case pins a card
    inFile.forEach((c, i) => { if (c.no !== i + 1) fail(c.id, 'case numbers must run 1, 2, 3, …'); });
    for (const c of inFile) if (!c.card) fail(c.id, 'a season case pins a card to the corkboard (card)');
    if (!f.mystery) fail(f.id, 'a season needs its mystery question');
    continue;
  }
  const nos = [...new Set(inFile.map(c => c.no))].sort((x, y) => x - y);
  if (!nos.length) fail(f.id, 'file has no cases');
  nos.forEach((no, i) => { if (no !== i + 1) fail(`${f.id} ${no}`, 'case numbers must run 1, 2, 3, … without gaps'); });
  for (const no of nos) {
    const byLevel = (level) => inFile.filter(c => c.no === no && c.level === level);
    const a = byLevel('A'), b = byLevel('B');
    if (a.length !== 1) fail(`${f.id} ${no}`, `${a.length} cases at level A (need exactly 1)`);
    if (b.length > 1) fail(`${f.id} ${no}`, 'more than one case at level B');
    if (a[0] && b[0] && (a[0].type !== b[0].type || a[0].culprit !== b[0].culprit || a[0].question !== b[0].question)) {
      fail(`${f.id} ${no}`, 'levels A and B must share type, culprit and question');
    }
  }
  const ladder = nos.map(no => inFile.find(c => c.no === no && c.level === 'A')).filter(Boolean);
  if (ladder[0] && ladder[0].type !== 'fact') fail(f.id, 'an adventure starts with a fact case');
  ladder.forEach((c, i) => { if (i && c.rung < ladder[i - 1].rung) fail(c.id, `rung ${c.rung} after rung ${ladder[i - 1].rung}: the ladder must not go down`); });
  const last = ladder[ladder.length - 1];
  if (!last || !last.final || last.type !== 'pair') fail(f.id, 'an adventure ends with a final two-proof case (final: true, type: pair)');
  if (inFile.some(c => c.final && c !== last && c.no !== last.no)) fail(f.id, 'the final case must be the last one');
  if (new Set(ladder.filter(c => c.twist).map(c => c.no)).size > 1) fail(f.id, 'at most one twist case per adventure');
  for (const c of inFile) {
    if (c.twist && f.cast.includes(c.culprit)) fail(c.id, 'a twist culprit is not one of the cast');
    if (!c.twist && !f.cast.includes(c.culprit)) fail(c.id, `culprit ${c.culprit} is not in the cast (mark twist: true?)`);
  }

  // Variety, so the child can't learn a pattern instead of reading:
  // – the proof sits early, in the middle and late across the adventure (by thirds);
  // – no two cases have the same shape (roles in order);
  // – the decoy comes straight before the proof in at most one case;
  // – the number of decoys changes, and the final case is the longest.
  const third = (c, s) => Math.min(2, Math.floor(3 * c.sentences.indexOf(s) / c.sentences.length));
  const thirds = new Set(ladder.flatMap(c => c.sentences.filter(s => s.role === 'evidence').map(s => third(c, s))));
  if (thirds.size < 3) fail(f.id, `the proof is never ${['early', 'in the middle', 'late'].filter((_, i) => !thirds.has(i)).join(' or ')} in a story`);
  const shapes = new Map();
  for (const c of ladder) {
    const shape = c.sentences.map(s => s.role[0]).join('');
    if (shapes.has(shape)) fail(c.id, `same shape as ${shapes.get(shape)} (${shape})`);
    shapes.set(shape, c.id);
  }
  const decoyFirst = ladder.filter(c => c.sentences.some((s, i) => s.role === 'evidence' && i && c.sentences[i - 1].role === 'distractor'));
  if (decoyFirst.length > 1) fail(f.id, `the decoy comes right before the proof in ${decoyFirst.map(c => c.id).join(', ')} (at most one)`);
  if (new Set(ladder.map(c => c.sentences.filter(s => s.role === 'distractor').length)).size < 2) fail(f.id, 'every case has the same number of decoys');
  if (last && ladder.some(c => c.sentences.length > last.sentences.length)) fail(f.id, 'the final case should be the longest');
}

// Solvability: the evidence must point at the culprit and nobody else.
// Names are matched in any case form (Bine/Bineta/Binetu, Zala/Zalo, …). At level B the
// evidence may use a pronoun; then the sentence just before it must name the culprit.
for (const c of CASES) {
  const ss = c.sentences;
  for (const id of c.suspects) {
    if (!ss.some(s => NAME[id].test(s.text))) fail(c.id, `suspect ${id} never appears in the story`);
  }
  // A pair: one proof names the culprit (and no other suspect), the other names no suspect,
  // so neither is enough alone.
  if (c.type === 'pair') {
    const evs = ss.filter(s => s.role === 'evidence');
    const who = evs.map(s => named(s.text).filter(id => c.suspects.includes(id)));
    if (who.some(w => w.some(id => id !== c.culprit))) fail(c.id, `a proof names [${who.flat().join(', ')}], expected only ${c.culprit}`);
    if (who.filter(w => w.length).length !== 1) fail(c.id, 'in a pair exactly one proof names the culprit, the other names no suspect');
  }
  const ev = c.type === 'pair' ? null : ss.find(s => s.role === 'evidence');
  if (ev) {
    const inEv = named(ev.text).filter(id => c.suspects.includes(id));
    if (inEv.length) {
      if (inEv.length !== 1 || inEv[0] !== c.culprit) fail(c.id, `evidence names [${inEv.join(', ')}], expected only ${c.culprit}`);
    } else {
      const prev = ss[ss.indexOf(ev) - 1];
      const before = prev ? named(prev.text).filter(id => c.suspects.includes(id)) : [];
      if (c.level !== 'B' || !PRONOUN.test(ev.text)) fail(c.id, 'evidence does not name the culprit (pronouns only at level B)');
      else if (before.length !== 1 || before[0] !== c.culprit) fail(c.id, `pronoun in evidence should refer to ${c.culprit}, but the sentence before names [${before.join(', ')}]`);
    }
  }
  const partial = ss.find(s => s.role === 'partial');
  if (partial && !named(partial.text).includes(c.culprit)) fail(c.id, 'the partial sentence must be said by the culprit');
}

const clips = clipList();
if (new Set(clips.map(([id]) => id)).size !== clips.length) fail('clips', 'duplicate clip ids');

console.log(problems ? `\n${problems} problem(s).` : `✔ ${CASES.length} cases OK · ${clips.length} audio clips to record`);
process.exit(problems ? 1 : 0);
