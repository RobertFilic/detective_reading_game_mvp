# Lessons: puzzle designer

Read before every task. Add up to 3 lessons after every task: the rule, then — evidence (what happened, where). A lesson confirmed twice moves up to **Rules**; a lesson proved wrong is deleted. Keep this file under ~60 lines. Playtest evidence beats review opinion.

## Rules
- Every puzzle's hint ladder ends in the answer, and a puzzle that depends on an earlier case gives that answer away in its last hint, so skipping a case never blocks a child. — the lock in Bip 5 (h2 says 3-1-4).

## Lessons
- No auto-check while the child turns the lock's wheels or places timeline cards; check only on »Odpri« / »Preveri«. Otherwise trying everything is faster than thinking. — Bip 5, Bip 6.
- In a timeline, near-synonyms (»Potem«, »Nato«) make an order ambiguous unless the content decides it. Use that on purpose for exactly one reasoning step (bring the wire before wrapping it), never by accident. — Bip 6.
- After a wrong timeline check, keep the right cards (green) and send back the wrong ones: the child sees progress without being told the answer. — Bip 6.
- Word search grids need a check for rude words by chance in every row and column, both directions; the checker does it (`BLOCK` in tools/cases.mjs). — Bip 4.
- Design for the smallest screen first: the word grid, the lock and the timeline all needed layout changes to fit iPhone SE and a landscape phone without scrolling to the main button. Put that in every spec. — Bip 4–6.
- Slovenian word order is free, so a torn note can be right in more than one order. Design strips so that the capital letter, the full stop and the meaning force one order, or list every correct order (`also`), and have the Slovenian editor confirm it. — Galeb 4 and 6 design (theory, not playtest yet).
- When a season's skill is a step of its own (UGOVOR), count it as the skill, not a puzzle. Give the case that teaches it no other puzzle. Let the final combine the season's new puzzles at one notch harder, so no brand-new mechanic lands in the final. — Galeb plan; check it at the playtest (hint level on case 1's UGOVOR, the time the final takes).
- Count the words of every draft line with the checker's rule before handing it over (emoji and »…« count as words). Two lines in the Galeb drafts were 9 words, one of them from the pitch. — Galeb, 2026-11-01.
