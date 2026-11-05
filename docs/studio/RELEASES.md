# Release plan

Agreed with the producer on 2026-11-05: one new season a week. A season is built, reviewed and pushed **before** its day with `opens: 'YYYY-MM-DD'` in `FILES`. Until that day the start screen shows its teaser with a countdown; on the day it opens by itself, with no deploy. So a season pushed early is safe, and a late one is the only risk.

| Season | Live on | Pitch | Pushed (with `opens`) by | Release check |
|---|---|---|---|---|
| 🦕 Duh v muzeju | 2026-11-05 (live on push) | 2026-11-05 | 2026-11-05 | – |
| ⚽ Skrivnost zlatega pokala | **2026-11-12** | 2026-11-06 | 2026-11-10 | 2026-11-12 morning |
| ❄️ Sneženi možje brez sledi | **2026-11-19** | 2026-11-11 | 2026-11-17 | 2026-11-19 morning |

## The steps for each season (docs/studio/README.md has the details)

1. **Pitch** (showrunner) → `docs/studio/seasons/<id>.md` → the producer approves. Nothing is written before that.
2. **Puzzles** (puzzle designer): one puzzle a case, two in the final. A number lock 🔐 in every season (the children's favourite, 2026-11-05).
3. **Writing** (case writers, one case each) into `solo/index.html`; `node tools/cases.mjs` passes.
4. **Review:** the fair-play tester (exactly one answer per case: every alibi covers the deed's time and place; the decoy is never a second answer) and the Slovenian editor, until both pass.
5. **Screens** (UX reviewer): `node tools/shots.mjs <caseId>` on a small phone, an iPad and a landscape phone.
6. **Ship:** the browser tests pass; the season's `FILES` entry gets `teaser` and `opens`, and its line leaves `COMING`; the ledger and the curriculum are updated; commit and push.
7. **Release check** on the day: the live site has the season, the teaser is gone, case 1 opens.

## Timers

The main Claude session sets one-shot timers for each step date above. They live only while that session runs, so this table is the plan of record: if a session is restarted, set them again from here.
