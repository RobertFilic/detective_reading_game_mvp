# Lessons: UX reviewer

Read before every task. Add up to 3 lessons after every task: the rule, then — evidence (what happened, where). A lesson confirmed twice moves up to **Rules**; a lesson proved wrong is deleted. Keep this file under ~60 lines. Playtest evidence beats review opinion.

## Rules
- The main button must be visible without scrolling on iPhone SE (375×667) and on a landscape phone (852×393); `tools/shots.mjs` flags it. — the word grid (Bip 4), the lock (Bip 5) and the timeline (Bip 6) all failed this first.

## Lessons
- In the practice case a thick breathing ring plus a bouncing finger made the target obvious; a faint animation was not enough. A group (all the animals) gets the ring without the finger. — tutorial, 2026-10.
- A digit 0 in a monospace font looked like Ø on the lock; use the normal font with tabular numbers. — Bip 5.
- A new card pinned to the corkboard was off-screen to the right; scroll it into view so the child sees it fly in. — Bip 3.
- On a landscape phone, hide the extras (the case question, the »open« toast, the pinned card on the final screen) before shrinking the things the child taps. — Bip 4–6.
- Hide a note once its job is done (the timeline's instructions after the order is right) to make room for the next button. — Bip 6.
