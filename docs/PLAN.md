# Detektivska pisarna: MVP validation prototype (plan)

## Context
A Slovenian detective reading game for children aged 6–9. The prototype is for validation, not launch. It has to answer four questions:
- Q1: Do children reread the text or guess?
- Q2: Can they tap the correct evidence sentence?
- Q3: Do they finish a case and ask for another?
- Q4: Which rung of the skill ladder is too hard for which age?

Decisions taken:
- I write full Slovenian draft texts (Appendix). A native speaker checks them before recording.
- The playtest is 1-on-1 with friends and family.
- The device is an iPad with Safari. Safari has **no Slovenian TTS voice**, so read-aloud uses **pre-recorded clips, one per sentence**, embedded in the HTML. Tap-per-sentence behaviour is unchanged. `speechSynthesis` (sl-SI) stays available only for desktop development.

---

## 1. MVP scope
**In:**
- One `index.html` file with inline CSS and JS.
- 3 cases × 2 levels.
- Mechanics: tap a sentence to hear it, pick a suspect, tap the evidence sentence.
- Three-step gentle hints, then assisted completion.
- A short reveal after each case.
- A "Še en primer?" fake door after case 3.
- An on-device event log, shown on an adult debrief screen behind a gate, with JSON export and delete.
- Placeholder art: coloured circles with animal emoji.

**Out:**
- Accounts, names, analytics, network calls, a backend.
- Scores, timers shown to the child, lives, penalties.
- Narration of the whole text.
- Free text input.
- Animations beyond a highlight or pulse.
- A level picker for the child.
- Saving progress between sessions.
- Sound effects and music.
- A case editor (cases are a JS array).
- Android or desktop polish.

**Delivery:** The app is hosted once as a static URL (e.g. GitHub Pages) and added to the iPad Home Screen. After loading it makes zero network requests. A small `sw.js` (network-first, cache fallback) lets it reopen offline. Home Screen apps are exempt from Safari's 7-day storage eviction. Still, export the JSON after every session.

## 2. Case template
```
{ id, rung: 1|2|3, level: "A"|"B", title, question,          // question shown on intro + evidence screen
  suspects: [{id, name, animal, color}], culprit,
  sentences: [{id, text, audio, role: "evidence"|"partial"|"distractor"|"neutral"}],
  hints: [h1_strategy, h2_narrow(sentenceIds), h3_two_choices(sentenceIds)],
  partialHint, wrongSuspectHint, reveal }
```
| Rule | Level A (6–7) | Level B (8–9) |
|---|---|---|
| Sentences | 7–9 | 9–11 |
| Words per sentence | ≤ 8 | ≤ 14 |
| Suspects | 3 | 4 |
| Syntax | One clause. Names, not pronouns, in key sentences. | One subordinate clause allowed. One-step pronoun reference allowed. |
| Vocabulary | Everyday, concrete, high-frequency words | Plus a few less common nouns (klet, storži, polica) |
| Distractors | ≤ 1 | ≤ 2 |

**Rules for all cases:**
- Exactly one `evidence` sentence. It is never the first or the last sentence.
- Rung 3 cases may also have one `partial` sentence: the other half of the contradiction.
- The same 4 characters appear in every case: Bine (zajec), Zala (lisica), Jure (medved), Neža (veverica).
- No crime and no punishment. The culprit always has a kind or funny reason, revealed at the end.
- Each case has at least one distractor, so rung 4 is measured in every case. There is no separate rung-4 case.

## 3. Three cases (full texts in the Appendix)
| # | Rung | Mystery | Level A evidence | Level B evidence | Distractor(s) |
|---|---|---|---|---|---|
| 1 | Stated fact | Kdo je vzel rdečo žogo? | "Jure je dal žogo v svojo torbo." | "Preden je Jure odšel domov, je žogo pospravil v nahrbtnik." | B: Jure ran around with the ball (near-evidence) |
| 2 | Simple inference | Kdo je pojedel borovnice? | "Jure ima čisto moder jezik." | "Zobje in jezik so mu bili temno modri." | Zala loves blueberries. B: Bine has green paws (a colour lure). |
| 3 | Contradiction | Kdo je skril Nežin klobuk? | Zala: »Poglej na streho lope!« (partial: »Jaz ne vem nič o klobuku.«) | Zala: »Pojdi pogledat na streho lope.« (partial: »…danes ga sploh nisem videla.«) | Zala giggles. B: Jure's "the wind blew it away". |

