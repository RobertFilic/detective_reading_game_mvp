# Release plan

Agreed with the producer on 2026-11-05: one new season a week. A season is built, reviewed and pushed **before** its day with `opens: 'YYYY-MM-DD'` in `FILES`. Until that day the start screen shows its teaser with a countdown; on the day it opens by itself, with no deploy. So a season pushed early is safe, and a late one is the only risk.

| Season | Live on | Pitch | Pushed (with `opens`) by | Release check |
|---|---|---|---|---|
| 🦕 Duh v muzeju | 2026-11-05 (live on push) | 2026-11-05 | 2026-11-05 | – |
| ⚽ Skrivnost zlatega pokala | **2026-11-12** | 2026-11-06 | 2026-11-06 ✅ (built, reviewed, pushed in one day) | 2026-11-12 ✅ (live, teaser gone, case 1 opens) |
| ❄️ Sneženi možje brez sledi | **2026-11-19** | 2026-11-11 (A) ✅ approved; B 11-12, C 11-13, D 11-16 | 2026-11-17 | 2026-11-19 morning |

## The steps for each season (docs/studio/README.md has the details)

1. **Brief and pitch:** the editorial director writes the season brief (section 0 of `docs/studio/seasons/<id>.md`), the showrunner pitches inside it, the director checks the pitch against the brief → the producer approves. Nothing is written before that.
2. **Puzzles** (puzzle designer): one puzzle a case, two in the final. A number lock 🔐 in every season (the children's favourite, 2026-11-05).
3. **Writing** (case writers, one case each) into `solo/index.html`; `node tools/cases.mjs` passes.
4. **Review:** the fair-play tester (exactly one answer per case: every alibi covers the deed's time and place; the decoy is never a second answer), the Slovenian editor and the book editor (the fun checklist). Fix every 🔴 and 🟠 (or record why not in »Decisions«), at most two rounds.
5. **Screens** (UX reviewer): `node tools/shots.mjs <caseId>` on a small phone, an iPad and a landscape phone.
6. **Ship:** the browser tests pass; the season's `FILES` entry gets `teaser`, `opens` and its colour `hue` (0–359; pick one far from the other seasons, see `solo/?ui`), and its line leaves `COMING`; the ledger and the curriculum are updated; commit and push.
7. **Release check** on the day: the live site has the season, the teaser is gone, case 1 opens.

## Fitting a season into the session limit

A whole season in one sitting (pitch → six writers → reviews → UX) ran into the plan's session limit twice (2026-11-05 and 11-06). So a season is spread over **four sittings**, each started in a **fresh Claude session** (a long session re-sends its whole history on every turn, which costs more than the work itself). This file and `docs/studio/seasons/<id>.md` carry everything the next sitting needs.

| Sitting | Steps | Agents (model) |
|---|---|---|
| A · pitch day | 1 brief, pitch, check → producer approves | editorial director (Sonnet), then the showrunner (Opus) |
| B · next day | 2 puzzles, any new mechanic built, 3 writing | puzzle designer (Sonnet), then the developer (Sonnet) builds a new mechanic while **two** case writers write cases 1–3 and 4–6 (Sonnet) |
| C · next day | 4 review and fixes | fair-play tester (Opus), Slovenian editor (Opus) and book editor (Sonnet) in parallel; the main session applies small fixes itself instead of sending writers back |
| D · by the push date | 5 screens, 6 ship | UX reviewer (Sonnet, iPhone 14 shots plus new mechanics only); browser tests (`node solo/tools/tests/run.mjs`, about 8 min; a new mechanic gets its own test file there); commit and push |

Each sitting ends with its results written down (the season file, the ledger, this table), so the next one starts cold without re-reading the conversation.

## When the producer pings

There are no timers. The producer pings a session (»check the releases«, »what's due?«), and the main session:
1. Reads this file and compares today's date with the tables above.
2. Does what is due: a sitting whose day has come (A–D, in order; a sitting is never skipped), or the release check on a season's day.
3. Writes the result back here (the table's dates and ✅), so the next ping starts from this file alone.

If a step is late, it says so and does the earliest open step first.
