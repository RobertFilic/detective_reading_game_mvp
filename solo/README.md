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

It checks word limits per level, sentence and suspect counts, exactly one evidence sentence (not first or last), distractor counts and hint references. It also checks that each case can be solved: every suspect appears in the story, the evidence sentence names the culprit and no other suspect (at level B, a pronoun that refers to the culprit in the sentence before), and in contradiction cases the culprit says the partial sentence.

Cases are grouped in **case files** (`FILES`): 🚀 Vesoljska postaja, 🐄 Pri babici na kmetiji (5 cases each, level A only, the 5th is a final case that opens when the others are solved) and 🌲 Gozdna mapa (the 14 original animal cases at levels A and B; cases 1–3 are the original ladder). Each case has `file` and `no` (1, 2, … within its file). Ideas for the next files are in [docs/CASE_FILES.md](../docs/CASE_FILES.md).

**First launch (board mode):** the child makes a detective ID card (avatar = detektiv / detektivka, sidekick, optional name; stored on the device only, the name is never logged), plays the 🎓 practice case, then picks a file. Adult "Nov otrok" in setup clears the card, the ticks and the practice.

## Record audio
1. `node tools/cases.mjs clips > docs/clips.tsv` gives 100 lines as `clipId<TAB>text`.
2. A native speaker records each line, saved as `audio/<clipId>.m4a` (mono, ~32 kbps is plenty). `.mp3` also works.
3. `node tools/build.mjs` writes `dist/index.html` and reports any missing clips.

## Put it on the iPad
1. The repo is published with GitHub Pages; the start page at the root links to this game. For a build with audio inlined, host the contents of `dist/` instead.
2. On the iPad, open the URL in Safari → Share → Add to Home Screen. Open it once from the Home Screen while online.
3. Test in airplane mode: open from the Home Screen, play the sound check.

## Running a session
1. Setup screen: choose the age group (sets level A or B), tick "Pilotna seja" for the pilot child, choose the case order, play the sound check, press "Začni sejo".
   - **🗂️ Otrok izbira na tabli** (default): after "Začni" the child sees a board with all 13 cases (sticker, question and difficulty 🔍 / 🔍🔍 / 🔍🔍🔍) and picks one. Solved cases get a ✔ that stays on this iPad; one unsolved easy case glows as a suggestion. Solved cases can be replayed. "Dovolj za danes" ends the session. "Počisti kljukice" in setup clears the board for a new child (the logs stay).
   - **Po vrsti**: fixed order from a chosen case, with "Še en primer?" after each case. Use this from case 1 for a comparable playtest.
2. Hand the iPad to the child.
3. Adult access during or after play: hold the top-left corner for 3 seconds, then answer the sum.
4. In "Pregled": per-child table (tap a row for the event timeline), age-group summary against the plan thresholds, **Izvozi JSON** after every session, "Nova seja" for the next child.

Logs stay in this browser's storage on the device; nothing is sent anywhere.
