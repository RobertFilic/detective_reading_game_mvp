# Puzzles inside the cases – proposal

A plan for a new adventure that mixes reading the case with small puzzles (a word search, a cipher, a lock…). Each puzzle is part of the story: it opens a lock, decodes a message, or gives a clue. It is never a game stuck on between two texts.

Written for 7–8-year-old early readers on a phone or iPad, touch only, plain HTML/CSS/JS. It builds on the step cases (`steps: ['call', 'scene'|'ask', 'solve']`) described in [solo/README.md](../solo/README.md) and [IMPROVEMENTS.md §3](IMPROVEMENTS.md).

> **All Slovenian text in this file is a draft. A native speaker must check it** (case endings, word order, and what sounds natural to a child) before it goes into `index.html`.

**In short**
- Build a **shared reward**: every puzzle ends in a lock that clicks open and a card that drops into the pocket 👝. Then add **🔤 Iskanka** (word search) and **✉️ Šifra** (cipher).
- **One puzzle per case**, two in the final case. The puzzle gives a clue, and the child still has to reason it out in `solve`.
- The new season is **🦕 Noč v muzeju – Kdo je Duh muzeja?**. Each case hides one golden letter. Together the letters spell **JAJCE**, the code for the final lock.

---

## 1. Puzzle types that suit 7–8-year-olds

Good puzzles for this age come from puzzle magazines, escape rooms for kids, Professor Layton and Golden Idol. They share four traits:
- They are short.
- You can see your progress.
- You can't get stuck.
- Their output is something to **read**.

A puzzle that has no reading in it, such as spot the difference, a jigsaw or a maze, adds fun but takes time away from reading practice. Those are only worth it if they produce a sentence.

### Overview

| # | Puzzle | What the child does | Reading / thinking skill | Cost |
|---|---|---|---|---|
| 1 | 🔤 **Iskanka** (word search) | Finds 3–5 words in a 5×5 or 6×6 letter grid by tapping the first and the last letter | sound–letter decoding, scanning, spelling | M |
| 2 | ✉️ **Šifra** (symbol cipher) | Turns symbols into letters using a key strip (🦴 = K, 🦕 = L …) and so reads the message | letter knowledge, blending, fluency | S |
| 3 | 🔐 **Ključavnica** (code lock) | Turns 3–5 wheels (▲▼) to a code found in the text: numbers, colours or letters | finding the exact detail, careful reading | S |
| 4 | 📜 **Raztrgano pismo** (torn note) | Puts 3–4 paper strips in order so they make one sentence | syntax, meaning ("does this make sense?") | S |
| 5 | ❓ **Uganka** (riddle) | Reads a riddle and taps the matching object in the scene | inference, figurative language | S |
| 6 | 🕐 **Časovnica** (timeline) | Puts 3–4 event cards in order | time words (*najprej, potem, nato*), cause | S–M |
| 7 | 🟦 **Logična mreža** (mini logic grid) | Taps ✖ and ✔ in a 3×3 grid (people × things) based on 2–3 clue sentences | negation (*ne, nima*), elimination | M |
| 8 | 🗺️ **Pot po navodilih** (follow the directions) | Reads 3–4 directions and taps the path from landmark to landmark on a map | following written instructions | M |
| 9 | 👣 **Ujemanje sledi** (match the trace) | Reads a description and taps the matching picture out of 3–4 (footprints, shadows, prints) | precise vocabulary (*ima, nima, na peti*) | S |
| 10 | 🖍️ **Razmazan listek** (smudged note) | Fills 1–3 missing letters in a word from 2–3 choices | phonics, spelling in context | S |
| 11 | 🪞 **Zrcalo** (mirror writing) | Taps the mirror to flip a backwards note, then reads it | (the delight; close reading of the flipped text) | S |

**Not recommended:** spot the difference, jigsaws, sliding puzzles, mazes you trace with a finger, and anything with a timer. They involve little or no reading, or they need fine motor control. A 7-year-old's finger is about 1.5 cm wide, so every target must be **≥ 48 px**.

### Details per type

**1. 🔤 Iskanka (word search)**
- **In the story:** a note from the Duh says: »Poišči štiri besede. Tam išči dokaze.« Each word found (KLOP, KOŠ, VAZA, OKNO) unlocks that object in the scene.
- **Difficulty knobs:**
  - grid size, 5×5 → 6×6
  - word list shown as emoji + word → as a word only → as a clue sentence (»Kam mečemo smeti?« → KOŠ)
  - number of words, 3 → 5
  - the last word may be **vertical**