All children play the cases in order 1 → 2 → 3, which follows the ladder. The adult sets the level by age.

## 4. Screen flow
0. **Adult setup** (behind the gate): pick the age group, which sets the level. A child code is created automatically (O01…). An audio check plays a test clip ("Slišiš?"). Then Start.
1. **Pisarna** (title): one big "Začni" button.
2. **Case intro**: the question plus the suspect cards. The question can be played aloud.
3. **Story**: one sentence per row, each at least 56 px tall. Tapping a row plays its clip and highlights it. The "Vem, kdo je bil!" button is always enabled. Pressing it before the child has scrolled to the end is logged.
4. **Accuse**: tap a suspect card.
5. **Evidence**: "Pokaži stavek, ki to dokaže." Same text. Tapping a row selects it and plays it, then the child presses "To je dokaz!". The child can always go back to the story.
6. **Feedback**: shown on the evidence screen, never as a modal fail.
   - A wrong tap triggers the next hint: H1 (reading strategy) → H2 (highlight a 3-sentence block) → H3 (2 candidates). A fourth wrong tap makes the evidence sentence pulse, and that solve is logged as *assisted*.
   - Tapping the `partial` sentence gives: "To je pomembno! Ali kdo kasneje reče kaj drugega?"
   - Tapping the right sentence with the wrong suspect gives: "Ta stavek je pomemben, ampak o kom govori?"
   - After 2 wrong taps, a "Zamenjaj osumljenca" button appears.
   - Every hint card has a "V redu" button. This slows down sweep-tapping without punishing it.
7. **Reveal**: a "Primer rešen!" stamp, a short "ker…" explanation (each sentence can be played), and a sticker.
8. **Še en primer?**: "Da" or "Dovolj za danes". After case 3, "Da" opens the fake door "Nov primer pride kmalu!", and the tap is logged.
9. **Debrief** (adult): open by holding the top-left corner for 3 s, then solving a simple sum.

## 5. On-device log and debrief
**Storage:** events are written to `localStorage` as `{ts, session, child, age, case, level, screen, type, sentenceId?, suspectId?, hintLevel?}`.

**Event types:**
- `screen_enter`
- `listen` (sentence played)
- `scroll_end`
- `accuse_early` (pressed "Vem" before reaching the end)
- `suspect_pick`
- `evidence_select`
- `evidence_confirm` (role: evidence, partial, distractor or neutral)
- `hint_shown`
- `assisted`
- `back_to_story`
- `case_done`
- `more_yes` / `more_no`
- `fake_door`

**Derived metrics:**
- **Reread**: replaying a sentence already heard, scrolling back up after `scroll_end`, or `back_to_story`.
- **Guess flag**: a confirm less than 4 s after entering the evidence screen with no listen or scroll in between, or 3 or more confirms within 15 s.
- **First-confirm latency**: time from entering the evidence screen to the first confirm.
- **Solved clean**: ≤ 1 hint. **Solved helped**: 2–3 hints.

**Debrief layout:**
- A session list.
- Per child, a table with one row per case and these columns: done, time on story / evidence, listens, rereads, wrong confirms (distractor count shown separately), max hint, assisted, guess flags, more?
- Cells are coloured green, amber or red against the section 6 thresholds.
- Tapping a row opens the event timeline, with the actual sentence text.
- An **age-group summary** gives the solved-clean and solved-helped share per rung, plus the distractor tap rate.
- Buttons: "Izvozi JSON" (download to Files) and "Izbriši vse" (asks for confirmation).

## 6. Playtest protocol
**Sample:** 10 children, 5 aged 6–7 and 5 aged 8–9. The minimum is 4 per group. Run a pilot with 1 child first, and do not count that child. Each session is about 25 min, 1-on-1.

