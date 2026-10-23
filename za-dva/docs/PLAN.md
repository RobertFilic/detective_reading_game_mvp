# Detektivska pisarna za dva: co-op MVP validation prototype (plan)

## Context
We want a second prototype built the same way as the solo detective game (`detective_reading_game_mvp`): one self-contained `index.html`, Slovenian, for children aged 6–9, run on an iPad, with an on-device log and an adult debrief. The new idea is **co-op without time pressure**. Two children share one iPad, and **each sees different clues**. Neither half solves the case alone, so they have to read their clues to each other and combine them. There are no timers, scores or penalties.

What the playtest has to answer:
- **Q1 Sharing:** Do the children read their clues aloud to each other, or does one child take over or peek?
- **Q2 Combining:** Can a pair join two clues from different halves into one conclusion?
- **Q3 Fun:** Does the pair finish 3 cases and ask for another?
- **Q4 Pairing:** Does it work for same-age pairs and for mixed-age pairs (e.g. 6 + 9)?

Location: the `za-dva/` folder of this repo, next to the solo game in `solo/`. A start page at the repo root lets you pick either game.

## 1. Core mechanic
- The iPad lies flat between two children sitting opposite each other, in **portrait** orientation. The screen is split into two halves, and the **top half is rotated 180°** so each child reads their own half the right way up.
- Both halves show the same case question and the same suspect strip. Each half has its own **clue card** of 4–5 sentences.
- The solution always needs **one sentence from each half**. The cases use 3 kinds of combination, which form the co-op ladder:
  1. **Join:** A says *who was where*, B says *where the thing happened*.
  2. **Inference:** A describes *a trace* (blue paw prints), B describes *who caused it* (Jure was picking blueberries).
  3. **Elimination:** each half rules out some suspects, and only the two together leave one.
- **Accuse together:** each child taps a suspect on their own half. When the picks differ, the app says "Še nista enotna. Pogovorita se!" (no penalty). When they match, the game goes on.
- **Evidence together:** each child taps the sentence on their own card that proves it, then presses "To je moj dokaz!". The case is solved when both are correct.
- **Hints** go to both halves at once: H1 "Preberi svoj listek prijatelju na glas." → H2 highlight a 2–3 sentence block on each card → H3 two candidates per card → assisted (the evidence sentences pulse). Each hint card has "V redu", as in the solo game.
- **Audio:** tap-to-listen per sentence comes from the solo game, but there is one speaker, so it would play a child's clue to both children. It is an **adult setting, default off**, so that sharing has to happen by reading aloud. The debrief records which setting was used.

## 2. Case template
```
{ id, rung: "join"|"infer"|"elim", level: "A"|"B", title, question,
  suspects: [...], culprit,
  cards: { top: [{id, text, role}], bottom: [{id, text, role}] },   // role: evidence|distractor|neutral
  hints: [h1, h2_blocks{top,bottom}, h3_pairs{top,bottom}],
  disagreeHint, reveal }
```
Rules: exactly one `evidence` sentence per card. A card alone must **not** identify the culprit, and `tools/cases.mjs` checks this with a marker per case (`aloneSuspects`). Level limits (words per sentence, syntax, vocabulary) are the same as in the solo plan. Each card has 4–5 sentences at level A and 5–6 at level B, with ≤ 1 distractor per card. The cast is the same: Bine, Zala, Jure, Neža (+ Babica).

**Cases (drafts, to be written in full and checked by a native speaker):**
1. *Join* — Kdo je vzel rdečo žogo? Top: "Žoga je bila pri peskovniku." Bottom: "V peskovniku se je igral samo Bine."
2. *Infer* — Kdo je pojedel borovnice? Top: "Na mizi so modre sledi tačk." Bottom: "Jure je zjutraj nabiral borovnice."
3. *Elim* — Kdo je skril Nežin klobuk? Top rules out Bine and Jure, bottom rules out Babica, so only Zala is left.

## 3. Screen flow
0. **Adult setup** (behind the gate): pair code (P01…), the age of each seat (top/bottom), level A/B, the audio toggle, then Start.
1. **Title:** one "Začnita" button, which needs **both** halves to press (a first, gentle "we do this together" moment).
2. **Case intro:** the question and suspects, mirrored on both halves.
3. **Clue cards:** each half has its card plus a "Vem, kdo je bil!" button. The accuse step opens when both have pressed it.
4. **Accuse together** → 5. **Evidence together** (with feedback and hints as above).
6. **Reveal:** a "Primer rešen!" stamp that shows both evidence sentences side by side with "ker…".
7. **Še en primer?** After case 3 it opens the fake door, and the tap is logged.
8. **Debrief** (adult): the same gate (hold the corner for 3 s + a sum).

## 4. Log and debrief
Events are the same as in the solo game, plus a `seat: "top"|"bottom"` field. New events: `ready` (pressed "Vem"), `pick_mismatch`, `pick_match`, `evidence_confirm` per seat. Derived metrics per case: time on cards per seat, mismatches before agreement, wrong evidence per seat, max hint, assisted, and which seat confirmed first (one child dominating shows up as a large gap). Talk can't be logged, so the **observer sheet** carries Q1: reads own card aloud, asks the partner, points at the other half, peeks, one child takes over, mood per child.

**Thresholds** (aim for 6 pairs: 2 aged 6–7, 2 aged 8–9, 2 mixed, plus 1 pilot pair that isn't counted):
- Q1 success: in ≥ 4/6 pairs both children read their card aloud in ≥ 2 cases. Fail: in ≥ 3/6 pairs one child solves alone by peeking or taking over.
- Q2 success: ≥ 70 % of case attempts solved with ≤ 3 hints. Fail: < 40 %.
- Q3 success: ≥ 4/6 pairs finish all 3 and ≥ 3/6 tap the fake door.
- Q4: compare Q1 and Q2 for mixed pairs against same-age pairs (directional only).

## 5. Reuse from `detective_reading_game_mvp`
Copy, then adapt:
- `index.html` structure: the `S` state, `go()`/`render()` router, `T` templates, `ACTIONS` map, `log()`, `play()` with clip → sl-SI TTS fallback, `openGate()`, `analyzeSession()`, `timelineHTML()`, JSON export/delete, and the `CASES-BEGIN/END` and `AUDIO-BEGIN/END` markers.
- `tools/lib.mjs`, `tools/build.mjs`, as they are.
- `tools/cases.mjs`: adapt the rules to the two-card format and add the "a card alone is not enough" check.
- `sw.js` (change the cache name), `.gitignore`, and the README layout.

New code:
- The two-half layout: CSS grid with 2 rows, `.top { transform: rotate(180deg) }`, with touch handled per half.
- A "both ready" sync helper.
- Per-seat state, with hints rendered into both halves.

## 6. Build plan (about 3–4 evenings)
1. Scaffold the folder from the solo repo, the split-screen layout and both-press start, and test the rotation on the iPad.
2. The case format, the clue cards, accuse together and evidence together.
3. The hint ladder, seat-aware logging, metrics and the debrief.
4. Full Slovenian texts for 3 cases × 2 levels, `cases.mjs` validation, an optional audio pass and `build.mjs`.

## Verification
- `node tools/cases.mjs`: every case passes, including the "a card alone is not enough" check.
- Two adults play every case on both levels on the iPad, sitting opposite each other, in airplane mode after loading.
- Force each path: mismatch, wrong evidence on each seat, the full hint ladder, assisted, and the fake door.
- Check the debrief numbers against a hand-counted session, and check that the JSON export opens.
- Run the pilot pair, then decide on any content changes before the counted pairs.
