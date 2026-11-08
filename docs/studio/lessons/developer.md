# Lessons: developer

Read before every task. Add up to 3 lessons after every task: the rule, then — evidence (what happened, where). A lesson confirmed twice moves up to **Rules**; a lesson proved wrong is deleted. Keep this file under ~60 lines.

## Rules
- A grid inside a scrolling box shrinks its rows to the items' `min-height` when the box is short, and the text spills out of the cards: give it `grid-auto-rows: max-content`. — the case board on an iPhone 12 Pro with bigger Safari text, 2026-11-08; reproduced with a 340 px viewport.

## Lessons
- `grep` a class name before using it: the ⏰ step first used `.wwrap`, which the word search already had, and inherited its centring and stamp size. — ⏰ Kdaj?, 2026-11.
- `render()` replaces the whole page, so a scroll box jumps to the top after every tap; keep its `scrollTop` across the render (as `.kdwrap` does). — ⏰ Kdaj?, 2026-11.
- When a card is picked, a tap on an already placed card in a band must count as a tap on that band, or the full band can't take new cards. — ⏰ Kdaj?, 2026-11.
- A button that names the next step (»Kam kaže sled? 🧭«) reads to a child like a riddle to answer; the forward button is always »Naprej 👉« and the next step's card explains. A waiting button says what's left (»Še 1 stvar 👆«). — the producer, Duh v muzeju m1, 2026-11-08.
- Several headless Chromes closing at once sometimes never confirm; `tools/tests/setup.mjs` limits close to 15 s. Run tests through `run.mjs`, not by hand in parallel. — 2026-11-08.
