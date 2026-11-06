// Usage:
//   node tools/cases.mjs          check every case against the template rules
//   node tools/cases.mjs clips    print "clipId<TAB>text" for every line to record
import { loadData } from './lib.mjs';

const { LEVEL_RULES, CHARACTERS, CASES, FILES, COMING, RUNG, clipList } = loadData();

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
const STEPS = new Set(['call', 'scene', 'ask', 'words', 'lock', 'order', 'cipher', 'torn', 'lie', 'herring', 'when', 'solve']);
const PUZZLES = ['words', 'lock', 'order', 'cipher', 'torn'];
// where a sentence is found: a puzzle or UGOVOR gives it (from), an answer (ask), else an object in the scene
const stepOf = (s) => s.from || (s.ask ? 'ask' : 'scene');
const sentencesOf = (t) => t.split(/(?<=[.!?…])\s+(?=\p{Lu})/u);
const tooLong = (c, what, lines) => { for (const t of lines.filter(Boolean).flatMap(sentencesOf)) if (words(t) > LEVEL_RULES[c.level].maxWords) fail(c.id, `${what}: ${words(t)} words (max): ${t}`); };
const letters = (t) => [...t.toUpperCase()].filter(ch => /\p{L}/u.test(ch)).join('');
// 🔤 word search: Slovenian capitals only (Č/Š/Ž one cell; no Q W X Y), equal rows, every word exactly
// once and only → or ↓, and no rude word by chance in any row or column (either direction).
const SL_CAPS = /^[ABCČDEFGHIJKLMNOPRSŠTUVZŽ]+$/u;
const BLOCK = ['PIZD', 'KURC', 'KURAC', 'RIT', 'SRAT', 'SRAN', 'JEBI', 'FUK', 'DREK', 'TURD', 'SHIT', 'FUCK', 'PENIS', 'SEKS'];
function checkWords(c) {
  const w = c.words;
  if (!w || !w.grid || !w.find || !w.note || !w.h1) return fail(c.id, 'a words step needs words: { note, grid, find, h1 }');
  const rows = w.grid.map(r => [...r]), n = rows[0].length;
  if (rows.some(r => r.length !== n || !SL_CAPS.test(r.join('')))) fail(c.id, 'word grid: equal rows of Slovenian capitals');
  const lines = [...rows.map(r => r.join('')), ...rows[0].map((_, x) => rows.map(r => r[x]).join(''))];
  const count = (word) => lines.reduce((k, l) => k + l.split(word).length - 1, 0);
  for (const [e, word] of w.find) {
    if (!e || !SL_CAPS.test(word)) fail(c.id, `word ${word}: [emoji, CAPITALS]`);
    else if (count(word) !== 1) fail(c.id, `word ${word} appears ${count(word)} times (→ and ↓), needs exactly 1`);
  }
  // riddles (a third item): every word has one or none does; a question, short, without its own word or a suspect's name
  const rid = w.find.filter(f => f[2]);
  if (rid.length && rid.length !== w.find.length) fail(c.id, 'words: every word has a riddle, or none does');
  for (const [, word, q] of rid) {
    if (!q.trim().endsWith('?')) fail(c.id, `riddle for ${word} is a question (?)`);
    if (letters(q).includes(word)) fail(c.id, `riddle for ${word} gives the word away`);
    if (named(q).some(id => c.suspects.includes(id))) fail(c.id, `riddle for ${word} names a suspect`);
  }
  tooLong(c, 'riddle', rid.map(f => f[2]));
  // the geslo: the letters no word uses, in reading order, spell the sentence it gives
  if (w.geslo) {
    const used = new Set();
    for (const [, word] of w.find) for (let y = 0; y < rows.length; y++) for (let x = 0; x < n; x++) for (const down of [false, true]) {
      const L = [...word];
      if ((down ? y + L.length <= rows.length : x + L.length <= n) && L.every((ch, k) => rows[down ? y + k : y][down ? x : x + k] === ch)) L.forEach((_, k) => used.add(down ? (y + k) * n + x : y * n + x + k));
    }
    const left = rows.flat().filter((_, i) => !used.has(i)).join('');
    const g = c.sentences.find(s => s.id === w.geslo);
    if (!g || g.from !== 'words') fail(c.id, `words.geslo ${w.geslo} must be a sentence with from: 'words'`);
    else if (left !== letters(g.text)) fail(c.id, `the letters left over read ${left}, the geslo needs ${letters(g.text)}`);
  }
  for (const bad of BLOCK) for (const l of lines) if (l.includes(bad) || [...l].reverse().join('').includes(bad)) fail(c.id, `word grid hides "${bad}"`);
  // no suspect's name readable in the grid before the words are found (it would spoil a geslo or tempt a wrong try)
  for (const id of c.suspects) { const nm = CHARACTERS[id].name.toUpperCase();
    if (nm.length >= 4 && lines.some(l => l.includes(nm) || [...l].reverse().join('').includes(nm))) fail(c.id, `word grid shows the name ${nm}`); }
  for (const t of [w.note, w.h1].flatMap(l => l.split(/(?<=[.!?…])\s+(?=\p{Lu})/u))) if (words(t) > LEVEL_RULES[c.level].maxWords) fail(c.id, `words: ${words(t)} words (max): ${t}`);
}
// ✉️ cipher: one symbol per letter and one letter per symbol; the message is the sentence it gives, in capitals
const CIPHER_KEYS = {};
function checkCipher(c) {
  const k = c.cipher;
  if (!k || !k.note || !k.key || !k.gives || !k.h1) return fail(c.id, 'a cipher step needs cipher: { note, key, gives, h1 }');
  const g = c.sentences.find(s => s.id === k.gives);
  if (!g) return;
  const msg = letters(g.text), used = new Set(msg), vals = Object.values(k.key);
  if (new Set(vals).size !== vals.length) fail(c.id, 'cipher: two symbols for one letter');
  for (const ch of used) if (!vals.includes(ch)) fail(c.id, `cipher: no symbol for ${ch}`);
  for (const [e, l] of Object.entries(k.key)) {
    if (!used.has(l)) fail(c.id, `cipher: ${e} = ${l} is not in the message`);
    if (CIPHER_KEYS[e] && CIPHER_KEYS[e][0] !== l) fail(c.id, `cipher: ${e} is ${l} here but ${CIPHER_KEYS[e][0]} in ${CIPHER_KEYS[e][1]} (one alphabet per file)`);
    CIPHER_KEYS[e] = CIPHER_KEYS[e] || [l, c.id];
  }
  if (msg.length > 20 || used.size > 9) fail(c.id, `cipher: ${msg.length} letters, ${used.size} different (max 20 and 9)`);
  if ((k.extra || []).length > 2 || (k.extra || []).some(l => used.has(l))) fail(c.id, 'cipher: up to 2 extra tiles, none of them in the message');
  if (k.missing && (!k.key[k.missing] || !k.h2 || !k.h2.includes(k.key[k.missing]))) fail(c.id, 'cipher: the missing symbol is in the key, and h2 says its letter');
  tooLong(c, 'cipher', [k.note, k.h1, k.h2]);
}
// 📜 torn note: the parts in order make the sentence it gives
function checkTorn(c) {
  const t = c.torn;
  if (!t || !t.note || !t.parts || !t.gives || !t.h1 || !t.h2) return fail(c.id, 'a torn step needs torn: { note, parts, gives, h1, h2 }');
  const g = c.sentences.find(s => s.id === t.gives);
  if (!inRange(t.parts.length, [3, 4])) fail(c.id, 'torn: 3–4 parts');
  if (g && t.parts.join(' ') !== g.text) fail(c.id, `torn: the parts make »${t.parts.join(' ')}«, the sentence is »${g.text}«`);
  if (new Set(t.parts).size !== t.parts.length) fail(c.id, 'torn: two parts are the same');
  tooLong(c, 'torn', [t.note, t.h1, t.h2]);
}
// ❗ UGOVOR: the claims, the lie, what breaks it and the truth after it
function checkLie(c) {
  const L = c.lie, ss = c.sentences, get = (sid) => ss.find(s => s.id === sid);
  if (!L || !L.claims || !L.claim || !L.breaks || !L.truth) return fail(c.id, 'a lie step needs lie: { claims, claim, breaks, truth }');
  const st = c.steps;
  if (!st.includes('lie') || st.indexOf('lie') !== st.length - 2) fail(c.id, 'the lie step comes right before solve');
  if (ss.some(s => s.role === 'partial')) fail(c.id, 'a case with UGOVOR has no partial sentence');
  if (!inRange(L.claims.length, [1, 3]) || new Set(L.claims).size !== L.claims.length) fail(c.id, 'lie: 1–3 different claims');
  for (const sid of L.claims) {
    const s = get(sid);
    if (!s) { fail(c.id, `lie: claim ${sid} is missing`); continue; }
    if (!c.suspects.includes(s.who)) fail(c.id, `lie: claim ${sid} needs who (a suspect)`);
    if (!s.text.includes('»')) fail(c.id, `lie: claim ${sid} is a quote (» «)`);
    if (s.role === 'clear' || s.role === 'evidence') fail(c.id, `lie: claim ${sid} is not an alibi or the proof`);
  }
  if (!L.claims.includes(L.claim)) fail(c.id, 'lie: claim is one of claims');
  if (!inRange(L.breaks.length, [1, 3])) fail(c.id, 'lie: 1–3 sets in breaks');
  for (const set of L.breaks) {
    if (!inRange(set.length, [1, 2])) fail(c.id, 'lie: a set in breaks has 1 or 2 sentences');
    for (const sid of set) {
      const s = get(sid);
      if (!s) fail(c.id, `lie: breaker ${sid} is missing`);
      else if (L.claims.includes(sid) || s.from === 'lie') fail(c.id, `lie: ${sid} can't break the claim (it is a claim or the truth)`);
    }
  }
  const t = get(L.truth), liar = get(L.claim) && get(L.claim).who;
  if (!t || t.from !== 'lie' || t.who !== liar || !t.text.includes('»') || t.role === 'evidence') fail(c.id, 'lie: the truth has from: \'lie\', the liar\'s who, is a quote, and is never the proof');
  if (ss.filter(s => s.from === 'lie').length !== 1) fail(c.id, 'lie: exactly one sentence has from: \'lie\'');
  if (L.about && (!get(L.claim) || !named(get(L.claim).text).includes(L.about) || L.about === liar)) fail(c.id, 'lie: about is named in the claim, and is not the liar');
  for (const m of L.hmm || []) {
    if (!L.claims.includes(m[0]) || !get(m[1]) || L.breaks.flat().includes(m[1]) || !m[2]) fail(c.id, 'lie: hmm is [a claim, a sentence that is not a breaker, a note]');
  }
  tooLong(c, 'lie', [L.h1, ...(L.hmm || []).map(m => m[2])]);
}
// 🧭 Kam kaže sled?: clues with an arrow to a face, the sentences that explain the misleading ones
function checkHerring(c) {
  const H = c.herring, ss = c.sentences, get = (sid) => ss.find(s => s.id === sid);
  if (!H || !H.clues || !H.points || !H.explains) return fail(c.id, 'a herring step needs herring: { clues, points, explains }');
  const st = c.steps;
  if (st.indexOf('herring') !== st.length - 2) fail(c.id, 'the herring step comes right before solve');
  if (st.includes('lie')) fail(c.id, 'never 🧭 and ❗ in one case');
  if (!inRange(H.clues.length, [1, 2]) || new Set(H.clues).size !== H.clues.length) fail(c.id, 'herring: 1–2 different clues');
  const wrong = Object.keys(H.explains);
  if (!wrong.length || wrong.some(x => !H.clues.includes(x))) fail(c.id, 'herring: at least one misleading clue, and every key of explains is a clue');
  for (const sid of H.clues) {
    const s = get(sid), who = H.points[sid];
    if (!s) { fail(c.id, `herring: clue ${sid} is missing`); continue; }
    if (!c.suspects.includes(who)) fail(c.id, `herring: clue ${sid} points at a suspect (points)`);
    if (!named(s.text).includes(who)) fail(c.id, `herring: clue ${sid} names the face it points at (${who})`);
    if (wrong.includes(sid)) {
      if (who === c.culprit) fail(c.id, `herring: misleading clue ${sid} points at an innocent, not the culprit`);
      if (s.role === 'evidence' || s.role === 'clear') fail(c.id, `herring: misleading clue ${sid} is not the proof or an alibi`);
      for (const set of H.explains[sid]) {
        if (!inRange(set.length, [1, 2])) fail(c.id, 'herring: an explanation is 1 or 2 sentences');
        for (const x of set) {
          const e = get(x);
          if (!e) fail(c.id, `herring: explanation ${x} is missing`);
          else if (H.clues.includes(x)) fail(c.id, `herring: ${x} is a clue, not an explanation`);
          else if (e.clears === who) fail(c.id, `herring: ${x} is ${who}'s alibi; one sentence, one job`);
          else if (e.role === 'evidence') fail(c.id, `herring: ${x} is the proof, not an explanation`);
        }
      }
    } else if (s.role !== 'evidence' || who !== c.culprit) fail(c.id, `herring: a clue that is not misleading (${sid}) is the proof and points at the culprit`);
  }
  for (const m of H.hmm || []) if (!wrong.includes(m[0]) || !get(m[1]) || !m[2]) fail(c.id, 'herring: hmm is [a misleading clue, a sentence, a note]');
  tooLong(c, 'herring', [H.h1, ...(H.hmm || []).map(m => m[2])]);
}
// ⏰ Kdaj?: sentences of the case sorted before / during / after the deed. A card from another time is never an
// alibi or the proof (it must not count); a card at the deed's time never hands over the proof.
const BANDS = new Set(['before', 'during', 'after']);
function checkWhen(c) {
  const W = c.when, ss = c.sentences, st = c.steps;
  if (!W || !W.deed || !W.cards) return fail(c.id, 'a when step needs when: { deed, cards, h1? }');
  if (st.indexOf('when') !== st.length - 2) fail(c.id, 'the when step comes right before solve');
  if (st.includes('lie') || st.includes('herring')) fail(c.id, 'when is never in the same case as lie or herring');
  if (words(W.deed) > 6) fail(c.id, `when: the deed is ${words(W.deed)} words (max 6): ${W.deed}`);
  const ids = Object.keys(W.cards);
  if (!inRange(ids.length, [2, 4])) fail(c.id, 'when: 2–4 cards');
  if (!ids.some(x => W.cards[x] !== 'during')) fail(c.id, 'when: at least one card from before or after');
  for (const [sid, band] of Object.entries(W.cards)) {
    const s = ss.find(x => x.id === sid);
    if (!s) { fail(c.id, `when: card ${sid} is missing`); continue; }
    if (!BANDS.has(band)) fail(c.id, `when: ${sid} is before, during or after`);
    if (band !== 'during' && (s.role === 'clear' || s.role === 'evidence')) fail(c.id, `when: ${sid} is from another time, so it is no alibi and no proof`);
    if (band === 'during' && s.role === 'evidence') fail(c.id, `when: ${sid} is the proof; the step must not hand it over`);
  }
  tooLong(c, 'when', [W.h1]);
}
function checkSteps(c) {
  const ss = c.sentences;
  if (c.type !== 'elim') fail(c.id, 'step cases are type elim');
  for (const st of c.steps) if (!STEPS.has(st)) fail(c.id, `unknown step ${st}`);
  if (new Set(c.steps).size !== c.steps.length) fail(c.id, 'a step comes once');
  if (c.steps.includes('call') && (!CHARACTERS[c.client] || !c.call || !c.call.length)) fail(c.id, 'a call needs client and call lines');
  if (c.client && c.suspects.includes(c.client) && !c.final) fail(c.id, 'the client is not a suspect (only in a final, where he asks for help himself)');
  const witnesses = c.witnesses || [];
  for (const w of witnesses) if (!CHARACTERS[w] || c.suspects.includes(w) || w === c.culprit) fail(c.id, `witness ${w}: a known character who is not a suspect`);
  if (witnesses.length && !c.steps.includes('ask')) fail(c.id, 'witnesses answer in an ask step');
  for (const s of ss) {
    const st = stepOf(s);
    if (!c.steps.includes(st)) fail(c.id, `${s.id} is found in step ${st}, which the case doesn't have (obj → scene, ask → ask, from → that step)`);
    if (st === 'scene' && (!s.obj || !s.label)) fail(c.id, `${s.id} needs obj and label (where it is found)`);
    if (s.who && !CHARACTERS[s.who]) fail(c.id, `${s.id}: unknown who ${s.who}`);
  }
  // questioning: every answer has who said it and the question; every suspect gets asked
  if (c.steps.includes('ask')) {
    for (const s of ss.filter(x => stepOf(x) === 'ask')) {
      if (!c.suspects.includes(s.who) && !witnesses.includes(s.who)) fail(c.id, `${s.id} needs who (a suspect or a witness)`);
      else if (words(s.ask) > LEVEL_RULES[c.level].maxWords) fail(c.id, `${s.id}: the question is too long`);
    }
    for (const id of [...c.suspects, ...witnesses]) if (!ss.some(s => s.ask && s.who === id)) fail(c.id, `nobody asks ${id} anything`);
  }
  // a sentence a puzzle (or UGOVOR) gives: named by its step, and its step comes before lie and solve
  const gives = { cipher: c.cipher && c.cipher.gives, torn: c.torn && c.torn.gives, words: c.words && c.words.geslo, lie: c.lie && c.lie.truth };
  for (const s of ss.filter(x => x.from)) {
    if (gives[s.from] !== s.id) fail(c.id, `${s.id} has from: '${s.from}', but that step doesn't give it`);
    if (s.from !== 'lie' && c.steps.includes('lie') && c.steps.indexOf(s.from) > c.steps.indexOf('lie')) fail(c.id, `${s.id}: its puzzle comes after UGOVOR`);
  }
  for (const [st, sid] of Object.entries(gives)) if (sid && !ss.some(s => s.id === sid && s.from === st)) fail(c.id, `${st} gives ${sid}: it needs a sentence ${sid} with from: '${st}'`);
  if (c.steps.includes('cipher')) checkCipher(c);
  if (c.steps.includes('torn')) checkTorn(c);
  if (c.steps.includes('lie') || c.lie) checkLie(c);
  if (c.steps.includes('herring') || c.herring) checkHerring(c);
  if (c.steps.includes('when') || c.when) checkWhen(c);
  for (const s of ss.filter(x => x.when)) {
    if (c.when) fail(c.id, `${s.id}: when: on a sentence only in a case without the ⏰ step`);
    if (!['before', 'after'].includes(s.when) || s.role === 'clear' || s.role === 'evidence') fail(c.id, `${s.id}: when is 'before' or 'after', on a sentence that is no alibi and no proof`);
  }
  if (ss.filter(s => s.rub).length > 1) fail(c.id, 'at most one page to rub (rub)');
  for (const s of ss.filter(x => x.rub)) if (stepOf(s) !== 'scene' || s.dark) fail(c.id, `${s.id}: a page to rub is a scene object, not dark`);
  for (const s of ss.filter(x => x.points)) if (!c.suspects.includes(s.points) || s.points === c.culprit) fail(c.id, `${s.id}: points at an innocent suspect`);
  if (c.steps.includes('words')) checkWords(c);
  // 🔐 code lock: 3–5 digits; h2 gives the code away (fair play when the earlier case was skipped)
  if (c.steps.includes('lock')) {
    const k = c.lock || {};
    if (!/^\d{3,5}$/.test(k.code || '') || !k.note || !k.h1 || !k.h2) fail(c.id, 'a lock step needs lock: { note, code (3–5 digits), h1, h2 }');
    else if (k.h2.replace(/\D/g, '') !== k.code) fail(c.id, 'lock h2 must say the code');
    for (const t of [k.note, k.h1, k.h2].filter(Boolean)) if (words(t) > LEVEL_RULES[c.level].maxWords) fail(c.id, `lock: ${words(t)} words (max): ${t}`);
  }
  // 🕐 timeline: 3–5 cards [emoji, text] in the right order, each with its own first word, so
  // the time words (najprej, potem, na koncu …) tell the order
  if (c.steps.includes('order')) {
    const o = c.order || {};
    if (!o.cards || !inRange(o.cards.length, [3, 5]) || o.cards.some(k => !k[0] || !k[1]) || !o.note || !o.h1 || !o.h2 || !o.done) {
      fail(c.id, 'an order step needs order: { note, cards: 3–5 × [emoji, text], h1, h2, done }');
    } else {
      const first = o.cards.map(k => k[1].split(' ')[0].toLowerCase());
      if (new Set(first).size !== first.length) fail(c.id, 'timeline cards start with different words');
      for (const t of [o.note, o.h1, o.h2, o.done, ...o.cards.map(k => k[1])].flatMap(l => l.split(/(?<=[.!?…])\s+(?=\p{Lu})/u))) {
        if (words(t) > LEVEL_RULES[c.level].maxWords) fail(c.id, `order: ${words(t)} words (max): ${t}`);
      }
    }
  }
  if (c.steps[0] !== 'call' || c.steps[c.steps.length - 1] !== 'solve' || !c.steps.some(st => st === 'scene' || st === 'ask')) fail(c.id, 'steps go call → … → solve, with a scene or ask');
  for (const st of PUZZLES) if (c.steps.includes(st) !== !!c[st]) fail(c.id, `${st}: the step and its data come together`);
  if (ss.filter(s => s.dark).length > 1) fail(c.id, 'at most one dark object');
  for (const id of c.suspects) {
    const al = ss.filter(s => s.clears === id);
    if (id === c.culprit && al.length) fail(c.id, 'the culprit has no true alibi');
    // two alibis only when both truly clear (a sentence a careful child would rightly use must be accepted)
    if (id !== c.culprit && (al.length < 1 || al.length > 2)) fail(c.id, `suspect ${id} needs one alibi sentence, at most two (clears: '${id}')`);
  }
  for (const s of ss) {
    if ((s.role === 'clear') !== !!s.clears) fail(c.id, `${s.id}: role clear goes with clears`);
    // the one exception: the truth after UGOVOR clears its own speaker, when a breaker on screen backs it
    const ownTruth = s.from === 'lie' && s.who === s.clears;
    if (ownTruth && !c.lie.breaks.flat().some(sid => { const b = ss.find(x => x.id === sid); return b && named(b.text).includes(s.clears); })) {
      fail(c.id, `${s.id}: a truth may clear its speaker only when a breaker names ${s.clears}`);
    }
    if (s.clears && !ownTruth && !named(s.text).includes(s.clears)) fail(c.id, `${s.id}: the alibi must name ${s.clears}`);
  }
  if (c.card) {
    const s = ss.find(x => x.id === c.card.sid);
    if (!s) fail(c.id, `card points at missing ${c.card.sid}`);
    else if (named(s.text).some(id => c.suspects.includes(id))) fail(c.id, 'the corkboard card names no suspect');
  }
  // one proof names the culprit and no other suspect; a second proof (a pair) names no suspect at all
  const proofs = ss.filter(s => s.role === 'evidence');
  const naming = proofs.map(s => named(s.text).filter(id => c.suspects.includes(id)));
  if (proofs.length === 1 && naming[0].join() !== c.culprit) fail(c.id, `${proofs[0].id}: the proof names the culprit and no other suspect`);
  if (proofs.length === 2 && (naming.filter(w => w.length).length !== 1 || naming.flat().join() !== c.culprit)) fail(c.id, 'a proof pair: one names only the culprit, the other names no suspect');
  if (c.film && (!c.steps.includes('scene') && !c.steps.includes('ask') || c.film.some(f => !f[0] || !f[1]))) fail(c.id, 'film frames are [emoji, caption]');
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
  if (c.steps ? !inRange(evidence.length, [1, 2]) : evidence.length !== (pair ? 2 : 1)) fail(c.id, `${evidence.length} evidence sentences (${c.steps ? 'a step case has 1, or a pair of 2' : `${c.type} needs ${pair ? 2 : 1}`})`);
  const lines = [c.h1, ...(c.call || []), ...(c.film || []).map(f => f[1]), ...(c.letter || []), ...(c.excuse ? [c.excuse] : []), ...(c.card && c.card.think ? [c.card.think] : [])];
  for (const t of lines.flatMap(l => l.split(/(?<=[.!?…])\s+(?=\p{Lu})/u))) if (words(t) > R.maxWords) fail(c.id, `${words(t)} words (max ${R.maxWords}): ${t}`);
  if (c.steps) { checkSteps(c); tooLong(c, 'reveal/excuse/letter', [...(c.reveal || []), c.excuse, ...(c.letter || []), c.card && c.card.think]); continue; }
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
  // the solved screen's lines are read too: the same limit (each sentence of a line)
}

