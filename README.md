# Detektivska pisarna

A Slovenian detective reading game for children aged 6–9, built as a validation prototype for an iPad.

| Path | Game |
|---|---|
| [`index.html`](index.html) | Start page. |
| [`solo/`](solo/) | **Igraj sam:** one child finds the sentence that proves who did it. See [solo/README.md](solo/README.md). |
| [`kje-je-kdo/`](kje-je-kdo/) | **Kje je kdo?:** a side puzzle (Murdoku for kids). Read where each person was, place everyone in the house (one per row and column), and find who was alone with the missing thing. 2 puzzles, linked from a tile on the start page. Plan: [docs/KJE_JE_KDO.md](docs/KJE_JE_KDO.md). Checker: `node solo/tools/kjekdo.mjs`. |
| [`zasebnost/`](zasebnost/) | **Zasebnost in pogoji:** privacy policy and terms of use for parents, on one page. Linked from the start page and the adult screens. Background and open points: [docs/LEGAL.md](docs/LEGAL.md). |
| [`docs/PLAN.md`](docs/PLAN.md) | Plan for the solo game. |
| [`docs/studio/`](docs/studio/README.md) | **The studio:** six Claude Code agents (`.claude/agents/`: showrunner, case writer, puzzle designer, fair-play tester, Slovenian editor, UX reviewer) that make new seasons, with the story bible, the difficulty curriculum, the ledger of what's been used, playtest notes, and each agent's lessons. |

## Sharing with kids
Send <https://robertfilic.github.io/detective_reading_game_mvp/>. The start page shows only the detective game: **Igraj!** opens `solo/?play`, which skips the adult setup and goes straight to the case board at level A (`KID_LEVEL` in `solo/index.html`). Solved cases keep their ✔ on that phone. Names and progress stay on the device; the start page and the solo game send only anonymous Cloudflare visit counts. "Za odrasle" has "Igraj sam" (`solo/` without `?play`, which opens the adult setup).

## On the iPad
The repo is published with GitHub Pages at <https://robertfilic.github.io/detective_reading_game_mvp/>. Add that address to the Home Screen once: it opens the start page, and from there the game. The icon opens `home/` (the manifest's `start_url`), which goes straight on to the start page; in Cloudflare Web Analytics, visits to `/home/` are launches from the Home Screen icon. Icons added before this change open the start page directly and are not counted there. Open the game once while online, so they also work offline.

The game has an on-device log and adult debrief (hold the top-left corner for 3 s). In the debrief, **Izvozi JSON** saves everything on the device (all detectives, solved cases, the log) to a file, and **Uvozi JSON** brings such a file onto another device or address, e.g. after a move to a custom domain. **📱 QR prenos** shows a QR code with every detective's progress (not the log): the other device opens it with its camera, or, for a Home Screen app, with **📷 Skeniraj kodo** in its own debrief. The QR libraries are in `solo/vendor/` and load only when used.
