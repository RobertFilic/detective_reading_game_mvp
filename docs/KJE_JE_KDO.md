# »Skrivnostne sobe« (first »Kje je kdo?«): a Murdoku-style side puzzle for kids

## Context
The producer added 22 screenshots to `Detective2/images/` of an English mobile app ("Crime Files", 6 seasons × 160 cases, Easy → Extreme, a paywall for post-mistake clues). They asked:
- Do I know this kind of game?
- Can I suggest a **2-level test version for kids** as a side game on bralnidetektivi.si?
- No coding yet.

**Yes, I know the genre.** It is **Murdoku** ("murder sudoku"), a logic puzzle made popular by Manuel Garand's 2024 puzzle books and now copied by many apps.

**The rules, as the screenshots show them:**
- An N×N floor plan is split into rooms.
- N people must each go into one cell, with **no two in the same row or column** (the sudoku part).
- Objects either can hold a person (chair, sofa, bed, carpet) or block the cell (box, plant, tree, rock).
- "Beside" means up, down, left or right. Diagonals don't count.
- Each person has one clue sentence ("He was beside a plant." / "She was in the Greenhouse with another woman.").
- When the board is full there is exactly one answer. The killer is the **only person in the same room as the victim**.
- Tools: notes, crosses, place, erase, hint, undo, and a timer.

**Why it fits us:**
- Every move comes from **reading one short sentence** and acting on it, so it trains our core skill (read → find proof) without a story to read first.
- It uses words we already teach: *ob, v, na, ni, sam*.
- It is the "🟦 Logična mreža" idea from `docs/PUZZLES.md` §7, but nicer to look at, because it is spatial.
- It replays well and can be made in large numbers. This is a natural job for a studio agent later.

## What we keep, what we change for 7–8-year-olds

