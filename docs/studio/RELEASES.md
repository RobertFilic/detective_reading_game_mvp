# Release plan

Agreed with the producer on 2026-11-05: one new season a week. A season is built, reviewed and pushed **before** its day with `opens: 'YYYY-MM-DD'` in `FILES`. Until that day the start screen shows its teaser with a countdown; on the day it opens by itself, with no deploy. So a season pushed early is safe, and a late one is the only risk.

| Season | Live on | Pitch | Pushed (with `opens`) by | Release check |
|---|---|---|---|---|
| 🦕 Duh v muzeju | 2026-11-05 (live on push) | 2026-11-05 | 2026-11-05 | – |
| ⚽ Skrivnost zlatega pokala | **2026-11-12** | 2026-11-06 | 2026-11-06 ✅ (built, reviewed, pushed in one day) | 2026-11-12 morning |
| ❄️ Sneženi možje brez sledi | **2026-11-19** | 2026-11-11 (A); B 11-12, C 11-13, D 11-16 | 2026-11-17 | 2026-11-19 morning |

## The steps for each season (docs/studio/README.md has the details)

1. **Pitch** (showrunner) → `docs/studio/seasons/<id>.md` → the producer approves. Nothing is written before that.
2. **Puzzles** (puzzle designer): one puzzle a case, two in the final. A number lock 🔐 in every season (the children's favourite, 2026-11-05).
3. **Writing** (case writers, one case each) into `solo/index.html`; `node tools/cases.mjs` passes.
4. **Review:** the fair-play tester (exactly one answer per case: every alibi covers the deed's time and place; the decoy is never a second answer) and the Slovenian editor, until both pass.
5. **Screens** (UX reviewer): `node tools/shots.mjs <caseId>` on a small phone, an iPad and a landscape phone.
6. **Ship:** the browser tests pass; the season's `FILES` entry gets `teaser`, `opens` and its colour `hue` (0–359; pick one far from the other seasons, see `solo/?ui`), and its line leaves `COMING`; the ledger and the curriculum are updated; commit and push.
7. **Release check** on the day: the live site has the season, the teaser is gone, case 1 opens.

## Fitting a season into the session limit

A whole season in one sitting (pitch → six writers → reviews → UX) ran into the plan's session limit twice (2026-11-05 and 11-06). So a season is spread over **four sittings**, each started in a **fresh Claude session** (a long session re-sends its whole history on every turn, which costs more than the work itself). This file and `docs/studio/seasons/<id>.md` carry everything the next sitting needs.

| Sitting | Steps | Agents (model) |
|---|---|---|
| A · pitch day | 1 pitch → producer approves | showrunner (Opus) |
| B · next day | 2 puzzles, any new mechanic built, 3 writing | puzzle designer (Sonnet), then the developer (Sonnet) builds a new mechanic while **two** case writers write cases 1–3 and 4–6 (Sonnet) |
| C · next day | 4 review and fixes | fair-play tester (Opus) and Slovenian editor (Opus) in parallel; the main session applies small fixes itself instead of sending writers back |
| D · by the push date | 5 screens, 6 ship | UX reviewer (Sonnet, iPhone 14 shots plus new mechanics only); browser tests (`node solo/tools/tests/run.mjs`, about 8 min; a new mechanic gets its own test file there); commit and push |

Each sitting ends with its results written down (the season file, the ledger, this table), so the next one starts cold without re-reading the conversation.

## Timers

The main Claude session sets one-shot timers for each step date above. They live only while that session runs, so this table is the plan of record: if a session is restarted, set them again from here.
