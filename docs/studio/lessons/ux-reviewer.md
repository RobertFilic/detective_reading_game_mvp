# Lessons: UX reviewer

Read before every task. Add up to 3 lessons after every task: the rule, then — evidence (what happened, where). A lesson confirmed twice moves up to **Rules**; a lesson proved wrong is deleted. Keep this file under ~60 lines. Playtest evidence beats review opinion.

## Rules
- The main button must be visible without scrolling on iPhone SE (375×667) and on a landscape phone (852×393); `tools/shots.mjs` flags it. — the word grid (Bip 4), the lock (Bip 5) and the timeline (Bip 6) all failed this first; the geslo strip (Galeb 5) failed it in its done state.
- On a small or landscape screen, hide the extras (the case question, toasts, the pinned card, the rank-up) before shrinking what the child reads or taps. — Bip 4–6; on the final of Galeb 6 (and Bip 6) the reveal sentences shrink to a 32 px scroll box on SE and 11 px in landscape.

## Lessons
- In the practice case a thick breathing ring plus a bouncing finger made the target obvious; a faint animation was not enough. A group (all the animals) gets the ring without the finger. — tutorial, 2026-10.
- A digit 0 in a monospace font looked like Ø on the lock; use the normal font with tabular numbers. — Bip 5.
- A new card pinned to the corkboard was off-screen to the right; scroll it into view so the child sees it fly in. — Bip 3.
- Hide a note once its job is done (the timeline's instructions after the order is right) to make room for the next button. — Bip 6.
- `shots.mjs` only shows first-entered states; drive the done state of every puzzle and the solved screen after its animation with a small puppeteer script (`page.evaluate` + clicks on `data-act`). — Galeb: the off-screen button after the geslo and the hidden final reveal only showed up there.
- After a climax mechanic, test the tap the child will make next with their new belief, and read the feedback it gets. — Galeb 1/3/6: after UGOVOR, »the lie + the liar« in solve says »Ni prav ✖ Ta stavek ne pove, kdo ni bil«, which answers a different question.
- A note that appears above a list pushes every row down, so the next tap can land on another sentence; a stamp laid on a sentence hides the words it judges. Keep notes in a fixed slot and stamps beside the text. — Galeb ❗ UGOVOR step.
- A list that grows with content needs an ordering rule, not a fixed array: the next thing to play goes first, finished things become a compact shelf. Items move only when the child causes it (finishes, starts), never between sessions. A badge like »NOVO« must mean "not started yet", not a content type. — files screen, 2026-11: Galeb (0/6) sat under three finished adventures on iPhone 14 Plus; »NOVO« was tied to `season`, so it stayed on the finished Bip.