| Original | Our version |
|---|---|
| Murder, a victim, "killer" | **Nobody gets hurt.** Something goes missing (a cake, a crown). The culprit is the **only person in the same room as the missing thing's spot**. Only people are suspects (producer rule). |
| 6×6, 6 people, up to 7 rooms | **Level 1: 4×4, 4 people, 3 rooms. Level 2: 5×5, 5 people, 4 rooms.** |
| 5 tools + notes | **2 modes only:** tap a face, then tap a cell to place them. Long-press or an "✖" toggle to cross out a cell. Tap a placed person again to remove them. Undo stays. No notes. |
| Crosses by hand | **Automatic crosses** for a placed person's row and column, which are greyed out (as PUZZLES.md §7 advises: the work is thinking, not bookkeeping). |
| Timer, "Not quite right" screen, paid post-mistake clues | **No timer, no paywall.** A wrong placement is shown gently on the spot (that person's sentence glows, "Preberi še enkrat"). The hint follows our help ladder: (1) highlight the sentence to read, (2) highlight the cells it allows, (3) place the person. |
| Clue only for the selected suspect | **All clue sentences visible as cards** under the board, in capitals or our reading font. Re-reading them is the reading practice. Each card ticks ✔ when its person is placed. |
| Initials on tokens | **Face plus name** on the token: initials alone are hard at 7. |
| Ending: submit solution | When the board is full, the question appears: **"Kdo je bil sam pri …?"** The child taps a face, and a "Primer rešen!" card follows, in our reward style. |

Every target is ≥ 48 px. A 5×5 board fits a 360 px phone at about 64 px per cell.

## The two test levels (each checked with a small brute-force solver: exactly one solution)

### Level 1 — "Kdo je načel torto?" (4×4, positive clues only)
```
      c0        c1        c2        c3
r0  KUHINJA   KUHINJA   SOBA      SOBA 🪴(blocks)
r1  KUH 🎂    KUHINJA   SOBA      SOBA 🛋️ kavč
r2  VRT       VRT       SOBA 🪑   SOBA
r3  VRT 🌳    VRT       VRT       SOBA
```
🎂 the cake and 🌳 the tree block their cells.
- **Ana:** »Ana je sedela na kavču.« → r1c3
- **Bor:** »Bor je bil na vrtu.« → r3c1, the only free garden cell once Ana's and Cvetka's rows and columns are out
- **Cvetka:** »Cvetka je sedela na stolu.« → r2c2
- **Dan:** »Dan se ne spomni, kje je bil.« → the last free cell, r0c0 (it teaches "the last one goes where there's room")
- **Question:** »Kdo je bil sam v kuhinji s torto?« → **Dan** 🍰

Skills: *na kavču / na stolu / na vrtu*, plus the row and column rule.

### Level 2 — "Kje je zlata kronica?" (5×5, adds *ob* and *ni*)
```
      c0        c1        c2         c3          c4
r0  KUH 🔥     KUHINJA   KUH 🪑     SPALNICA    SPAL 🧰 skrinja
r1  KUHINJA   KUHINJA   DNEVNA     SPAL 🛏️     SPALNICA
r2  DNEV 🛋️   DNEVNA    DNEV 🟥    SPALNICA    SPALNICA
r3  VRT 🌳     VRT       DNEVNA     DNEVNA      SPALNICA
r4  VRT 🌿     VRT       VRT        VRT         VRT 🪑 klop
```
🔥 the stove, 🧰 the chest, 🌳 the tree and 🌿 the bush block their cells. 🟥 is a carpet.
- **Bor:** »Bor je sedel na kavču.« → r2c0
- **Eva:** »Eva je sedela na klopi.« → r4c4
- **Ana:** »Ana je stala ob drevesu.« → r3c1 (the other cell beside the tree is Bor's, and the bush blocks the third)
- **Cvetka:** »Cvetka ni bila v spalnici.« → r0c2
- **Dan:** »Dan ni stal ob skrinji.« → r1c3
- **Question:** »Kdo je bil sam v spalnici s skrinjo?« → **Dan** 👑

The solver confirms that **every clue is needed**: dropping any single clue gives 2–36 solutions. The two *ni* clues only work together at the end, which is the "aha" moment of level 2.

All Slovenian is a draft for the **slovenian-editor** and a native speaker (e.g. *načel torto*, *stala ob*).

## How it would sit on the site (when we build)
- **A new page `uganke/index.html`** (or `/kje-je-kdo/`) as a separate single-file game, like `solo/`. It reuses the v4 "Tiha lupa" tokens, the fonts and the reward-card style, and has no audio (facelift memory).
- **Start page:** a small secondary tile under "Igraj!" (»Uganka: Kje je kdo?«). It does not change the main flow.
- **Levels as data:** `{rooms[], objects[], people[{name, face, clue, check}], missing:{cell, room}, question}`. The engine checks each placement against the solution, not against the clue logic.
- **A checker script** (in the same spirit as `solo/tools/`) brute-forces each level to prove one solution and that every clue is needed. This is the fair-play test for this format.
- Progress goes in localStorage, as in solo. Cloudflare counts visits only.

## Verification (when built)
- Run the checker on both levels: 1 solution each, every clue needed.
- **ux-reviewer** screenshots on iPhone 14, iPad and a landscape phone (tap targets, reading load).
- **slovenian-editor** pass on all sentences.
- A playtest with 1–2 children: time to solve level 1, where they get stuck, and whether they read the sentences or guess.

## Producer's decisions (2026-11-13)
1. The name was **"Kje je kdo?"**; on 2026-11-13 the producer renamed it **»Skrivnostne sobe«**. The address stays `kje-je-kdo/`.
2. Characters are **new neutral names** (Ana, Bor, Cvetka, Dan, Eva), not the season characters.
3. If the test goes well, the studio's **puzzle-designer** owns a series of about 10 levels, growing from 4×4 to 6×6.
4. **Built and live on 2026-11-13** as `kje-je-kdo/index.html`, with a tile on the start page. The checker is `node solo/tools/kjekdo.mjs`, and the browser test is `node solo/tools/tests/run.mjs kjekdo`.

## What changed while building
- In level 2 the culprit is **Eva**, not Dan, so the two puzzles have different answers. Dan sits on the bench, and Eva's sentence is »Eva ni stala ob skrinji.«
- A wrong cell is refused gently: blocked cell → »Tu je … Tu ne more stati nihče.«; taken row or column → the rule; does not fit → »Preberi še enkrat: »…««; fits but isn't sure yet → »Morda, a to še ni gotovo.«
- The help button works in 3 steps: the sentence glows, the cells that fit light up, then the person is placed.
- **Still open:**
  - A Slovenian editor and native speaker pass on all text.
  - The 🧰 for the chest and the 🍳 for the stove are placeholders until we draw icons.
  - A playtest with children.

## 12 puzzles (2026-11-13)
The producer asked for more: easy, medium and a bit harder, all for 7–8-year-olds, each with a story "for the heart". They also asked for sports.
- **The child places everyone.** The game never places a person. 💡 Pomoč works in 3 steps: the sentence glows, the cells that fit light up, then the one right cell lights up. The child still taps it. The row and column crosses that appear after a placement stay as a visual aid.
- **3 groups of 4.** Each puzzle opens when the one before it is solved (`?uganka=N` opens any puzzle directly, for adults and tests).

| # | Group | Board | Puzzle | Culprit and the reason why |
|---|---|---|---|---|
| 1 | 🟢 | 4×4 | 🎂 Kdo je načel torto? | Dan took a piece to a lonely neighbour on her birthday |
| 2 | 🟢 | 4×4 | 👓 Kje so babičina očala? | Jaka wanted grandma to stay one more day |
| 3 | 🟢 | 4×4 | 💗 Kdo je narisal srček? | Lan, for a sad classmate |
| 4 | 🟢 | 4×4 | ⚽ Kdo je zabil gol? | Nik's first goal; the team passed to him |
| 5 | 🟡 | 5×5 | 👑 Kje je zlata kronica? | Eva lent it to her little sister after a bad dream |
| 6 | 🟡 | 5×5 | ✉️ Kdo je napisal pismo? | Shy Ula, to the new girl |
| 7 | 🟡 | 5×5 | 🏀 Kdo je dal zadnji koš? | Ajda, who always missed, closed her eyes and scored |
| 8 | 🟡 | 5×5 | 🪗 Kje je dedkova harmonika? | Tina practised in secret for grandpa's birthday |
| 9 | 🟠 | 5×5 | 🔑 Kdo je vzel ključ od knjižnice? | Vid, a thank-you party for the librarian |
| 10 | 🟠 | 5×5 | 🧸 Kje je Zalin medvedek? | Matic washed the muddy teddy |
| 11 | 🟠 | 5×5 | ⛄ Kdo je naredil snežaka? | Grandma, for a sick child at the window |
| 12 | 🟠 | 6×6 | 🌼 Kdo je obesil venček? | Lara, for the goalkeeper's birthday |

**What makes a puzzle easy or hard.** `node solo/tools/kjekdo.mjs` proves every puzzle and prints the child's path through it:
- **🟢 Lahko:** only "on X" and "in a room" sentences, plus one person with no place. Every step is "this person has one free cell left".
- **🟡 Srednje:** adds *ob* and *ni*. At most 1 step of "only this person can still go in this row or column".
- **🟠 Malo težje:** two or more *ni* sentences and 2–4 such row/column steps. The finale is 6×6.

The checker also refuses a puzzle in which the culprit's own sentence points at the missing thing.

**How a new puzzle is made:**
1. Draw a map: rooms plus objects, and the missing thing's place in one room.
2. The design tool `solo/tools/kjekdo-design.mjs` searches for a placement and one sentence per person that pass every check (see »Design tool« below).
3. A writer (us or the puzzle-designer) writes the story and the reason why.
4. The **slovenian-editor** and the **book-editor** read the texts.
5. `kjekdo.mjs` and the browser test `node solo/tools/tests/run.mjs kjekdo` (all 12 puzzles on a phone, 1–2 on iPad and landscape) must pass before a push.

**Sports.** A pitch or a court is already a grid with zones (pred golom, sredina, rob igrišča, tribuna, pod košem; never a room name with »ob«, which is a clue word), and its objects work as blockers or seats (gol, koš, stožec, žoga, klop). Puzzles 4, 7 and 12 use this. A running joke: someone always sits on the ball.

**Reviews (2026-11-13).**
- The **book-editor** scored heart 4–5, fun 2–4, pull 3–5. Fun is the weakest; puzzle 7 got a funnier reason.
- The **slovenian-editor** made about 30 fixes: sentences of ≤ 8 words, names instead of pronouns, »Tu so očala«, »dati koš«, »ključ ni na mestu«, and a list intro that speaks to girls and boys alike.
- **Still open for a native speaker:** »z menoj / z mano«, »ubranil vse strele«, »Kronica je spala v skrinji«, and the agreement in »Kjer so 👓 očala, 🪴 rastlina …«.
- **Flagged and kept (the producer may change them):** names that are also words (Dan, Maj, Bor, Pika, Vid), and »čitalnica«, »jasa«, »stožec«, »sramežljiva«.

## Producer's feedback, 2026-11-13 (second round)
- **One detective everywhere.** The puzzles read the main game's ID card (`dp_profile_v1`). A child without one makes it first (detective → helper → name, optional → »To si ti!«), saved the same way, so solo/ knows them too. The helper on the card sits beside the board, and the win says »Bravo, detektivka Ana!«. Solved puzzles live in `dp_kjekdo_v1` (was `kjekdo_solved`, copied over once), which solo/ keeps per detective (KID_KEYS) and exports.
- **The chest (skrinja)** was the 🧰 toolbox emoji and didn't read as a chest. It is now a drawing of a wooden chest with a gold lock.
- **The help says why.** When the next step comes from a row or column (»only Maj can stand in column 5«), the help no longer jumps to the sentence: (1) it lights the row or column and says someone must stand there, (2) only this person fits, with their sentence, (3) the cell. Before, puzzle 6 looked like a guess: Maj's sentence alone leaves 3 cells.
- **Pencil notes (✏️ Zapiski)**, the producer's wish, like pencil marks in sudoku. With the pencil on, the child taps a sentence and then the cells where that person *might* be; each tap puts the person's small face in the cell (several per cell), a second tap rubs it out. Notes never place anyone and never go on a blocking object or in a used row or column. Placing a person rubs out their notes and the notes in their row and column; undo brings them back. The tools are now 4 (Zapiski, Prečrtaj, Nazaj, Pomoč), icon above the word.
- **The help never shows a cell before its reason** (puzzle 12, after Domen: the top row has room only for Mojca, but on two cells). The help reasons like the checker's child, from the people placed so far. A row or column that leaves a person *several* cells is told as »only Mojca fits this row, so she is on one of these cells; note it with ✏️ and press Pomoč again«, and the next press goes on from there (Ivo: the 5th row, then the 4th column, then his cell). Lit lines skip cells in used rows and columns. The browser test solves all 12 puzzles with the help alone.
- **The help writes the possibilities as pencil notes** (producer, after puzzle 12: »show where the options are and add note by note«). When a row or column has room for only one person but they still have several cells in it, the help says who can't stand there (»Lara, Jure, Ivo in Pika tukaj ne morejo stati. Samo Mojca lahko …«), writes that person's notes on those cells (one undo takes them back) and says we don't know which cell yet. Placing others rubs notes out; when a person has one note left, the help says »Mojca ima samo še en zapisek«. The help still never places a person.
- **Puzzle 12 is the hardest** (4 row/column steps, the most allowed). No change of one sentence keeps every sentence needed and brings it under 3 steps (searched); if the playtest says it's too hard, redraw it rather than patch a clue.
- **Onboarding like the reference app** (producer liked its tone): »Kako se igra?« in 6 cards (welcome by name with a teaser, how to solve, one per row/column, »ob«, where nobody can stand, how to place with ✏️ and 💡), shown once before the first puzzle, any time from »?«. After that a puzzle opens with its story alone (a teaser), the one »ne more stati nihče« line, »Začniva!« and »Kako se igra?«. Seen-flag `dp_kjekdo_intro_v1`, kept per detective by solo/. Our »ob« also counts across a wall (the reference app's needs the same room); the puzzles are checked with ours.
- **Puzzle 12 stays as it is** (producer, 2026-11-13): the hardest, last puzzle.
- **On the start page in the hero** (producer: new, not to be missed, more important than »Namesti aplikacijo«): a card with a red »Novo!« badge, a small solved 3×3 board, »Nova igra · Skrivnostne sobe«, »12 ugank · od lahkih do malo težjih« and »Poskusi →«, right under »Igraj zdaj«, above the install banner. In the top bar (wide screens) a »Skrivnostne sobe NOVO« link; below 1100 px the bar shows only it and »Kako deluje«. The old tile under the hero is gone.
- **Analytics**: Cloudflare Web Analytics already counts each page by its path: `/` = start page, `/solo/` = the main game, `/kje-je-kdo/` = this game, `/home/` = launches from the Home Screen icon. In the dashboard, filter or group by Path. Single puzzles inside the page are not counted separately.

## Anonymous events (2026-11-14)

The producer wants to see where players get stuck. The game sends anonymous events: intro, start, wrong, hint, stuck (90 s without placing anyone, the producer's choice), solved and left. There is no name, no card and no device ID, only a random number per sitting held in memory. The privacy page was updated first. Events, privacy rules and ready-made SQL are in [EVENTS.md](EVENTS.md). Page views stay in Web Analytics, filtered by path.

## Rooms 13–22 (2026-11-15)

One new room a day (producer moved the start to 2026-11-15; on 2026-11-16 the producer asked for three more at once from the next day: 15, 16 and 17 all open on 11-17, then one a day again, 18 on 11-18 … 22 on 11-22. Several rooms may share a date: the big card shows the first unsolved one, the teaser says »Jutri: 3 nove sobe«; the weekday/weekend difficulty pattern does not hold for this first batch) (`date` on the level; weekdays easy/medium, the weekend harder). `node solo/tools/kjekdo.mjs` passes for all 22 puzzles (one placement, every sentence needed, a child's path without guessing, ≤ 8 words in the new texts); the browser test `node solo/tools/tests/run.mjs kjekdo` solves all 22 with the help alone (266 ok). The checker now wants ≥ 4 puzzles per group, dates that rise with the ids, and sentences of ≤ 8 words in dated puzzles. Ten new missing things were added to `OBJ` (kruh, zvonec, medalja, sonce, smuci, klobuk, sestavljanka, balon, kolo, trobenta).

| # | Date | Group | Title | Setting | Size · people | New element | Culprit and the reason why |
|---|---|---|---|---|---|---|---|
| 13 | Sun 11-15 | 🟢 | 🥖 Kdo je vzel zadnji kruh? | shop, storeroom, street | 5×5 · 5 | shop; new person Erik (»sedel na preprogi«); culprit's sentence is »štel drobiž« (no place) | Nejc took the bread to a neighbour with an empty cupboard; they had supper together |
| 14 | Mon 11-16 | 🟡 | 🚂 Kje je zvonec na peronu? | train station: carriage, platform, waiting room, car park | 5×5 · 5 | train; 1 row/column step | Vita hid the bell so the train would wait for late grandpa Franc |
| 15 | Tue 11-17 | 🟢 | 🏅 Kdo je obesil medaljo? | swimming pool, changing room, stand | 5×5 · 5 | sport: swimming (slide, mat); new person Polona (»sedela na stolu«) | Neža gave her medal to Toni, who came in last: »Za pogum!« |
| 16 | Tue 11-17 | 🟡 | 🌻 Kdo je prinesel sončnico? | greenhouse, garden, woodshed, yard | 5×5 · 5 | garden in winter | Ines grew a sunflower in a pot for sad grandpa Jože |
| 17 | Tue 11-17 | 🟠 | 🎿 Kje so Katjine smuči? | ski hut, slope, car park, lift | 5×5 · 5 | skiing; 2 ni sentences, 2 row/column steps | Drago waxed Katja's skis; she glided like a bird |
| 18 | Wed 11-18 | 🟠 | 🎩 Kje je čarovnikov klobuk? | circus: arena, backstage, caravan, yard, ticket booth | 6×6 · 6 | circus; 6×6, 2 ni sentences, 2 row/column steps | Zarja sewed up the magician's hat (a hole); a rabbit came out of it |
| 19 | Thu 11-19 | 🟢 | 🧩 Kdo je sestavil sestavljanko? | home: child's room, hall, living room | 5×5 · 5 | jigsaw puzzle; new person Mitja (»sedel na preprogi«) | Hugo built the puzzle at night for his sister Tara, leaving her the last piece |
| 20 | Fri 11-20 | 🟡 | 🎈 Kdo je privezal balon? | park: park, hill, pond, playground | 5×5 · 5 | park, log, pond | Tia tied a balloon for lonely Mr Stane's birthday |
| 21 | Sat 11-21 | 🟢 | 🚲 Kdo je popravil kolo? | garage, house, yard | 5×5 · 5 | workshop (bike, flat tyre); new person Staš (»sedel na preprogi«) | Lucija fixed Rene's bike overnight for his birthday, with a bow |
| 22 | Sun 11-22 | 🟡 | 🎺 Kje je Alenova trobenta? | music school: stage, classroom, hall, concert room | 5×5 · 5 | music | Neja cleaned Alen's squeaky trumpet with a toothbrush before the concert |

From 2026-11-15 every new room is at least 5×5; 4×4 only for rooms 1–4 (producer). Rooms 13, 15, 19 and 21 were redrawn 5×5 with one extra person each (the easiest 5×5: only »on object« sentences plus one free person, 0 row/column steps).

**Review edits (2026-11-15):** names shared with the main game or repeated were changed (Tim→Nejc, Luka→Svit, Tara in 17→Maša, Ela→Teja, Pia→Neja); rooms a child may not know were renamed (Drvarnica→Lopa, Zaodrje→Garderoba, the circus Vagon→Prikolica); 14 shows Vita giving the bell back; 16, 19 and 20 were lightened (no sad grandpa, no sick child, Stane is not left forgotten); »pri ribniku«, not »na ribniku«.

## Playtest, 2026-11-15 (one 7-year-old, producer's notes)

| Puzzle | Group | Row/col steps | »ni« / »ni ob« clues | How it felt |
|---|---|---|---|---|
| 13 Kdo je vzel zadnji kruh? | lahko 5×5 | 0 | 0 / 0 | easy: solved without trouble, little thinking |
| 7 Kdo je dal zadnji koš? | srednje | 1 | 1 / 0 | easy, like 13 |
| 8 Kje je dedkova harmonika? | srednje | 1 | 1 / 1 | **harder**: had to think, needed a little help |
| 9 Kdo je vzel ključ od knjižnice? | težje | 2 | 1 / 1 | hard, but easier than 8 |
| 10 Kje je Zalin medvedek? | težje | 3 | 1 / 1 | quite hard, like 9 |
| 11 Kdo je naredil snežaka? | težje | 2 | 2 / 0 (+ »ni na klopi«, two »v/na« room clues) | **hard: had to think and eliminate — »Odlična!«** (the producer's favourite so far) |

What it tells us (one child, so a direction, not a rule yet):
- Row/column steps alone don't predict difficulty: 7 and 8 both have 1 step, but 8 felt harder than 9 and 10.
- The child felt the work in puzzles with a **»ni ob«** clue (8, 9, 10) and in 11, which has two negative clues (»ni v«, »ni na«) and two room-only clues: the child had to eliminate. Puzzles with only »na« / »v« / one »ni v« (13, 7) were easy. 11 is the model of a great room.
- **Producer's correction (2026-11-15):** a negative sentence itself is not what is hard. The hard part is the **mechanic of working out where someone is**: eliminating cells, and seeing that a person is the only one who can still be in a row or column. So rate a room by how many people can't be placed straight from their own sentence (their sentence leaves several cells, and only elimination or the row/column rule decides), not by the kind of sentence. »ni …« and room-only sentences are just one way to make a sentence leave several cells.
- **Measured:** `node tools/kjekdo.mjs` now ends with a table. Its »odprta polja« (open cells) column sums the cells the sentences leave open at the start, over the people with a sentence who can't be placed straight from it. It ranks the playtested rooms the way the child felt them: 13 (9) < 7 (25) < 9 (32) < 10 (36) < 11 (40) < 8 (41). Row/column steps did not (7 and 8 both have 1). Not enforced yet; after more playtests set the bands per group. Today: 🟢 0–9, 🟡 22–41, 🟠 32–62 (18 at 62 may be too hard).
- For a 7-year-old who has played a few rooms, 🟢 lahko (all »na X«, 0 steps) is too easy.

Producer's direction: use this when creating the next rooms — fewer all-»na« rooms, daily rooms mostly need real thinking (a »ni ob« / »ni v« clue that matters), keep 💡 help for the hard ones. Text fix: puzzle 7 »Toda kdo jo je vrgel?« → »Toda kdo je zadel koš?«.

## Playtest, 2026-11-16: room 14, and two new switches

**Room 14 »Kje je zvonec na peronu?«** (srednje, 5×5, »odprta polja« 30): *relatively hard, very good* (producer). The child's key step: after Alja (on the cushion), **two people can each only be in one column**: Nika (»ob zvoncu«) only in column 4, Jernej (»ob zaboju«) only in column 1. Those two columns are taken, so Mark (»ob klopi«) is left with column 3, and the rest follows. The checker finds another way (column 5 → Vita), so it doesn't count this step, but it is the kind of thinking the producer wants: **a person whose cells all lie in one row or column takes it away from the others**. Build daily srednje/težje rooms around one such step. The measure agrees: 30 sits between 7 (25, easy) and 9 (32, hard).

**Mistake counter** (producer's idea): the question bar shows »Napake: N« for this room. Every wrong tap counts (a cell the sentence rules out, a »maybe« cell, a taken row or column, a tree, the wrong culprit), the same number the events send as `wrongs`. It bumps red for a moment, never blocks anything, starts at 0 in each room, and the win sheet says »Napake: N« or »Brez napake! 🌟«. Why: the data showed children trying »maybe« cells one after another (room 12: 7 of 8 mistakes); a visible count asks them to think before tapping. It is not stored and not shown on the list.

**VELIKE TISKANE ČRKE**: the »ABC« button in the header (next to »?«) turns every text into capitals, because first-graders learn capitals first; »abc« turns it back. It is remembered on the device (`dp_caps_v1`, listed on the privacy page); the main game can use the same key if it gets the switch too. In capitals the room names on the board are smaller (sized to the cell) so they fit; on a landscape phone the 6×6 room 18's »Garderoba« still touches its edge.

Also fixed: a `start` event sent `placed` from the previous room (4 or 5 instead of 0).

## Playtest, 2026-11-17: rooms 15 and 16 (one 7-year-old, producer's notes)

| Room | Group · »odprta polja« | How it felt |
|---|---|---|
| 15 Kdo je obesil medaljo? | lahko · 0 | **very easy**: every sentence places its person straight away |
| 16 Kdo je prinesel sončnico? | srednje · 28 | relatively easy: some thinking, no mistakes |

- Confirms 2026-11-15: an all-»na X« room (0 open cells) is too easy for a child who has played a few rooms. New lahko rooms should still leave a little to work out (about 9, like 13), and srednje rooms nearer 30 than 22–28.
- **Story logic counts.** The child asked of 15: *why is there a medal for him if he came last?* The story now ends »Kako to?«, so the oddity is the mystery, and the »Zakaj?« says Toni was afraid of deep water but swam to the finish, so Neža gave him her own medal »Za pogum!«. Lesson for writers: if a story sets up something surprising, the reason must be in the heart, said plainly.

## Rooms 23–28: two rooms a day from 2026-11-20 (2026-11-19)

The producer made it two new rooms a day. Rooms 21 and 22 open 2026-11-20 (the stock ran out there), 23 and 24 on 11-21, 25 and 26 on 11-22, 27 and 28 on 11-23. Each day has one 🟡 srednje and one 🟠 težje. `node solo/tools/kjekdo.mjs` passes for all 28 rooms. Six new missing things were added to `OBJ` (drsalke, zvezda, rokavice, lopar, barvice, vedro) and eight room colours (Drsališče, Bife, Pekarna, Trg, Parkirišče, Telovadnica, Plaža, Kiosk).

| # | Date | Group | Title | Rooms | odprta polja | Row/col steps |
|---|---|---|---|---|---|---|
| 23 | 11-21 | 🟠 | ⛸️ Kje so Ankine drsalke? | changing room, corridor, snack bar, ice rink | 37 | 2 |
| 24 | 11-21 | 🟡 | 🌟 Kdo je popravil zvezdo? | bakery, library, town square, car park | 29 | 1 |
| 25 | 11-22 | 🟡 | 🧤 Kje so vratarjeve rokavice? | changing room, in front of the goal, midfield, stand | 26 | 1 |
| 26 | 11-22 | 🟠 | 🏓 Kje je Vanjin lopar? | corridor, changing room, gym, playground | 41 | 2 |
| 27 | 11-23 | 🟡 | 🖍️ Kje so Liine barvice? | classroom, corridor, library, playground | 29 | 1 |
| 28 | 11-23 | 🟠 | 🪣 Kje je rdeče vedro? | beach, changing room, kiosk, playground | 41 | 3 |

Every sentence is a draft for the Slovenian editor. The srednje rooms hold 4–5 people who can't be placed straight from their own sentence (»ob«, »ni v«, a room), and one row/column claim; the težje rooms 2–3 claims.

### Design tool: `solo/tools/kjekdo-design.mjs`
Draw a map in a small spec file (`export default { rooms, names, objects, room, people, culprit, where, forms, ... }`, the fields are listed at the top of the script) and run
`node solo/tools/kjekdo-design.mjs spec.mjs --n 3 --band 24,34 --claims 1,1`
(`--seed`, `--ms` for the search time). It hill-climbs on one sentence per person until the checker's rules hold: exactly one placement, every sentence needed, a child's path without guessing, the number of row/column claim steps within `--claims` (srednje 1,1; težje 2,3 for 5×5; 2,4 for 6×6) and »odprta polja« within `--band` (srednje about 24–34, težje about 35–44; 5×5 srednje above ~29 is rare on small rooms), the culprit alone in the room of the missing thing and not pointing at it, and a free cell for every room label. It writes the Slovenian sentences from the rule (needs `forms`: the dative/locative of each object) and prints the finished LEVELS entry to paste above `// LEVELS-END`, with the story texts from the spec. The same map often works for both groups, only the band and claims change; the sentences then need the Slovenian editor. Run `node solo/tools/kjekdo.mjs` afterwards.