**Who facilitates:** someone who is not the child's parent. A parent may sit out of view.

**The adult observes**, using a paper sheet with one row per case:
- Eyes or a finger tracking back up the text.
- Whispered rereading.
- Spontaneous "ker…" reasoning.
- Asking for help.
- Frustration signs: sighing, random tapping, looking at the adult.
- Asking spontaneously for another case.
- Mood after each case, on a 3-face scale.

**The adult must NOT:**
- Read the text aloud.
- Point at the screen.
- Confirm or deny an answer.
- Praise before the app does.
- Re-explain a hint.

**Allowed scripted prompts:**
- "Kaj misliš?"
- "Kaj pravi zgodba?"
- "Lahko poslušaš stavek."

Word meanings may be explained once each, and each one is noted. Stop immediately if the child shows distress.

**Exit questions:**
- "Kateri primer je bil najtežji?"
- "Bi se še igral/a?"

**Thresholds** (per age group of 5; "case attempts" = 15 per group):
| Question | Success | Fail |
|---|---|---|
| Q1 Reread vs guess | ≥ 4/5 children have a reread before their correct confirm in ≥ 2 cases, AND guess flags on < 25 % of confirms | ≥ 3/5 children have guess flags on > 50 % of confirms |
| Q2 Correct evidence | ≥ 70 % of case attempts solved clean or helped (≤ 3 hints) | < 40 % |
| Q3 Finish and want more | ≥ 4/5 finish all 3 cases without unscripted help, AND ≥ 3/5 tap the fake door or ask spontaneously | ≤ 2/5 finish, OR ≤ 1/5 want more |
| Q4 Rung too hard | Rungs 1–3: a rung is too hard if < 50 % of children solve it with ≤ 3 hints, OR 2 or more children want to stop at it. Rung 4: too hard if distractor confirms make up > 50 % of that group's wrong confirms. | — |

Anything between success and fail counts as *inconclusive*. Inconclusive means changing the content, not the concept.

## 7. Top 5 risks
1. **No Slovenian TTS on iPad.** Use pre-recorded clips, 100 short clips (`node tools/cases.mjs clips` lists them) at 32 kbps, roughly 1.5 MB inlined. The audio check screen confirms sound before each session.
2. **Decoding load hides comprehension**, especially at ages 6–7. Mitigated by per-sentence audio and strict level limits. The log separates listening from reading (listens per sentence), so we can tell "can't read" apart from "can't infer".
3. **Sweep-tapping or guessing** instead of reading. The "V redu" card adds friction without a penalty. Guess flags and early-accuse events measure it directly (Q1). If guessing dominates, that is a fail signal for the core mechanic.
4. **Ambiguous evidence:** a child reasons correctly but taps a sentence we didn't anticipate. Before playtesting, 2 adults and 1 teacher solve every case blind. Wrong confirms in the debrief are reviewed for valid alternatives, which are added to `partial` or accepted.
5. **Friendly-sample and observer bias:** children who know us say "yes, more!" to please. Q3 uses the logged fake-door tap, not the verbal answer. The facilitator is not the parent and follows the prompt script. Results are treated as directional, not as proof.

## Build plan (about 4 evenings) and verification
- **Evening 1:** case data format, screen router, story and evidence screens.
- **Evening 2:** hint ladder, logging, derived metrics.
- **Evening 3:** debrief screen, export, adult gate, audio playback.
- **Evening 4:** a native speaker reviews the texts and records the clips (`audio/c1A_s3.m4a` …); `node tools/build.mjs` base64-inlines them into `dist/index.html`.

**Verification:**
- Play every case on both levels on the iPad in airplane mode after loading.
- Script-check every sentence against the word limits and that each case has exactly one evidence sentence.
- Force each hint path.
- Check that the debrief numbers match a hand-counted session.
- Run the pilot with 1 child.

---

## Appendix: Slovenian draft texts (a native speaker must review them; **[E]** = evidence, **[P]** = partial, **[D]** = distractor)

