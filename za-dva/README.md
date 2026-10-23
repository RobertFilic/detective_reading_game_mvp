# Detektivska pisarna za dva – co-op MVP validation prototype

A Slovenian co-op detective reading game for two children aged 6–9 who share one iPad. Each child has a different clue card, and no card solves the case on its own. The children read their cards to each other, agree on a suspect, and each taps the sentence on their own card that proves it. There are no timers, scores or penalties. See [docs/PLAN.md](docs/PLAN.md) for the plan, playtest questions and thresholds.

It lives next to the solo game (`../solo/`) and shares its structure and tools. The two games are independent: separate files, logs and offline caches. The start page (`../index.html`) lets you pick one.

## Files
| Path | What it is |
|---|---|
| `index.html` | The whole app: cases, split screen, logging, adult debrief. No dependencies. |
| `audio/` | One recording per line, named `<clipId>.m4a` (empty until recorded). |
| `tools/cases.mjs` | Checks the cases against the template rules, including that no card is enough on its own. `clips` lists every line to record. |
| `tools/build.mjs` | Inlines `audio/` into `dist/index.html` and copies `sw.js`. |
| `sw.js` | Offline cache for the hosted version. |

## Run locally
Open `za-dva/index.html` in a browser. Run the `node tools/…` commands below from this `za-dva/` folder. The adult setup screen comes first. To try both seats on a desktop, click in the top (upside-down) half and the bottom half in turn.

## How it plays
- The iPad lies flat in **portrait**, with the children sitting opposite each other. The top half is rotated 180° for the child on the far side.
- Every step (start, open card, "Vem, kdo je bil!", next) waits until **both** children have pressed. Pressing again takes it back.
- **Accuse:** each child picks a suspect on their own half and can see the other child's pick. If the picks differ, both get "Še nista enotna. Pogovorita se!".
- **Evidence:** each child confirms one sentence on their own card. The case is solved when both are right and the agreed suspect is the culprit.
- **Hints** appear on both halves: read your card aloud → a case-specific tip with a highlighted block → two candidates per card → assisted (the evidence pulses) after the 4th wrong confirm.
- **Audio** is off by default, because one speaker would play each child's card to both. It can be turned on in setup.

## Edit cases
Cases live in `index.html` between `// CASES-BEGIN` and `// CASES-END`. Each case has a `top` card and a `bottom` card. `alone` lists the suspects that each card still allows on its own. After editing, run:

```
node tools/cases.mjs
```

## Record audio and put it on the iPad
These steps are the same as in the solo game:
1. `node tools/cases.mjs clips > docs/clips.tsv` lists the lines to record.
2. Recordings go in `audio/<clipId>.m4a`.
3. `node tools/build.mjs` writes `dist/`.
4. Host `dist/` on HTTPS, add it to the Home Screen, and test in airplane mode.

## Running a session
1. Setup: set the age of each seat. The level is chosen automatically from the younger child and can be overridden. Tick "Pilotna seja" for the pilot pair, and decide about audio. Then press "Začni sejo".
2. Adult access: hold the top-left corner of the screen for 3 seconds, then answer the sum.
3. "Pregled" shows the per-pair table (tap a row for the event timeline, with [Z] = top seat and [S] = bottom seat), a summary by pair type (6–7, 8–9, mixed) and by co-op rung (join → infer → eliminate), plus **Izvozi JSON**.
4. Q1 (do they share their cards?) can't be logged. Use the observer sheet: does each child read their card aloud, ask the other child, point at the other half, peek, or take over? Also note each child's mood.
