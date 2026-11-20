# CLAUDE.md: context for the main Claude session

Read this first in every session. It points to the documents that hold the details; don't copy them here. Keep it under ~120 lines.

## What this is
**Detektivska pisarna / Bralni detektivi**: a Slovenian detective reading game for children of 7–8 (the focus; 9–10 later). The child reads short sentences and taps the one that proves who did it. Goal: »the most fun detective game in the world for children learning to read«, Agatha Christie for 7-year-olds. Played at **<https://bralnidetektivi.si>** on a parent's phone or iPad, in the browser or from the Home Screen, offline after the first visit.

The user is **the producer** (a parent, native Slovenian speaker). They approve briefs and pitches, play with their child, and say when to commit and push.

## Layout
| Path | What |
|---|---|
| `index.html` | Start page: both games (Detektivski primeri, Skrivnostne sobe), »Igraj zdaj« → the office, »Za odrasle«. |
| `solo/index.html` | **The whole game** (~525 KB): engine, `ui-*` design system, cases, debrief. No dependencies. Cases, `FILES` (seasons), `COMING` (teasers), `WARMUPS` sit between `// CASES-BEGIN` and `// CASES-END`. `KID_LEVEL = 'A'`. |
| `solo/README.md` | **The reference** for the case format, every step type (call, scene, ask, words, lock, order, cipher, torn, lie, herring, when, solve), help levels, seasons, release dates, the advent band. |
| `kje-je-kdo/` | **Skrivnostne sobe**: a Murdoku-style side puzzle (28 rooms, two a day from 2026-11-20). Plan: `docs/KJE_JE_KDO.md`. |
| `worker/`, `wrangler.jsonc` | Cloudflare Worker: serves the static files; `/api/e` stores anonymous events in D1 (EU). `docs/EVENTS.md`. |
| `shared/detective.js` | What both games and the start page share: the rooms in short (`kjekdo.mjs --sync`), one rank, the band, the device's sitting counters, »Kdo danes igra?«. |
| `docs/TWO_GAMES.md` | Built 2026-11-20 (mock-up: Claude Design canvas »dve igri, en detektiv«): landing page with both games; »Igraj zdaj« → **the office** (detective, rank, one door per game) → **a dashboard per game** with a shared band (small card back to the office + tabs »Primeri | Sobe«); **one rank for every game**, calculation hidden (a case 3 points, a room 1; thresholds 0/9/18/30/45; best rank stored). No release rhythm promised publicly for any game. |
| `zasebnost/` | Privacy policy and terms (`docs/LEGAL.md`). |
| `home/` | Home Screen `start_url` (counts launches), redirects to the start page. |
| `docs/studio/` | **The studio**: how seasons are made (README), STRATEGY, RELEASES, TASKS, CURRICULUM, STORY_BIBLE, LEDGER, PLAYTEST, `seasons/<id>.md`, `lessons/`, `languages/sl.md`. |
| `.claude/agents/` | Agent briefs: editorial-director, showrunner, case-writer, puzzle-designer, fair-play-tester, book-editor, slovenian-editor, ux-reviewer, developer. |
| `docs/marketing/` | **Marketing and validation** (README): VALIDATION (hypotheses H1 duo vs H2 solo, scorecard, December plan), LEAFLET (paper puzzle + QR codes), ANALYTICS (new events spec), RESEARCH (interviews, holiday diary), `lessons/`. Agents: marketing-strategist, family-researcher, conversion-copywriter, growth-lead, trust-reviewer. |
| `docs/design/` | Claude Design exports (»Tiha lupa« is the live look), `PROMPT_v5_missing_components.md`, `slovenian-text.json`. |

## Commands (run from `solo/`)
- `node tools/cases.mjs`: the case checker. Must pass after any case edit.
- `node tools/case.mjs p2` · `--file pokal` · `--cast pokal` · `--format` · `--list`: print just what you need.
- `node tools/kjekdo.mjs`: checks the Skrivnostne sobe rooms. `tools/kjekdo-design.mjs` is the room design tool.
- `node tools/shots.mjs <caseId>`: screenshots on iPhone 14, iPad and a landscape phone (once: `cd tools && npm install`; needs Chrome).
- `node tools/read.mjs <file>`: every text of a season on one page, for the producer to read.
- `node tools/tests/run.mjs [names…]`: browser tests (all ≈ 8 min, 4 at a time). Run the touched ones after a change and **all before a push**. `--shots` keeps the screenshots. `qr` and `rate` sometimes crash in the full run: rerun them alone. Many `goto` crashes means the server or Chrome is overloaded: rerun once.
- `?ui` on `solo/index.html` opens the component gallery.

