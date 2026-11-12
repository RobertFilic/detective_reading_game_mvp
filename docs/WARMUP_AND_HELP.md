# Warm-up cases and help that fades: build spec

Status: spec for the developer and the case writer, written 2026-11-12 by the puzzle designer. Direction of record: [CURRICULUM.md](studio/CURRICULUM.md) »Help that fades« and the bullet »New players start with the warm-up …«.

**Built on 2026-11-12: steps 1–6 of section 11** (help state, the coin, the two warm-up cases and their checker rules, the new beginning with the newest season as the big card; test `solo/tools/tests/warm.mjs`). Where the build differs from this spec:
- The coin gives the whole ladder only in solve. In the scene and the questioning it says the goal; in a puzzle, UGOVOR, 🧭 or ⏰ it gives the first hint only (the other rungs still need wrong tries). Giving every ladder from the coin is part of step 8.
- The warm-up cases are `WARMUPS`, a list beside `CASES`, not a hidden entry in `FILES`.
- The reason on the answer rung is »To ni {ime}.« (not »ima alibi«) and »To je dokaz: {ime}!«
- The Slovenian editor reworded ten of the companion's lines (2026-11-12); the game's `UI_AUDIO` is the text of record, not the drafts quoted below (e.g. »Ne gre? Tapni me.« for »Zagata? Tapni me.«, »Še ena vaja« for »Še en z mano«).
- In `w1` the instruction line on top is hidden too, and the coin is hidden (the companion leads anyway). The hard word is in the data and the checker, but can't be tapped yet (step 9), so `w1` has no »Težka beseda? Tapni jo.«
- `w2`'s coin line stays until the coin is tapped in solve or someone is crossed off.
- A detective from before the warm-up always starts at level 1 (the old log is not read).
- The old 🎓 practice case is no longer played; its code goes in step 12.

Producer's decisions on section 10 (2026-11-12): 1 the child sees the two buttons · 2 Babica is parked · 3 one word per companion (Hov! Mijav! Uhu! Juhu!) · 4 no offer · 5 the warm-up is not a solved case · 6 **no »starejši otrok« setting**: one rule for all, an older child skips by themselves with the offer · 7 the newest season is the big card, the others stay open · 8 the labels as drafted · 9 no lock in `w2` · 10 timings from the first playtest.

Not built yet: steps 7–12 (the level moving after real cases, help that differs by level, tappable hard words, one sentence at a time, the adult's block in the review, the clean-up). All Slovenian is a draft for the Slovenian editor. Every child-facing line is ≤ 8 words (the checker counts emoji and »…«).

**Design in one paragraph.** Two tiny step cases (`w1` »Skupaj«, `w2` »Ti delaš, jaz gledam«) replace the 🎓 practice case. After them the child's **companion** (🐶 🐱 🦉 🦊, one shared set of lines) does what a parent does, in **three help levels** (1 = today's game, 2, 3), set **per detective** from the run's own counters and moved **between cases only**. The companion's coin sits in the footer on every step screen; a tap on it is a free hint at every level, so nobody is ever stuck, whatever the level.

---

## 0. What exists today, and what that means

- The 🎓 practice case (`TUTORIAL`, carrot, Bine/Zala/Jure) is a **classic** case (intro → story → accuse → evidence). It teaches »pick the culprit, tap the proof«, **not** the loop of a real case (call → scene → cross off with alibis → proof). A child who finishes it still meets crossing off for the first time in case 1. The warm-up must be **step cases**.
- `helperEmoji()` already returns the child's sidekick, and the practice already uses it; »Babica« survives only in comments, README and the story bible. So the companion work is mostly generalising `coach()`/`coachStep()` from one hard-coded case to any case.
- Hints exist only in `solve` (after wrong pairs) and in the puzzles and reasoning steps (after wrong tries). **A child who does not know what to do cannot ask for a hint without first being wrong.** The new free »?« fixes this and is the most important single change.
- Solve ladder today: soft note (level 0) → wrong 2 `h1` → wrong 3 `elimLook` (next sentence glows) → wrong 4 `assist` (sentence and face pulse). `elimTarget()` already computes the next right sentence and face; case 1 is driven by it.
- Per-case counters exist in the run `r` (`wrong`, `assisted`, `lassisted`, `hassisted`, `wassisted`, `lwrong`, `hwrong`, `wmiss`) and in the log (`hint_shown.hintLevel`, `puzzle_hint.hintLevel`, `*_hint`, `*_assisted`, `case_done`). Help state must be computed from **run counters at case end**, not from `LOG`, because the log is per session and exportable/clearable.
- Existing tests set `dp_tutorial_done=true` and a profile. They must keep working unchanged (section 8).

