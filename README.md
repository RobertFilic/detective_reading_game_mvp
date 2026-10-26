# Detektivska pisarna

Slovenian detective reading games for children aged 6–9, built as validation prototypes for an iPad.

| Path | Game |
|---|---|
| [`index.html`](index.html) | Start page: pick a game. |
| [`solo/`](solo/) | **Igraj sam:** one child finds the sentence that proves who did it. See [solo/README.md](solo/README.md). |
| [`za-dva/`](za-dva/) | **Igrajta v dvoje:** two children share one iPad, each with a different clue card, and solve the case together. See [za-dva/README.md](za-dva/README.md). |
| [`pekarna/`](pekarna/) | **Pekarna:** a bakery maths game. Pack the order (counting), take the payment (adding prices with coins), give change. No timers; hints grow after each wrong try. Progress is saved on the iPad. |
| [`docs/PLAN.md`](docs/PLAN.md) | Plan for the solo game. The co-op plan is in [za-dva/docs/PLAN.md](za-dva/docs/PLAN.md). |

## Sharing with kids
Send <https://robertfilic.github.io/detective_reading_game_mvp/>. The start page shows only the detective game: **Igraj!** opens `solo/?play`, which skips the adult setup and goes straight to the case board at level A (`KID_LEVEL` in `solo/index.html`). Solved cases keep their ✔ on that phone. Nothing is sent anywhere. The other games are under "Druge igre"; `solo/` without `?play` still opens the adult setup.

## On the iPad
The repo is published with GitHub Pages at <https://robertfilic.github.io/detective_reading_game_mvp/>. Add that address to the Home Screen once: it opens the start page, and from there either game. Open both games once while online, so they also work offline.

Each game has its own on-device log and adult debrief (hold the top-left corner for 3 s). Each setup screen has a "← Izbira igre" button that goes back to the start page.