// Play order and the ladder, per file: case numbers run 1, 2, 3, … without gaps; the rungs
// climb (never go down), from a fact case to a final two-proof case. A twist (an animal
// of the place did it) appears at most once per file; otherwise the culprit is one of the cast.
const fileIds = FILES.map(f => f.id);
// Release dates and teasers: a date the game can compare, a teaser line a child can read, one id per adventure.
for (const f of [...FILES, ...COMING]) {
  if (f.opens && !/^\d{4}-\d{2}-\d{2}$/.test(f.opens)) fail(f.id, `opens must be YYYY-MM-DD: ${f.opens}`);
  if ((f.opens || COMING.includes(f)) && (!f.teaser || words(f.teaser) > LEVEL_RULES.A.maxWords)) fail(f.id, 'a teaser card needs its line (teaser, ≤ 8 words)');
}
for (const f of COMING) if (fileIds.includes(f.id) || COMING.filter(x => x.id === f.id).length > 1) fail(f.id, 'teaser id used twice');
for (const c of CASES) if (!fileIds.includes(c.file)) fail(c.id, `unknown file ${c.file}`);
for (const f of FILES) {
  const inFile = CASES.filter(c => c.file === f.id);
  if (f.season) {
    // a season is built case by case: numbers run 1, 2, 3, … and every case pins a card
    inFile.forEach((c, i) => { if (c.no !== i + 1) fail(c.id, 'case numbers must run 1, 2, 3, …'); });
    for (const c of inFile) if (!c.card) fail(c.id, 'a season case pins a card to the corkboard (card)');
    if (!f.mystery) fail(f.id, 'a season needs its mystery question');
    if (f.guess) {
      const R = LEVEL_RULES.A, g = f.guess;
      for (const t of [g.q, g.q2, ...g.options.map(o => o[2])].filter(Boolean)) if (words(t) > R.maxWords) fail(f.id, `guess: ${words(t)} words (max ${R.maxWords}): ${t}`);
      if (g.options.length < 2 || g.after > inFile.length + (f.soon || 0)) fail(f.id, 'guess needs 2+ options and a case it follows');
      if (g.again && (!g.q2 || g.again <= g.after || g.again >= inFile.length + (f.soon || 0))) fail(f.id, 'guess.again comes after guess.after and before the final, with q2');
    }
    if (f.cup && (!f.cup.q || !f.cup.cloth || !f.cup.btn || !f.cup.cheer || !(f.cup.names || []).length || [f.cup.q, f.cup.cloth, f.cup.btn, f.cup.cheer].some(t => words(t) > LEVEL_RULES.A.maxWords))) fail(f.id, 'cup: { q, cloth, btn, cheer (≤ 8 words), names }');
    if (f.cup && f.book) fail(f.id, 'a season ends with a book or a cup, not both');
    if (f.book && (!f.book.q || !f.book.title || !f.book.by || words(f.book.q) > LEVEL_RULES.A.maxWords)) fail(f.id, 'book: { q (≤ 8 words), title, by }');
    // puzzles vary: no puzzle type in two cases in a row
    inFile.forEach((c, i) => { const prev = inFile[i - 1];
      if (prev && c.steps && prev.steps) for (const st of PUZZLES) if (c.steps.includes(st) && prev.steps.includes(st)) fail(c.id, `${st} again, right after ${prev.id}`); });
    // the culprit's face moves: never first in more than 2 cases, not in the same place in two cases in a row
    const at = inFile.map(c => c.suspects.indexOf(c.culprit));
    if (at.filter(i => i === 0).length > 2) fail(f.id, `the culprit is the first face in ${at.filter(i => i === 0).length} cases`);
    at.forEach((i, k) => { if (k && i === at[k - 1]) fail(inFile[k].id, `the culprit is face ${i + 1} again, as in ${inFile[k - 1].id}`); });
    // UGOVOR across the season: the liar is often not the culprit, and not the same person twice in a row
    const lies = inFile.filter(c => c.lie && c.sentences.some(s => s.id === c.lie.claim));
    const liarIn = (c) => c.sentences.find(s => s.id === c.lie.claim).who;
    if (lies.length >= 3 && lies.filter(c => liarIn(c) !== c.culprit).length < 2) fail(f.id, 'the liar is not the culprit in at least 2 cases');
    lies.forEach((c, i) => { if (i && lies[i - 1].no === c.no - 1 && liarIn(lies[i - 1]) === liarIn(c)) fail(c.id, `${liarIn(c)} lies again, right after ${lies[i - 1].id}`); });
    // the answer comes with the final case: the last one, its culprit unmasked (real), one of the guesses
    if (f.answer) {
      const last = inFile[inFile.length - 1];
      if (f.soon || !last || !last.final) fail(f.id, 'the answer comes with the final case (final: true, no soon)');
      if (f.guess && !f.guess.options.some(o => o[0] === f.answer.id)) fail(f.id, 'the answer is one of the guess options');
      if (words(f.answer.text) > LEVEL_RULES.A.maxWords) fail(f.id, `answer: ${words(f.answer.text)} words (max)`);
    }
    if (inFile.some((c, i) => c.final && i !== inFile.length - 1)) fail(f.id, 'the final case must be the last one');
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
  // (a step case with a proof pair is checked in checkSteps: one names the culprit, the other nobody)
  const ev = c.type === 'pair' || ss.filter(s => s.role === 'evidence').length === 2 ? null : ss.find(s => s.role === 'evidence');
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