- **Pitfalls:**
  - **Č, Š, Ž are one cell each.** **LJ and NJ are two letters** in Slovenian, so they take 2 cells (unlike Croatian).
  - Use filler letters from the Slovenian alphabet only (25 letters: no Q, W, X, Y).
  - Use only → and ↓. No diagonal and no backwards words: 7-year-olds don't scan that way.
  - Use **CAPITAL LETTERS only**. In Slovenian schools children learn *velike tiskane črke* first, so capitals are the safest choice.
  - Dragging is unreliable on iPad (the page scrolls, fingers slip). Use **tap first letter → tap last letter**, with the line drawn between them, and allow a drag as well.
  - The checker must test that each word appears **exactly once**. It must also test that no rude word appears by chance in any row or column (a small blocklist).
  - Cells are ≥ 48 px. A 6×6 grid fits a 360 px phone.

**2. ✉️ Šifra (symbol cipher)**
- **In the story:** a note under the painting says »🦴🦖🦕🪨 …«. Decoded, it reads »KDOR VE BARVO, JE RISAL.«
- **How it plays:** tap a symbol, then tap its letter on a small keyboard that has **only the letters used**, 6–9 tiles. A correct letter sticks. A wrong one wobbles.
- **Difficulty knobs:**
  - message length: 1 word → 5 words
  - how much of the key is given: complete → one pair missing that the child must work out from a word
  - symbols that repeat (fewer different ones is easier)
- **Pitfalls:**
  - It turns into copying if the message is long. Keep it ≤ 20 letters.
  - **Don't auto-read the result.** The child reads it first. 🔊 shows up after the first try, as in the hint ladder.
  - Č, Š, Ž get their own symbols, so they really get practised.

**3. 🔐 Ključavnica (code lock)**
- **In the story:** »Na vratih kleti je ključavnica s tremi kolesci.« The code comes from another puzzle, such as the numbers on the timeline cards or the golden letters of the season.
- **Difficulty knobs:**
  - numbers → colours → letters
  - 3 → 5 wheels
  - the code written plainly vs. put together from 2 clues
- **Pitfalls:**
  - Trying every combination by brute force has to be dull, not quick: no auto-check while the wheels turn, only an **»Odpri«** button.
  - After 2 wrong tries, the h1 hint points to where the code is.
- **Shared reward:** this is the **shared output widget**. Every other puzzle can end in a lock that clicks open (`sfx('lock')`).

**4. 📜 Raztrgano pismo (torn note)**
- **In the story:** »Koko je pismo raztrgala.« The strips »Tretja črka« | »je v ustih« | »velikega kita.« form one sentence.
- **Difficulty knobs:** 2 → 4 strips; a strip with a capital letter or a full stop gives a hint.
- **Pitfalls:**
  - The order must be clear from **meaning**, not only from the capital letter. Otherwise it becomes a punctuation trick.
  - Play is tap-to-place: tap a strip and it moves to the next free place. No dragging.

**5. ❓ Uganka (riddle)**
- **In the story:** »Ima vrat, a nima glave. Kaj je?« The child taps 🍾 in the scene, and that is where the clue is.
- **Difficulty knobs:** literal riddles → double-meaning riddles (*vrat* of a bottle); 4 → 8 objects in the scene.
- **Pitfalls:** double meanings are hard at 7. Test every riddle with children. This one costs almost nothing, because it is a `scene` with one object that answers it.

**6. 🕐 Časovnica (timeline)**
- **In the story:** the order of events shows that Rado was not at the entrance. The numbers on the back of the cards are the code for the lock.
- **Difficulty knobs:**
  - 3 → 4 cards
  - time words given (*najprej, nato, na koncu*) vs. only implied ("the lights went out" → "it was dark")
  - clock times (*ob osmih*) only at the top level
- **Pitfalls:** clock reading is weak at 7, so use **whole hours spelled out** in words. Play is tap-to-place, as with the torn note.

