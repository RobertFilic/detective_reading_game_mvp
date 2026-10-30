# Detektivska pisarna – MVP validation prototype

A Slovenian detective reading game for children aged 6–9. The child accuses a suspect by tapping the sentence that proves it. The prototype exists to answer four playtest questions; see [docs/PLAN.md](../docs/PLAN.md) for the full plan, playtest protocol and thresholds.

## Files
| Path | What it is |
|---|---|
| `index.html` | The whole app: cases, screens, logging, adult debrief. No dependencies. |
| `audio/` | One recording per line, named `<clipId>.m4a` (empty until recorded). |
| `tools/cases.mjs` | Checks the cases against the template rules; `clips` lists every line to record. |
| `tools/build.mjs` | Inlines `audio/` into `dist/index.html` and copies `sw.js`. |
| `sw.js` | Offline cache for the hosted version. |

## Run locally
Open `solo/index.html` in a browser (or the start page `index.html` one level up). Run the `node tools/…` commands below from this `solo/` folder. The adult setup screen comes first. Without recordings, the app tries `audio/<clipId>.m4a` and then a Slovenian system voice (Edge on Windows has one; iPad Safari does not).

## Edit cases
Cases live in `index.html` between `// CASES-BEGIN` and `// CASES-END`. After editing, run:

```
node tools/cases.mjs
```

Every case has a `type`, a step on the reasoning ladder, and its difficulty (🔍 count on the board) follows from it:

| 🔍 | `type` | The child… |
|---|---|---|
| 1 | `fact` | finds the sentence that says it |
| 2 | `trace` | links a trace to a person (a blue tongue → blueberries) |
| 3 | `slip` | notices the culprit knows something only the culprit could know |
| 4 | `alibi` | finds the sentence that shows the culprit's claim isn't true |
| 5 | `pair` | picks **two** sentences that only prove it together ("Izberi dva stavka") |

`twist: true` marks a case where an animal of the place did it (a mouse, a goat); at most one per adventure.

The checker tests, per case: word limits, sentence, suspect and decoy counts, the evidence count for the type (2 for a pair), that slip and alibi cases have the culprit's own claim (`partial`), and hint references. Solvability: every suspect appears in the story; the evidence names the culprit and no other suspect; in a pair one proof names the culprit and the other names no suspect. Per adventure, it checks the ladder (starts with a fact case, rungs never go down, ends with a final two-proof case) and **variety**, so a child can't learn a pattern instead of reading: the proof sits early, in the middle and late across the adventure; no two cases have the same shape; the decoy sits straight before the proof in at most one case; the number of decoys changes; the final case is the longest.

**Step cases (`steps`, type `elim`)** are played as an investigation instead of a story list. The plan behind them is in [docs/IMPROVEMENTS.md](../docs/IMPROVEMENTS.md).
1. 📞 **call:** the phone rings and a client (`client`, `call`) asks for help.
2. 🔍 **scene:** every sentence hides behind an object (`obj`, `label`); the child opens them all into the pocket 👝. A `dark: true` object needs the 🔦 torch.
3. ❌ **solve:** the child taps a sentence, then a face. An alibi (`role: 'clear'`, `clears: 'robi'`) crosses that suspect off; the proof plus the culprit solves the case. Hints come after wrong pairs: »ne dokaže« → `h1` → the next sentence lights up → the sentence and the face pulse.

On the solved screen: a newspaper (`paper` of the file) with »… je ujela Tima!« (`caught`), the culprit's excuse (`excuse`), and a rank-up. Ranks are 🔰 Vajenec (0 solved) → 🕵️ Detektiv (3) → ⭐ Višji detektiv (6) → 🎖️ Inšpektor (10) → 👑 Glavni inšpektor (15); they show on the ID card and are never lost. The client's thank-you `letter` arrives on the next visit (a later session). The checker tests step cases too: every innocent suspect has exactly one alibi that names them, the culprit has none, there is at most one dark object, and the corkboard card names no suspect.

A **season** (`season: true` in `FILES`) is one adventure with one big mystery (`mystery`). Every case pins a `card` to the 📌 corkboard on the board, and `soon` shows the cases still to come. The first one is 👾 Skrivnost v zračniku, which has case 1 so far.

Cases are grouped in **adventures** (`FILES`, *pustolovščine*): 🚀 Vesoljska postaja and 🐄 Pri babici na kmetiji, 6 cases each at level A, one per ladder step plus a twist; the 6th is a final case that opens when the others are solved. The original 14 forest cases were removed (they are in the git history). Ideas for the next adventures are in [docs/CASE_FILES.md](../docs/CASE_FILES.md).

**First launch (board mode):** the child makes a detective ID card (avatar = detektiv / detektivka, sidekick, optional name; stored on the device only, the name is never logged), plays the 🎓 practice case, then picks a file. Adult "Nov otrok" in setup clears the card, the ticks and the practice.

## Record audio
1. `node tools/cases.mjs clips > docs/clips.tsv` gives every line as `clipId<TAB>text`.
2. A native speaker records each line, saved as `audio/<clipId>.m4a` (mono, ~32 kbps is plenty). `.mp3` also works.
3. `node tools/build.mjs` writes `dist/index.html` and reports any missing clips.

## Put it on the iPad
1. The repo is published with GitHub Pages; the start page at the root links to this game. For a build with audio inlined, host the contents of `dist/` instead.
2. On the iPad, open the URL in Safari → Share → Add to Home Screen. Open it once from the Home Screen while online.
3. Test in airplane mode: open from the Home Screen, play the sound check.

## Running a session
1. Setup screen: choose the age group (sets level A or B), tick "Pilotna seja" for the pilot child, choose the case order, play the sound check, press "Začni sejo".
   - **🗂️ Otrok izbira na tabli** (default): after "Začni" the child picks an adventure and sees its board (sticker, question and difficulty 🔍 … 🔍🔍🔍🔍🔍), then picks a case. Solved cases get a ✔ that stays on this iPad; one unsolved easy case glows as a suggestion. Solved cases can be replayed. "Dovolj za danes" ends the session. "Počisti kljukice" in setup clears the board for a new child (the logs stay).
   - **Po vrsti**: every case of every adventure in order, from a chosen case, with "Še en primer?" after each case. Use this from 🚀 1 for a comparable playtest. The themed cases exist at level A only, so level B plays them too.
2. Hand the iPad to the child.
3. Adult access during or after play: hold the top-left corner for 3 seconds, then answer the sum.
4. In "Pregled": per-child table (tap a row for the event timeline), age-group summary against the plan thresholds, **Izvozi JSON** after every session, "Nova seja" for the next child.

Logs stay in this browser's storage on the device; nothing is sent anywhere.