## Working rules
- **Token budget:** never read `solo/index.html` whole. Use `tools/case.mjs` and `grep -n`. Read only the sections of a season file the task needs.
- **The pipeline** (docs/studio/README.md): brief → pitch → **producer approves** → puzzles → writing → review (fair-play, Slovenian, book editor in parallel; at most 2 rounds) → screens → play → retro. One season over four sittings (A–D), each in a fresh session.
- **The main session** is the hub: it starts the agents, passes their findings on, makes small and cross-cutting code changes itself, and reviews the developer's work. Only the developer and the main session touch code outside the case data. Agents never commit.
- **Model choice:** the cheapest model that does the job very well. Opus for the showrunner, fair-play tester, Slovenian editor, case writers and book editor; Sonnet for the rest.
- **On a ping** (»what's due?«, »check the releases«): read `docs/studio/RELEASES.md` and `docs/studio/TASKS.md`, compare them with today's date, do the earliest open step, and write the result back (✅ and dates).
- **Clash order:** child safety > fair play > reading level > correct language > voice and fun > season plan. Findings are 🔴 / 🟠 / ⚪, never scores. Unfixed 🟠 go in the season file's »Decisions«.
- **A new UI part** goes into the `ui-*` components block, `UI.*` and the `?ui` gallery first (solo/README.md, »Design system«).
- **A new mechanic** ships with checker rules, a README section and a browser test in `tools/tests/`.
- Read `docs/studio/lessons/developer.md` before code work, and add to it after.

## Content rules (never break)
- **Fair play:** exactly one answer, reachable by reading what's on screen. The decoy is never a second answer.
- **Warm, never scary:** nobody gets hurt. Culprits are funny or kind. People, not animals, are the culprits (one `twist` per adventure at most). Miklavž, Božiček and Dedek Mraz are **never unmasked**.
- **Level A:** ≤ 8 words a line, names rather than pronouns, rare negation (`languages/sl.md`). Frozen at level A through December.
- **Never stuck, never shamed:** every step has a hint ladder that ends in the answer.
- **No read-aloud** since 2026-11: the children's screens say nothing (little sounds only).
- **Privacy:** names and progress stay on the device; names are never logged; events are anonymous.
- Every season has a 🔐 number lock (the children's favourite).
- Slovenian is a draft until the producer has read it.

## Releases and deploy
- One season a week, opening on Thursdays. Push it **before** its day with `opens: 'YYYY-MM-DD'` and `teaser` in `FILES`; it opens by itself on the device's date.
- **The site is <https://bralnidetektivi.si>**, served by the Cloudflare Worker. Use this address in anything new (links, the release check, share text, the policy). **Push to `main` deploys** it (Cloudflare Workers Builds runs `npx wrangler deploy`).
- The old address `robertfilic.github.io/detective_reading_game_mvp/` (GitHub Pages) is still live and the root `README.md` still sends people there. `docs/LEGAL.md` §6.4 asks to redirect it to bralnidetektivi.si or switch Pages off: the producer decides. Devices that saved progress on the old address move it over with the debrief's JSON export/import or 📱 QR prenos.
- A planned contact address is `info@bralnidetektivi.si` (Cloudflare Email Routing; LEGAL.md §6.2).
- The commit style follows `git log`: season emoji + title + what changed, e.g. »🧸 Igrače, ki hodijo same: reviewed, fixed, opens 2026-11-26«.

## Writing style for docs
Plain, short English sentences; Slovenian game text in »guillemets«. No filler. Dates as YYYY-MM-DD. Each doc keeps its stated length limit.

## State on 2026-11-20 (check RELEASES.md and TASKS.md for what's current)
- **Live:** 👾 zračnik (`bip`), 🦔 Galeb, 🦕 muzej, ⚽ pokal, ❄️ sneg (opened 11-19).
- **Pushed:** 🧸 Igrače, ki hodijo same (`igrace`, first window of 🎄 Praznični primeri), opens 11-26.
- **Done 11-20:** ⚽ `p2` wording fixes (TASKS.md); two games + one rank (TWO_GAMES.md); the validation analytics (docs/marketing/ANALYTICS.md status line), privacy page updated.
- **Next:** 🎅 Miklavž pitch 11-24, opens 12-03; then circus, Christmas show, Sveti večer, Silvestrovo (STRATEGY.md). The developer builds the diploma for 12-31.
- **Evidence gap:** no playtest notes since 2026-11-02.
- **Marketing (from 2026-11-19, draft until the producer approves):** validation, not growth. Parents are the audience (schools ban devices); the open question is duo (H1) vs supervised solo (H2). Leaflet out 11-30, analytics live by 11-28, readout 01-11. See `docs/marketing/VALIDATION.md`.
- **Design:** the producer's newer Claude Design project »Detective Game Mobile App« (v5: Komponente, Koraki 1–10, Odrasli in velikosti, Shranjevanje napredka, Start/vaja/konec, Tabla in finale, Onboarding, Landing Page, Helper, Band) is not readable from claude.ai sessions (another organization). Ask for an export into `docs/design/claude-design/`.
- **Access:** the producer's GitHub is linked (2026-11-20); sessions attach the repo with push access.
- **Tests in a Linux session:** `tools/tests/setup.mjs` falls back to `/usr/bin/google-chrome` (or `CHROME`). Known failures there: saybox before 11-26 (run with `TEST_DATE=2026-11-27`) and the »phew« sound checks in muzej/pokal (headless audio).