**7. 🟦 Logična mreža (mini logic grid, like a children's Murdle or Logico)**
- **In the story:** »Kdo ima katero svetilko?« The clues are »Lan nima modre svetilke.« and »Rado ima rumeno svetilko.«
- **Difficulty knobs:**
  - 2×2 → 3×3
  - only ✔ clues → negative clues (*nima*)
  - the grid fills in by itself (one ✔ crosses off its row) vs. the child does it
- **Pitfalls:**
  - A grid of 4×4 or bigger is too much.
  - Each clue sentence must be **visible next to the grid**: re-reading the sentence is the reading practice.
  - Auto-fill the obvious ✖ after a ✔, so the work is the thinking and not the bookkeeping.

**8. 🗺️ Pot po navodilih (follow the directions)**
- **In the story:** the Duh writes: »Pojdi do kita. Nato k mamutu. Pri mamutu pojdi dol.« The child taps landmarks on the map in order.
- **Difficulty knobs:** 2 → 4 steps; landmarks only → words like *mimo, za, pod*.
- **Pitfalls:** **left and right** are not secure at 7–8, so use landmarks and *gor/dol*. A wrong tap only wobbles; the path so far stays.

**9. 👣 Ujemanje sledi (match the trace)**
- **In the story:** »Odtis ima zvezdico na peti.« The child picks one of 3 shoe soles. The shoe is someone's, so it names a suspect.
- **Difficulty knobs:** 1 feature → 2 features (»velik, s črto«); the three pictures differ a lot vs. a little.
- **Pitfalls:** it needs clear drawings (emoji are too small). Use simple CSS or SVG shapes, so the build is S–M.

**10. 🖍️ Razmazan listek (smudged note)**
- **In the story:** a wet note reads »Ključ je pod ka_nom.« The choices are M / L / R → *kamnom*.
- **Difficulty knobs:** 1 → 3 gaps; similar-looking letters (b/d) vs. different-sounding ones.
- **Pitfalls:** use only gaps that **one** answer fits. A good warm-up level.

**11. 🪞 Zrcalo (mirror writing)**
- **In the story:** a note on the window is backwards. The child taps 🪞 and it flips with an animation.
- **Pitfalls:** it is little more than a reveal effect. Use it once per season at most, for the magic.

---

## 2. Rules for weaving puzzles into the story

1. **The output is something the case needs.** Every puzzle gives exactly one of these:
   - a **sentence for the pocket** 👝, a clue used in `solve`
   - an **opened object** in the scene, behind which a sentence is hidden
   - a **code** for a lock
   - a **golden letter** for the season

   If removing the puzzle changes nothing in the case, it's bolted on: cut it.
2. **The puzzle never solves the case.** It gives a clue, and the child still has to link the clue to a face in `solve`. That keeps the reasoning ladder (fact → … → pair) intact.
3. **The story asks for the puzzle before it appears.** The client or a note says why: »Vitrina je zaklenjena.«, »Pismo je v šifri.«, »Koko ga je raztrgala.« The child should want to open it.
4. **Reading in, reading out.** The puzzle either *is* reading (cipher, torn note, riddle, directions, clue sentences in the grid) or it *produces* a sentence the child must read. The decoded sentence is never auto-read.
5. **One puzzle per case; two in the final.** About 1–2 minutes per puzzle, in a case of about 5–8 minutes. Reading the case texts is still more than half of the time.
6. **Move the puzzle around.** It can come before the scene (it opens the scene), between scene and solve (it decodes something found there), or as the last gate (the lock). No two neighbouring cases use the same puzzle type. Over the season, at least 5 different types.
7. **The same puzzle grows harder, it doesn't repeat.** If a type comes back in a later season, it uses a harder knob (for example, clue sentences instead of a word list).
8. **Fair play.** Everything needed is on the screen. No general knowledge is needed, except the most common words.

### Hints and no-fail (same as the current hint ladder)

| Moment | Case steps today | Puzzles |
|---|---|---|
| a wrong move | soft wobble, »Ni prav.« / »Skoraj!« | the same; progress is never taken away |
| after 2 wrong moves | `h1` text hint | the puzzle's own `h1` (for example »Besede gredo samo → in ↓.«) |
| after 2 more | the next sentence lights up | narrow it down: the row of the word glows, one cipher pair is filled in, the first timeline card is placed |
| last | the sentence and the face pulse | **assist**: the next correct move pulses; tapping it does it |

Other rules:
- **No timers, no lives, no stars for speed.**
- The 🔊 button for the puzzle text appears after the first try, so the child tries to read first.
- Hint use is logged like the existing hints (`puzzle_hint` with the level).

---

## 3. The new adventure: 🦕 Noč v muzeju – »Kdo je Duh muzeja?«

**Setting.** A sleepover in the natural history museum (real museums run these nights). Torches, a whale skeleton, a mammoth, a T-rex. Each case is a small piece of mischief during the night. Alongside it, notes signed 👻 keep appearing. They are the puzzles, and each one hides a **golden letter**. The corkboard collects the notes and the letters.

**Season answer (warm, not scary).** The Duh is the night guard **Rado**. Tomorrow he retires. As a goodbye he set up a hunt for the children, and at its end he shows them the museum's new **dinosaur egg** 🥚. The golden letters J-A-J-C-E are the code for the final lock.

**Cast (new file `muzej`, four suspects):**
- **Lan** 👦🏽
- **Zoja** 👧🏻
- **čuvaj Rado** 👮🏻‍♂️
- **papiga Koko** 🦜, the museum's parrot, an animal: innocent in case 2, culprit in the twist (case 3)

The client is **kustosinja Mojca** 👩🏼‍🔬. She is never a suspect.

Each culprit gets a reason to be harmless. Rado is the culprit in case 5 as well as the final, so that "the one who was never caught" is not a tell. Then case 5 foreshadows the season.

| # | Type (rung) | Small mystery | Steps | Puzzle and what it gives | Golden letter / corkboard |
|---|---|---|---|---|---|
| 1 | fact / elim (1) | Kdo je vzel zob T-rexa? (Lan) | call → 🔤 iskanka → scene → solve | The 4 words found open 4 objects in the scene | **J**, at the bottom of the vase |
| 2 | trace (2) | Kdo je strašil v dvorani dinozavrov? (Zoja) | call → scene → 🟦 grid → solve | The grid turns into the sentence »Zoja ima modro svetilko.« for the pocket | **A**, visible only in blue light |
| 3 | twist (2) | Kdo je raztrgal Duhovo pismo? (Koko) | call → 📜 torn note → scene → solve | The rebuilt sentence says where the letter is | **J**, in the whale's mouth |
| 4 | slip (3) | Kdo je mamutu narisal brke? (Lan) | call → ✉️ cipher → ask → solve | The decoded note gives the key to the slip | **C**, on the back of the note |
| 5 | alibi (4) | Kdo je zaklenil vrata v klet? (Rado) | call → ask → 🕐 timeline → 🔐 lock → solve | The order breaks Rado's alibi; the card numbers open the cellar | **E**, on a chest marked 👻 |
| 6 ⭐ | pair (5) | **Kdo je Duh muzeja?** (Rado) | call → 🗺️ directions → 🔐 letter lock → solve (two proofs) | The path leads to the egg room; JAJCE opens it | the egg 🥚 |

### Story snippets (draft – a native speaker must check them)

**Case 1 – Zob T-rexa.**
- Mojca calls: »Iz vitrine je izginil zob T-rexa!« »Jutri ga bodo gledali šolarji.«
- The Duh's note: »Dobrodošli, detektivi! Poiščite štiri besede.«
- The grid hides KLOP, KOŠ, VAZA, OKNO. Each word opens that object in the scene.
- Sentences behind the objects:
  - »Zoja je ves večer risala mamuta.« (clears Zoja)
  - »Koko ne zna odpreti vitrine.« (clears Koko)
  - »Rado je bil z Mojco pri vhodu.« (clears Rado)
  - »Pod klopjo je Lanova vrečka.«
  - »V Lanovi vrečki je velik bel zob.« (the proof)
  - »Na dnu vaze je zlata črka J.«
- Excuse: »Tudi meni je izpadel zob! Hotel sem ju primerjati.«

**Case 2 – Modra luč.**
- Lan calls: »Po steni je plesal velik dinozaver!« »Bil je iz modre luči.«
- Scene: »Mojca je razdelila tri svetilke.« and »Vsak je dobil drugo barvo.«
- Grid: Lan, Zoja, Rado × 🔴🔵🟡. The clues are »Lan nima modre svetilke.« and »Rado ima rumeno svetilko.« The result goes to the pocket as »Zoja ima modro svetilko.«
- Proof (the trace): »Senca na steni je bila modra.«
- Card: »V modri luči se pokaže zlata črka A.«
- Excuse: »Hotela sem narediti senco dinozavra!«

**Case 3 – Raztrgano pismo (twist: Koko).**
- Mojca calls: »Duhovo pismo je raztrgano na koščke!«
- Torn strips: »Tretja črka« | »je v ustih« | »velikega kita.«
- Scene:
  - »Na robu papirja so luknjice.«
  - »Luknjice so kot od kljuna.« (the trace)
  - »V Kokovem gnezdu so koščki papirja.« (the proof)
  - Lan and Zoja each have one sleeping-bag alibi.
- Excuse (Koko): »Koko gnezdo! Koko gnezdo!«

**Case 4 – Brki na mamutu (slip).**
- Mojca calls: »Nekdo je mamutu narisal brke!« »Sliko sem takoj pokrila s platnom.«
- Cipher under the canvas: »KDOR VE BARVO, JE RISAL.« The back of the note has a golden C.
- Questioning:
  - Zoja: »Kakšni brki? Nisem jih videla.«
  - Rado: »Ves večer sem bil pri vhodu.«
  - Lan: »Modri brki sploh niso smešni.« (the slip: nobody saw the colour)
- Excuse: »Mamut je bil videti tako žalosten!«

**Case 5 – Zaklenjena klet (alibi).**
- Zoja calls: »Vrata v klet so zaklenjena!« »Iz kleti se sliši šuštenje.«
- Rado: »Ob devetih sem bil pri vhodu.«
- Timeline cards, each with a number on the back:
  - »Ob osmih je Rado pil čaj.« (2)
  - »Ob devetih je bil vhod prazen.« (7)
  - »Nato je Koko kričala: Rado, klet!« (5)
- The order gives the code 2-7-5. In the cellar: »V kleti je skrinja z znakom 👻.« and »Na skrinji je zlata črka E.«
- Excuse: »To je skrivnost. Do jutri zjutraj!«

**Case 6 – Kdo je Duh muzeja? (pair, final).**
- The phone rings and nobody is there. A note reads: »Pridi v klet. Sledi mojim navodilom. 👻«
- Directions: »Pojdi do kita.« »Nato k mamutu.« »Pri mamutu pojdi dol.«
- Letter lock: five wheels → J-A-J-C-E.
- The two proofs only work together:
  - »Vsa Duhova pisma so pisana z zelenim črnilom.«
  - »Samo Rado ima zeleno pero.«
- Reveal:
  - »Duh muzeja je bil čuvaj Rado.«
  - »Jutri gre Rado v pokoj.«
  - »Za slovo vam pokaže pravo jajce.«
  - »Hvala, detektivi! 🦕🥚«

Checker points for the writer:
- Every innocent suspect needs exactly one alibi sentence in the elim cases.
- *samo* is the proof in case 6 only.
- The proof position and the number of decoys must vary as the README requires.

---

## 4. Build order and data format

### Build order

1. **🔐 The shared reward (lock + "card into the pocket").**
   - Every puzzle ends the same way: the lock clicks, and the output (a sentence, an opened object or a letter) flies into the pocket 👝 or onto the corkboard.
   - Build it once and every puzzle feels connected to the story.
   - The code lock is that same widget with wheels.
   - Cost: S.
2. **🔤 Iskanka.**
   - The parent asked for it, it is instantly recognisable, and it practises decoding and spelling.
   - It also proves the "puzzle unlocks objects in the scene" pattern.
   - Cost: M, because of tap-to-select and the checker tests (each word exactly once, no rude words).
3. **✉️ Šifra.**
   - The cheapest puzzle that is *pure reading*.
   - Children love secret codes, and the decoded sentence goes straight into the pocket.
   - Cost: S.

After these: 📜 torn note and 🕐 timeline (both use tap-to-place, so build them together), then the 🟦 grid and 🗺️ directions. The ❓ riddle is almost free, because it is a scene with one object that answers it.

**One change to the code first.** Step navigation now assumes exactly 3 steps, with `steps[1]` as the middle one (`toScene`, `backTarget`). Change it to a step index `S.run.step` with `next()` / `back()`, so a case can have 4–5 steps in any order. The pocket also needs to take sentences from a puzzle.

### Data format (matches the current case objects)

The step names stay strings. Each puzzle step has a block with the same name on the case, the way `call` and `client` sit on the case today. The output of a puzzle is always one of `gives` (sentence ids into the pocket), `opens` (scene objects) or `code` / `letter`.

```js
// a new step kind = a screen; its data sits on the case under the same name
{
  id: 'm1', file: 'muzej', no: 1, type: 'elim', level: 'A', sticker: '🦷', place: 'Dvorana dinozavrov',
  steps: ['call', 'words', 'scene', 'solve'],
  client: 'mojca', call: ['Iz vitrine je izginil zob T-rexa!', 'Jutri ga bodo gledali šolarji.'],
  question: 'Kdo je vzel zob T-rexa?',
  suspects: ['lan', 'zoja', 'rado', 'koko'], culprit: 'lan',
  // 🔤 iskanka: rows in capitals, Č/Š/Ž are one cell; only → and ↓; each word exactly once
  words: {
    note: 'Dobrodošli, detektivi! Poiščite štiri besede.',
    grid: ['KLOPRI', 'OEVTNS', 'ŠMADUE', 'RIZŽBT', 'ESALJU', 'OKNOHM'],
    find: ['KLOP', 'KOŠ', 'VAZA', 'OKNO'],      // KOŠ and VAZA go down
    show: 'emoji',                               // 'emoji' | 'word' | 'clue' (difficulty knob)
    opens: true,                                 // each word unlocks the scene object with need: WORD
    h1: 'Besede gredo samo → in ↓.',
  },
  sentences: [
    ['s1', 'Pod klopjo je Lanova vrečka.', 'neutral', { obj: '🪑', label: 'klop', need: 'KLOP' }],
    ['s2', 'V Lanovi vrečki je velik bel zob.', 'evidence', { obj: '🗑️', label: 'koš', need: 'KOŠ' }],
    ['s3', 'Na dnu vaze je zlata črka J.', 'neutral', { obj: '🏺', label: 'vaza', need: 'VAZA' }],
    // … alibis with clears, as in b1
  ],
  card: { icon: '👻', sid: 's3', letter: 'J' },  // the season's golden letter
  // h1, reveal, caught, excuse, letter as in b1
}

// the other kinds, as they would sit on their cases
cipher: { key: { '🦴': 'K', '🦕': 'D', '🪨': 'O', /* … */ }, text: 'KDOR VE BARVO, JE RISAL.',
          given: 'all', gives: 's6', h1: 'Poišči znak v vrstici zgoraj.' },
torn:   { parts: ['Tretja črka', 'je v ustih', 'velikega kita.'], gives: 's7' },
grid:   { rows: ['lan', 'zoja', 'rado'], cols: ['🔴', '🔵', '🟡'],
          clues: ['Lan nima modre svetilke.', 'Rado ima rumeno svetilko.'],
          answer: { lan: '🔴', zoja: '🔵', rado: '🟡' }, gives: 's5' },  // s5 = 'Zoja ima modro svetilko.'
timeline: { cards: [['t1', 'Ob osmih je Rado pil čaj.', 2], ['t2', 'Ob devetih je bil vhod prazen.', 7],
                    ['t3', 'Nato je Koko kričala: Rado, klet!', 5]], code: true },  // order → 2-7-5
lock:   { wheels: 3, code: '275', from: 'timeline', opens: 'klet' },   // final case: code: 'JAJCE', from: 'season'
path:   { map: ['🐋', '🦣', '🦖', '🪜', '🚪'], steps: ['Pojdi do kita.', 'Nato k mamutu.', 'Pri mamutu pojdi dol.'],
          answer: ['🐋', '🦣', '🪜'] },
```

New checks for `tools/cases.mjs`:
- **Word search:** every `find` word appears exactly once, → or ↓ only. Only Slovenian letters are used, and no word from the blocklist appears in any row or column.
- **Cipher:** every letter of `text` has a symbol, and the text has ≤ 20 letters.
- **Grid:** the clues lead to exactly one answer (a brute-force check over 3! = 6 permutations).
- **Outputs:** every `gives` / `need` / `opens` reference exists.
- **Audio:** puzzle text (notes, clues, strips, cards, directions) counts toward the ≤ 8-word limit and is added to `clipList()` for recording.
- **Per adventure:** no two neighbouring cases use the same puzzle type, and there are ≥ 5 puzzle types.
