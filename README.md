# Detektivska pisarna – MVP validation prototype

A Slovenian detective reading game for children aged 6–9. The child accuses a suspect by tapping the sentence that proves it. The prototype exists to answer four playtest questions; see [docs/PLAN.md](docs/PLAN.md) for the full plan, playtest protocol and thresholds.

## Files
| Path | What it is |
|---|---|
| `index.html` | The whole app: cases, screens, logging, adult debrief. No dependencies. |
| `audio/` | One recording per line, named `<clipId>.m4a` (empty until recorded). |
| `tools/cases.mjs` | Checks the cases against the template rules; `clips` lists every line to record. |
| `tools/build.mjs` | Inlines `audio/` into `dist/index.html` and copies `sw.js`. |
| `sw.js` | Offline cache for the hosted version. |

## Run locally
Open `index.html` in a browser. The adult setup screen comes first. Without recordings, the app tries `audio/<clipId>.m4a` and then a Slovenian system voice (Edge on Windows has one; iPad Safari does not).

## Edit cases
Cases live in `index.html` between `// CASES-BEGIN` and `// CASES-END`. After editing, run:

```
node tools/cases.mjs
```

It checks word limits per level, sentence and suspect counts, exactly one evidence sentence (not first or last), distractor counts and hint references.

## Record audio
1. `node tools/cases.mjs clips > docs/clips.tsv` gives 100 lines as `clipId<TAB>text`.
2. A native speaker records each line, saved as `audio/<clipId>.m4a` (mono, ~32 kbps is plenty). `.mp3` also works.
3. `node tools/build.mjs` writes `dist/index.html` and reports any missing clips.

## Put it on the iPad
1. Host the contents of `dist/` on any static HTTPS host (e.g. GitHub Pages).
2. On the iPad, open the URL in Safari → Share → Add to Home Screen. Open it once from the Home Screen while online.
3. Test in airplane mode: open from the Home Screen, play the sound check.

## Running a session
1. Setup screen: choose the age group (sets level A or B), tick "Pilotna seja" for the pilot child, play the sound check, press "Začni sejo".
2. Hand the iPad to the child.
3. Adult access during or after play: hold the top-left corner for 3 seconds, then answer the sum.
4. In "Pregled": per-child table (tap a row for the event timeline), age-group summary against the plan thresholds, **Izvozi JSON** after every session, "Nova seja" for the next child.

Logs stay in this browser's storage on the device; nothing is sent anywhere.
