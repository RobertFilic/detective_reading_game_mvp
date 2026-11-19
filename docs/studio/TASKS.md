# Naloge (producer's task list)

The producer's tasks for later sittings. On a ping, read this file together with [RELEASES.md](RELEASES.md) and do what is due. Mark a task ✅ with the date when done.

## 2026-11-20, after 17:00

### Izboljšave: ⚽ Skrivnost zlatega pokala, case 2 (`p2`, Bor in the goat costume), solo/index.html

The producer's notes (2026-11-19), with the line they refer to:

1. **»Kaj je na klopi Reala?« → »Na risbi REAL so bele črke.«** (s9, Pia): oddly worded, unclear, no story behind it. Rewrite the question and the answer so they tell a small, clear thing.
2. **»Kdo si ti na tekmi?«** (s2, Bor's ask): not a good question. Maybe »Kaj delaš na tekmi?«.
3. **»Kaj manjka na malem golu?« → »Na rogu ima Bor kos mreže malega gola.«** (s3, Tone, the proof): the question and the answer don't connect: the question is about the goal, the answer is about Bor. Make the question lead to the answer.
4. **»Jaz sem bela maskota Reala z rogovi!«** (s2): replace with something like »maskota Reala iz Madrida«.
5. **»Na rogu ima kos malega gola«**: which horn? Bor is a person (a boy in a goat costume), so »na rogu« is unclear. Say it is the costume's horn (e.g. »na rogu kostuma«).

How: s3 is the proof and s2/s9 sit next to it, so the fix must keep fair play (one answer, the decoy still not a second answer). Rewrite with the case writer (Opus), then the fair-play tester and the Slovenian editor check `p2`; `node tools/cases.mjs` and `node tools/tests/run.mjs pokal` must pass before the push. Update the ledger row ⚽ p2 if the proof's wording changes.
