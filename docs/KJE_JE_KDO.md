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
2. A design script searches for a placement and one sentence per person that pass every check. It lives in the session scratchpad; it should become `solo/tools/kjekdo-design.mjs` if we make more.
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