**Case 1, Rung 1: Kdo je vzel rdečo žogo?**
*A:*
- Zjutraj je bila na igrišču rdeča žoga.
- Zdaj je ni več.
- **[D]** Včeraj je Bine brcal to žogo.
- Danes se je Bine igral v pesku.
- Zala je jedla jabolko.
- Neža je plezala na drevo.
- **[E]** Jure je dal žogo v svojo torbo.
- Potem je šel domov.
- Bine je zgradil velik grad.

*B:*
- Po pouku je na igrišču ostala nova rdeča žoga.
- Naslednje jutro je ni bilo nikjer.
- Bine je ves popoldan gradil grad v pesku.
- Zala je sedela na klopci in brala knjigo o zvezdah.
- Neža je pod veliko smreko nabirala storže.
- **[D]** Jure je še zadnji tekal po igrišču z žogo.
- Ko se je zmračilo, je Zala zaprla knjigo in odšla.
- **[E]** Preden je Jure odšel domov, je žogo pospravil v nahrbtnik.
- Bine je na grad postavil zastavico iz lista.

*Hint H1:* "Poišči stavek, kjer piše, kaj je kdo naredil z žogo."
*Reveal:* "Jure je žogo vzel domov, da je ne bi zmočil dež. Jutri jo prinese nazaj."

**Case 2, Rung 2: Kdo je pojedel borovnice?**
*A:*
- Na mizi je bila skleda borovnic.
- Zdaj je skleda prazna.
- **[D]** Zala ima zelo rada borovnice.
- Zala zdaj spi pod drevesom.
- Bine skače po travi.
- Neža nabira lešnike.
- Jure se smeje.
- **[E]** Jure ima čisto moder jezik.
- Bine pogleda v prazno skledo.

*B:*
- Babica je na okensko polico postavila skledo svežih borovnic.
- Ko se je vrnila iz kleti, je bila skleda prazna.
- Zala je bila ves čas z babico v kleti.
- **[D]** »Borovnice imam najrajši na svetu,« je rekla Zala.
- **[D]** Bine je na vrtu lovil metulje, zato je imel zelene tačke.
- Neža je na drevesu luščila lešnike.
- Jure je prišel v kuhinjo in se široko nasmehnil.
- **[E]** Zobje in jezik so mu bili temno modri.
- Babica je pogledala prazno skledo in nato Jureta.

*Hint H1:* "Kaj se zgodi z jezikom, ko ješ borovnice?"
*Reveal:* "Jure je mislil, da so borovnice za vse. Babici je pomagal nabrati nove." (Level A: "Potem je pomagal nabrati nove.")

**Case 3, Rung 3: Kdo je skril Nežin klobuk?** (Neža is the victim, so level B suspects are Bine, Jure, Zala and Babica.)
*A:*
- Neža ne najde svojega zelenega klobuka.
- Vpraša prijatelje.
- Bine reče: »Nisem ga videl.«
- Jure reče: »Jaz tudi ne.«
- **[P]** Zala reče: »Jaz ne vem nič o klobuku.«
- **[D]** Zala se hihita.
- **[E]** Nato Zala reče: »Poglej na streho lope!«
- Neža pogleda na streho.
- Tam je njen zeleni klobuk!

*B:*
- Neža je zjutraj obesila svoj zeleni klobuk na kljuko pred vrati.
- Ko je hotela na sprehod, klobuka ni bilo več.
- Bine je ves dopoldan pomagal babici peči piškote.
- Babica je prikimala in pokazala poln pladenj.
- »Mogoče ga je odpihnil veter,« je rekel Jure in zazehal. **[D]**
- **[P]** Zala je rekla: »Ne vem, kje je, danes ga sploh nisem videla.«
- **[D]** Ko se je Neža obrnila, je Zala tiho zahihitala.
- **[E]** Čez trenutek je Zala rekla: »Pojdi pogledat na streho lope.«
- Neža je pogledala in tam je visel njen klobuk.

*Hint H1:* "Ali je kdo rekel dve stvari, ki ne gresta skupaj?"
*Reveal:* "Zala je hotela narediti šalo. Klobuk je vrnila in se opravičila."