---

## 1. The two warm-up cases

Both are normal cases in a hidden file: `FILES` entry `{ id: 'warm', warmup: true, hue: 160, title: 'Vaja' }` (not on the files screen, not in `fileOrder`, not in the ranks or the medal shelf). Case data is the usual format plus `warm: 1 | 2`. Level A, `type: 'elim'`, **exactly 3 suspects** (Bine, Zala, Jure, already in `CHARACTERS`: known faces, no new names to decode), 4–5 sentences, `steps: ['call', 'scene', 'solve']`, one `hard` word (section 4), no `letter`, no `card`, no puzzle, no `lie/herring/when`. Keep `caught`, `excuse` and `reveal` (the excuse is the laugh).

| | **w1 · together** (`warm: 1`) | **w2 · you do, I watch** (`warm: 2`) |
|---|---|---|
| Facts | The carrot is gone from the kitchen table. Culprit **Bine**. | A new, funny deed in a new place (garden; the writer picks). Culprit **Zala** (not Bine again, so »always the first name« can't be learnt). |
| Sentences | 4: `s1` neutral (what is missing), `s2` alibi Jure, `s3` alibi Zala, `s4` proof (names Bine) | 5: neutral, **proof in the middle**, two alibis, one true sentence that names the culprit and proves nothing (a mild decoy, not a »X rad Y«) |
| Alibi form | narrated facts, never the suspect's own words (»To trdi o sebi« would confuse) | same, one of them a witness (a non-suspect) |
| Scene | 4 objects, 4 sentences | 5 objects, 5 sentences |
| Companion | leads every tap, speaks on every screen | silent; two moments only (below) |
| Instruction cards (`BRIEF`) | **not shown**: the companion says the instruction in one line (no duplicate modal) | **shown as in a real case**, so the child learns they exist and reads them alone |
| Wrong taps | off-target taps are **not blocked**; the companion repeats the target kindly; logged `lead_miss`; never counted as wrong | counted as in a real case |
| Ladder | not used (the target is always lit) | accelerated like level 3 (rung one try earlier), and the free »?« is taught |

### w1 script (screen · the companion's line intent · what is lit)

Lit = the thick gold ring and bouncing finger the practice case already has (a group gets the ring only).

1. **Call** · »Telefon zvoni! Tapni ga.« (≤ 5 w) · ring on the answer button. After the call text: »Preberiva, kaj prosi.« · ring on the text, »V redu« button. Then the camera/»Na kraj dogodka« button.
2. **Scene** · »Poglej stvari. Tapni vsako.« · ring on the object group, then the **next unopened object** alone (finger). After each sentence lands: »Preberi stavek.« · ring on the new pocket row, »V redu«. On the sentence with the hard word: »Težka beseda? Tapni jo.« · ring on the word; the syllables show.
3. **Solve, step A (goal)** · »Kdo ni bil? Prečrtajva tiste.« (4–5 w) · ring on the faces, no finger.
4. **Solve, each alibi** · »Preberi svetel stavek.« → sentence ring+finger (this **is** `elimTarget()`) → »O kom govori? Tapni obraz.« → face ring+finger → stamp → one cheer word.
5. **Solve, last one** · »Ostal je eden. Kje je dokaz?« → proof sentence → face.
6. **Solved** · »Bravo, detektiv!« (`detTitle()`), after the excuse card: nothing more. Then, only if `lead_miss == 0`, the **skip offer** (section 3.4).

Teaches, in order: answer the call, open all, **read each sentence**, cross off with sentence + face, the last one needs proof, a hard word can be tapped.

### w2 script

1. **Start of the case** · one line, once: »Zdaj ti. Jaz gledam.« (4 w). The coin is visible; nothing is lit.
2. **First time the child reaches solve** · always once, stuck or not: »Zagata? Tapni me. Namig je zastonj.« (6 w); the coin breathes (pulse) until it is tapped or the child makes a first cross-off. This is the whole point of w2.
3. **Otherwise silent**, except the normal nudges at warm-up timings (idle 12 s → goal line; idle 25 s → next sentence glows) and the ladder after wrong pairs.
4. **Solved** · »Zdaj znaš! Gremo na pravi primer.« (7 w), no »skip« talk.

Teaches: do it without a lead; hints are free and asking is good; the instruction card is for reading.

### What a warm-up measures (quietly)

w1: `lead_miss` count only (it decides the skip offer). w2: the case verdict of section 3.2 plus `help_tap` count and whether the child used the coin before their first wrong pair (logged, not scored: playtest data).

### The old practice

Replaced. `TUTORIAL`, `startTutorial()`, `endTutorial()`, `S.tut` and the classic screens (`intro/story/accuse/evidence/reveal`) are removed in the last build step after the new flow is green; until then `toHome()` chooses which to run. `coach()` and `coachStep()` stay and become generic (section 6). The first-time UGOVOR coach (`lcoach`, `dp_ugovor_v1`) stays as it is.

---

## 2. Help levels

**Three** (fewer cannot separate a child who needs a nudge from one who needs a hand; more cannot be told apart in a short case). Adult labels (draft): **1 »Malo pomoči«**, **2 »Nekaj pomoči«**, **3 »Veliko pomoči«**. The child never sees a number or a word. A fourth state, **lead**, exists only in w1.

**Level 1 is today's game**, plus the free »?« and one gentle nudge after a long pause. So existing tests and existing children see almost no change. Default for legacy players.

Four kinds of help: **A goal** (the companion says the question), **B glow** (the next thing to read or tap glows softly), **C word** (tap a hard word, it splits into syllables), **D one at a time** (solve »po vrsti«). Plus two levers on every ladder: **P pause nudges** and **L ladder one try earlier**.

| | **1** | **2** | **3** |
|---|---|---|---|
| **A goal** | after idle 60 s | on entering each step (non-modal bubble, fades after 6 s), and after idle 25 s | pinned goal line above the footer on every step, changes with the sub-goal |
| **B glow** | after a wrong pick, or idle 90 s | after idle 45 s, or a wrong pick | always: the next unread sentence / unopened object / unanswered face has a soft steady glow |
| **C hard word** | words not marked; marks appear in a case after its first hint | words marked (dotted underline), tap splits | same as 2; the companion says »Težka beseda? Tapni jo.« once per case |
| **D one at a time** | – | offered (companion chip »Po vrsti?«) after the 2nd wrong pair | solve opens in walk mode (section 5) |
| **L ladder** | as today | as today | every ladder rung one wrong try earlier; the first gentle note comes together with `h1` |
| **P idle ladder** | 60 s goal | 25 s goal → 45 s glow → 70 s coin pulses | 10 s goal → 20 s glow → 35 s coin pulses |

(Seconds are constants in one `HELP` table, tuned in the first playtest. Idle time counts only while no card is open, the page is visible, and it restarts at every tap. Each nudge shows once per rung per screen, a tap on the screen dismisses it. **A nudge never blocks a tap.**)

### Per mechanic: what the child sees (levels 2 and 3 add to 1; 1 = today)

| Mechanic | A goal says | B glow lights | C word | D | Notes |
|---|---|---|---|---|---|
| 📞 call / 🎞 film | »Prisluhni. Kdo prosi za pomoč?« | the answer button; next film frame button | call text and captions | – | nothing to get wrong; idle nudge only |
| 🔍 scene | »Odpri vse stvari.« | the next unopened object (left to right) | pocket sentences | – (already one at a time) | at 3 the newest sentence keeps its `fresh` highlight until the next tap |
| 🗣️ ask | »Vprašaj vse. Vsak odgovori.« | the next face that still has questions; then the first unasked chip | answer bubbles | – (already one at a time) | glow never picks a question for the child |
| ❌ solve | step 1 »Kdo ni bil? Prečrtaj ga.«, last one »Ostal je eden: dokaz!« | the next **unvisited** sentence in reading order (not the answer) | sentences | walk mode at 3 | the answer-leading glow stays the hint ladder's job |
| 🔤 words | »Najdi besede s seznama.« | at 2 after idle: the next word in the list; at 3 the list item is ringed | list words, `h1` | – | row/letter hints stay on the ladder |
| 🔐 lock | »Kje je šifra? Poišči jo.« | – (nothing to glow); P-step 2 shows `h1` as a free hint | `note`, `h1` | – | `h2` still gives the code |
| 🕐 order / 📜 torn | »Kaj je bilo najprej?« / »Sestavi stavek.« | the next free slot | cards/strips | – | check only on »Preveri«, unchanged |
| ✉️ cipher | »Vsak znak je ena črka.« | the next empty cell | `note` | – | unchanged ladder |
| ❗ lie | »Kdo ne govori resnice?« | claims first; after a claim, the sentences | claims, sentences | – | first appearance: coach lines as now |
| 🧭 herring | »Je ta sled prava?« | the clue cards first; then sentences | clues | – | first appearance: new coach lines |
| ⏰ when | »Kdaj je bilo to?« | the next card | cards | – | at 2+ the time words are marked on a wrong try (was 3rd) |

The answer-giving rung of every ladder is unchanged and still **shows the reason**: the lit sentence, the pulsing face and one generic line naming the person (»{ime} ima alibi.« / »Ta stavek dokaže: {ime}.«), built from the case data (`clears`, `evidence`), so writers add nothing.

### The free »?«

The coin in the footer is a button at every level: each tap shows the **next rung** of the current step's ladder (same cards, same texts, same logs, `hint_shown` / `*_hint` with `via: 'coin'`). The rungs run out at the answer. Nothing is lost; `assisted` is set when the answer rung is shown, as today. This makes hints available without a mistake and is what w2 teaches.

---

## 3. The rule that sets and moves the level

### 3.1 State (per detective, in `KID_KEYS`, so multi-detective swap, transfer and »Nov otrok« work)

`dp_help_v1 = { v: 1, g: 1|2|3, over: null|1|2|3, warm: 'new'|'w1'|'w2'|'done'|'skipped'|'legacy', streak: 0, skills: { lie: { n: 1, hard: false }, … }, hist: [{ c: 'g3', g: 2, v: 'clean' }, …last 8] }`.

`effective(step) = over ?? max(g, firstOrHard(step) ? 2 : 1)`. Level is **frozen when a case starts** (`r.help = effective`); it changes only between cases, so the screen never changes shape under the child. Exceptions, both child-driven: the »Vsi stavki / Po vrsti« toggle, and the companion's »Po vrsti?« chip.

### 3.2 The case verdict (from run counters, at `case_done`)

Add per-step counters to the run where missing (puzzle wrong tries and last rung reached). Per case, summing steps that are **not** a first appearance (3.3):

- `wrong` = wrong solve pairs + wrong tries in puzzles/lie/herring/when (a gentle-note-only try counts).
- `rung` = highest ladder rung reached in any step (0 note, 1 `h1`, 2 location, 3 answer).
- `assisted` = any answer-giving rung shown (`assisted`, `lie_assisted`, `herring_assisted`, `when_assisted`, puzzle last rung).
- `coin` = taps on the free »?« that opened a rung ≥ 1.

| Verdict | Rule |
|---|---|
| **hard** | `assisted`, or `wrong ≥ 4`, or `rung ≥ 2` in two different steps |
| **clean** | `wrong ≤ 1` and `rung == 0` and `coin ≤ 1` |
| **helped** | everything else |

(Compare `analyzeSession`'s `clean/helped/assisted`: same spirit, but it counts only solve, and its `hints ≤ 1` cut would count the free coin against the child. The new function replaces it for help; the debrief keeps its table.)

### 3.3 Moving the level, after every real case

- **hard** → `g = min(3, g+1)`, `streak = 0`.
- **helped** → stay, `streak = 0`.
- **clean** → `streak++`; at `streak == 2` → `g = max(1, g-1)`, `streak = 0`. (A clean case at level 3 counts: that is the child managing with help, and we step down one notch at a time. A step back up needs only one hard case, so it errs towards helping.)
- One notch per case, never more. `over` set by an adult freezes `g` (it still computes, for the debrief).
- Log `help_level { from, to, verdict, wrong, rung, coin }` at case end.

**New skills do not move `g`.** The first appearance of a step type per detective (`skills[type].n == 0`: scene, ask, words, lock, order, cipher, torn, lie, herring, when) runs at `max(g, 2)` and its counters are judged **for that skill only**: if `assisted` or `wrong ≥ 3` in that step, `skills[type].hard = true`, which gives that step type `max(g, 2)` again next time; one clean appearance clears it. So a child who is fine at reading but hard-hit by ⏰ gets help on ⏰ only, and a new season's new skill (rung 5 negation is a *reading* knob, so it shows up as `g`) doesn't push a confident child back to level 3 for every step. For ❗/🧭/⏰ the first appearance also gets the companion-coached taps (the existing `lcoach` pattern, new lines for 🧭 and ⏰).

### 3.4 Starting level, from the warm-up

- **w2 verdict**: clean → `g = 1`, helped → `g = 2`, hard → `g = 3`. `streak = 0`. `warm = 'done'`.
- **Skip offer** (after w1 only if `lead_miss == 0`): two big buttons on the solved screen, companion line »Že znaš? Poskusi sam!« · [»Sam!«] [»Še en z mano«]. Skip → `g = 2` (unverified: first real case decides), `warm = 'skipped'`. Producer decides if the child sees it (section 10).
- A child who quits w1 or w2 half-way resumes it on the next launch (state `w1`/`w2` is kept until `case_done`).

### 3.5 Why a child cannot be stuck, at any level, and why it is not a label

- **Too low:** the coin gives the next rung on every tap; a pause nudge arrives at level 1 after 60 s; four wrong pairs give the answer. Worst case the child is shown the answer and the reason. That counts as `hard`, so the next case has more help.
- **Too high:** more help never removes a choice or a tap (nothing is blocked at 2/3; w1 lead is also non-blocking). A bored child clears cases cleanly and steps down in two cases. `walk` mode keeps `Vsi stavki` one tap away.
- **Never a label:** no number, no stars, no hint count, no »you needed help« anywhere a child sees. Same voice at every level; only *how often it speaks* and *what glows* change. Rank and medals count solved cases only, never help. The warm-up cases do not count as solved cases.
- **No yo-yo:** level frozen per case; down needs two clean cases, up needs one hard; the streak resets on any move.
- **Not used as signals** (logged only, for the playtest): reading time, idle seconds, `brief_ok` speed. A slow careful reader is not a struggling one, and fast instruction taps mean impatience, not need.

---

## 4. Hard-word help: syllables first

**Recommendation for the first build: the syllable split.** Reasons: it is *decoding practice* (the child still reads, a picture would replace reading); it works for any word (many hard Slovenian words have no picture: »ponoči«, »nihče«), pictures can leak the answer or an inflection, and scene objects already carry a picture. Pictures stay possible later for nouns, as `hardPic`.

### Data (additive, per case)

```
hard: { 'zvonec': 'zvo-nec', 'kapitanska': 'ka-pi-tan-ska' }
```

Key = the word **exactly as it appears** in the text, lower case (Slovenian inflection: each form a writer wants helped is its own key). Value = the split with `-`. The renderer wraps whole-word, case-insensitive occurrences in sentences, call lines, film captions and pocket rows in `<span class="hw">`. A tap splits it for 6 s (syllables with thin gaps and a middle dot), another tap or the timer returns it. The tap on the word does **not** select the sentence; a tap anywhere else on the row does. Logged `help_split { c, k }` (index into `hard`, no text).

### Checker rules (`tools/cases.mjs`)

1. Value minus `-` equals the key (case-insensitive).
2. Key occurs as a whole word in a sentence, call line, film caption or object label of that case; otherwise ✘ (dead entry).
3. 0–3 keys per case (exactly 1 in a warm-up); key length ≥ 6 letters.
4. Every syllable has a vowel or a syllabic `r` between consonants (`trn`, `prt`); no empty syllable; never split `lj`, `nj`; `č š ž` are one letter.
5. Key is not a character name (names are already bold), not a `words` grid word, not the `gives` of a cipher/torn/geslo (the child must decode those).
6. Info only (⚪): list unmarked words with ≥ 3 syllables and ≥ 7 letters as candidates.
7. For new seasons from `sneg` on, `hard` is required to exist (may be `{}` only if the writer states no candidate); older cases get a warning, not an error.

### Writer work

About 2 minutes a case: pick 1–3 words a 7-year-old may stumble on (the checker's candidate list helps), write the split. The Slovenian editor adds one check: »are the splits correct and the words really hard?«. Backfill of the 24 existing cases is optional and can wait; do the newest season first.

Tap target: a word is a small target, so the dotted underline plus a 44 px tall hit area (padding, `display:inline-block`) is needed. UX review must test on iPhone SE (375×667). Fallback if children don't find it: at level 3 the first hard word of the case is shown already split on first sight and then joins.

---

## 5. One sentence at a time (solve, level 3 »po vrsti«)

The child must still compare sentences and cross suspects off, so the list is never hidden, only **focused**.

- **Layout (portrait):** faces row as today → a **focus card** with one sentence in `--t-row` size → under it the full sentence list in a compact strip (numbered dots, one per sentence; struck dots for sentences that crossed someone off) → footer with ← , the coin, and `Naprej ▶`. The focus card shows the **previous sentence** in small grey text above it (needed when pronouns arrive in later seasons).
- **The focus sentence is `r.sel`.** A tap on a face with a focus sentence is exactly today's »sentence then face« pair, with the same checks, stamps and ladder. `Naprej ▶` moves the focus (to the next sentence not yet visited, then cyclic). A tap on a dot focuses that sentence, so jumping and comparing are one tap.
- **»Vsi stavki« chip** in the top-right of the focus card switches to the normal list for this case (`help_all` logged). A child who flips to it in two cases in a row lowers the walk offer next case (the chip stays; D is skipped at 3 for this detective until a hard case).
- **Landscape phone (852×393):** the focus card goes next to the faces; the dots strip is one row; the main button must stay on screen (check with `shots.mjs`).
- The state after »Ostal je eden. Pokaži dokaz!« is the same view.
- At level 2 the companion offers the same view as a chip after two wrong pairs; accepting sets `walk` for this case only.
- Not used in scene (already one object at a time) or ask (one bubble at a time).

---

## 6. The companion

- **One shared set of lines** in `UI_AUDIO` (`help*` keys). Slovenian gender trap: 🐶 is masculine, 🐱 🦉 🦊 feminine, so the lines contain **no first-person past tense or gendered adjectives**. Write in imperative, present tense and **dual** (»Preberiva.« / »Prečrtajva.«: warm, "we two", gender-neutral, and short). Language-bound: another language rebuilds the neutral tone. The child's own title (`detTitle()`) is fine, as today.
- **Optional flavour (producer):** one interjection per companion in the greeting and the cheer only, e.g. 🐶 »Hov!« 🐱 »Mijav!« 🦉 »Uhu!« 🦊 »Juhu!«; four words in a table, no new lines.
- **Where it sits:** the **coin in the footer**, between ← and the main button, 56 px (`--tap`), on every step screen. The footer is already on-screen without scrolling on iPhone 14 (390×844), SE and the landscape phone (852×393, the footer sits at the bottom beside the rail). The bubble appears as a **non-modal pill just above the footer**, ≤ 8 words, never over the sentence list; nudges are non-modal, hint ladder cards stay modal as now. Pulse = »tap me« (coin), soft glow = »read this« (sentence/object): UX defines two clearly different looks; **gold ring + finger stays reserved for w1's lead and the answer rung**.
- **Babica the owl:** removed from every help role. For a child who picked 🦉 the coin looks like Babica, so she must not be a helper; she needs a different face when she returns. **Producer decision:** (a) park her until a season wants a Miss Marple (recommended: story bible keeps the idea, no code), or (b) give her one letter/postcard per season in the corkboard flow. Not this build.
- **Animals are never suspects** is untouched: the companion appears only in the footer and in bubbles.

---

## 7. What the adult sees and overrides

In the debrief (»Pregled«), above the session table, a block **»Detektivi«**: one row per detective on this device (picture, rank, name as typed on the ID card):

- Level now (»Nekaj pomoči (2)«), a trail of the last 6 cases (`3 → 3 → 2 → 2`, with the verdict colours the debrief already uses), and the warm-up result (»Vaja: sam / z namigi / z veliko pomoči / preskočena / pred vajo«).
- A segmented control **»Pomoč: Samodejno · 1 · 2 · 3«**. Anything but »Samodejno« sets `over`; the row then says »(samodejno bi bilo 2)«. Takes effect from the next case.
- Buttons »Ponovi vajo« (sets `warm: 'new'`, replays w1+w2, keeps solved cases) and »Preskoči vajo«.
- Per case row in the existing table, add: `help_tap`, `help_nudge` accepted (the child tapped the lit target within 5 s), `help_split`, `help_all`, level at start. No new column for names; no IDs.

Adults reach it through the existing gate (hold the corner, answer the sum). Age: the setup's age group can set **»starejši otrok«**: down after one clean case instead of two (producer decision, section 10).

---

## 8. Existing players

At load, for each detective with no `dp_help_v1`:

- If `dp_tutorial_done` is true **or** any case is solved → `{ warm: 'legacy', g: 1 }`, and `dp_tutorial_done` stays. No warm-up, no questions. If the old log (same player id) holds at least one assisted case among the last three finished, start at `g: 2`; otherwise 1. (They have been playing level 1, so 1 is safe and the coin and nudges are the only difference.)
- No profile yet → the new flow: ID card → w1 → w2.
- »Nov otrok« in setup clears `dp_help_v1` with the other kid keys (today it sets the tutorial flag false) and so sends **that** child, not others, through the warm-up. Multi-detective swap and the transfer export carry the key via `KID_KEYS`.
- Legacy players with **zero** solved cases (made a card and the old practice, nothing more) get no forced warm-up; the adult has »Ponovi vajo«. (Producer may prefer a gentle offer; section 10.)
- The new `dp_help_v1` needs no `dp_save_version` bump (absent key = legacy).
- **Tests:** the existing `dp_tutorial_done` shortcut keeps working. New tests set `dp_help_v1` or use a `?help=1|2|3` pin (read once at start, ignored for real play unless in the adult override) so every mechanic test can run at a known level.

---

## 9. What every future case must carry (for the case-writer brief)

1. `h1` sends the child **to a specific sentence or object by name**, never »Poglej še enkrat«: the glow and the coin both use it. Add to the checker: `h1` must contain a word of the proof sentence, the alibi sentence it points to, or the object's label. Same for `lie.h1`, `herring.h1`, `when.h1` (now required, not optional, from `sneg` on) and every puzzle's `h1` and `h2` (already the rule; `h2` must give the answer).
2. `hard: { word: 'split' }` (section 4).
3. **Sentences in reading order**, like walking through the room. The reading glow and walk mode follow the authored order, so a proof at the very top ends the case in two taps; vary where the proof sits (already a variety rule) and let the glow be honest.
4. **Each sentence stands alone**, names not pronouns at level A (already the rule). When pronouns arrive (curriculum knob), a sentence that needs the one before it must still be readable with the previous sentence shown above it (walk mode does that).
5. Call lines ≤ 8 words each, 1–3 lines; they are read under the goal bubble.
6. A season's cases 1–2 re-teach any older skill (curriculum rule), because a new child starts at the **latest season**, not at Bip. The first appearance of each step type will be helped; the writer need not write extra text for it.
7. Nothing in a case may depend on the help level. A case is written once, at its level.
8. Language-bound parts: the dual-form companion lines, the syllable splits, and any `words`/`cipher`/`torn` content are Slovenian; another language rebuilds them.

Checker additions (all in `tools/cases.mjs`): the `warmup` file flag exempts `w1/w2` from the ladder, variety, six-case and final rules and applies its own (3 suspects, 4–6 sentences, `steps` exactly `['call','scene','solve']`, one `hard`, `warm` 1 and 2 each once, no `letter/card`); `hard` rules (section 4); `h1` names-a-place rule; `h1` required on lie/herring/when for files that opt in with `helpV: 1`. `tools/case.mjs --format` documents `hard`.

---

## 10. Decisions for the producer (not decided here)

1. **Skip offer:** shown to the child as two buttons after a clean w1 (recommended), or silent, or only adults can skip.
2. **Babica:** park (recommended) or a returning letter-writer; she is no helper in this build.
3. **Companion flavour words** (hov, mijav, uhu, juhu): yes/no.
4. **Legacy players with 0 solved cases:** no offer (recommended) or a gentle »Vaja z mano?« once.
5. **Warm-up counted as solved cases?** Recommended no (ranks stay about real cases); if yes, rank 🕵️ comes after 1 real case.
6. **Older children:** an adult-set »starejši otrok« (down after one clean case) from the setup's age group, or keep one rule for all.
7. **Latest season is a default, not a lock:** the hero card for a new child becomes the newest open season (today `fileOrder` picks the oldest for a new detective), and the other seasons stay pickable. Recommended; confirm that a new 7-year-old may also pick Bip.
8. **Labels** »Malo / Nekaj / Veliko pomoči« for the adult screen (Slovenian editor to polish).
9. **Lock in w2** (the children's favourite, and a place to meet a puzzle ladder in a safe case)? Not included here to keep w2 tiny; adding it costs one `lock` step and one more sentence-free line.
10. **Pause timings:** the table in section 2 is a guess; the first playtest sets it.

---

## 11. Build order (each step playable and testable alone)

Run `node tools/cases.mjs` after each and the touched browser tests; run all before a push.

| # | Step | Visible change | Browser test idea |
|---|---|---|---|
| 1 | **Help state.** `dp_help_v1`, `help()`, effective level, `?help=` pin, legacy detection, `KID_KEYS`, new log events. | none | `help-state.mjs`: a profile with `dp_tutorial_done` gets `warm:'legacy'`; `?help=3` pins; multi-detective swap and transfer carry the key. |
| 2 | **Companion coin + free »?«** in the footer of every step screen; each tap opens the next ladder rung of the current step (solve first, then the others); the goal-pause nudge at level 1. | the coin appears | In `b1`: from the solve screen with no wrong pair, tap the coin four times → `h1`, glow, answer; the case solves. Wait 60 s (fake the clock) → goal bubble, non-modal; tapping a sentence still works. |
| 3 | **Warm-up data + checker.** `w1`, `w2` in the `warm` file, `warmup` rules, `hard` data (rendering comes in step 8). | none (hidden) | `cases.mjs` passes; a deliberately bad warm-up fails each new rule. |
| 4 | **w1 lead** on the generic `coach()`: scripted lines, `elimTarget()` as the ring, `lead_miss`, no instruction cards. | a case is playable through the ring | `warm1.mjs`: click only `.coach-target` each step → solved with `lead_miss == 0`; click a wrong face once → the bubble repeats the target, the case still ends. |
| 5 | **w2 quiet** plus the »Zagata? Tapni me« moment, the accelerated ladder, normal instruction cards. | | `warm2.mjs`: play alone; assert the coin line appears once at solve entry and not again; a wrong pair gives `h1` at once. |
| 6 | **New flow.** `toHome()`: ID card → w1 → skip offer → w2 → files with the newest season as hero; old practice behind a flag. | the new beginning | `newkid.mjs`: new profile reaches `files` with hero = newest open season, `warm:'done'`; `Skip` path sets `skipped, g:2`; reload mid-w1 resumes it. **Good first playtest point.** |
| 7 | **Level engine.** Verdict, movement, skills, first-appearance bump, `help_level` log. Pure function `helpVerdict()` testable in the page. | none yet (effect only in 8–10) | `help-level.mjs`: table-driven counters → verdicts; two clean → down; hard → up; first lie with 3 wrong marks `skills.lie.hard` and leaves `g`. |
| 8 | **Aids A+B+P+L by level** in solve, scene, ask, then puzzles and reasoning steps. | companion speaks and glows at 2–3 | With `?help=1/2/3` play `b1`: goal bubble at entry only at ≥ 2; the glow follows reading order and never the answer; at 3 the first wrong pair shows `h1`. |
| 9 | **C hard words.** Render, tap split, checker rules, `hard` on the newest season (and `sneg` when written). | marked words | Tap a `.hw`: syllables show and the sentence stays unselected; tap elsewhere: selected. |
| 10 | **D walk mode** at 3 (and the chip at 2). | solve looks different at 3 | `?help=3`: focus card follows `Naprej ▶`; a wrong pair still counts; `Vsi stavki` shows the list; `shots.mjs` clean on iPhone 14, SE and landscape. |
| 11 | **Adult block** in the debrief: level, trail, override, repeat/skip warm-up. | adult only | Override to 3 → next case starts at 3 despite two clean cases; »Samodejno« returns. |
| 12 | **Clean-up:** remove `TUTORIAL`, classic screens and `S.tut`; README, `solo/README.md`, case-writer and puzzle-designer briefs updated; `CURRICULUM.md` marked built. | | all tests green |

UX: every new element (coin, bubble, focus card) must fit iPhone 14, SE and a landscape phone without scrolling to the main button (`shots.mjs`). A bubble must never cover the sentence list.

## 12. What to watch in the first playtest

- **w1:** does the child follow the ring alone, or ask for the adult? How many `lead_miss`? Do they read the sentences or tap the glow without reading? (Compare time per pocket row.)
- **w2:** did the »Tapni me. Namig je zastonj.« line land? Did the child tap the coin **before** a wrong pair, later in w2, in the first real case? (`help_tap` with and without a preceding wrong pair.)
- The **level path** over cases 1–6 of the first season: does it oscillate? Did anyone sit at 3 for the whole season, or drop to 1 by case 3? Does the verdict (`clean/helped/hard`) agree with what the adult saw?
- **Nudges:** accepted vs ignored; did one startle or annoy? Did a child say »I know!«? Idle thresholds from the numbers.
- **Hard words:** did the child find the dotted word? `help_split` per case.
- **Walk mode:** did level-3 children use »Vsi stavki«? Did walk mode make guessing faster (many pairs in a few seconds)?
- **Skip offer:** how many take it, and does `g` after a skipped w2 end up at 1, 2 or 3?
- **Existing children:** does the coin or a nudge confuse a child who was fine? Anything lost for them?
- A new child who is dropped into the **latest season** cold: where do they stall that Bip's children did not (UGOVOR, »Kdaj?«)? That tells which skills the warm-up must also carry.
